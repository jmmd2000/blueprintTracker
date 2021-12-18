#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Gun = require("./models/gun");
var Game = require("./models/game");
var WeaponClass = require("./models/weaponClass");
var Blueprint = require("./models/blueprint");
// var Gunlist = require('./models/gunlist')
var Attachment = require("./models/attachment");
var AttachmentCategory = require("./models/attachmentCategory");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var guns = [];
var games = [];
var weaponClasses = [];
var blueprints = [];
var a = [];
var attachmentCategories = [];

function gameCreate(title, cb) {
  gamedetail = {
    title: title,
  };

  var game = new Game(gamedetail);

  game.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Game: " + game);
    console.log(" ");
    games.push(game);
    cb(null, game);
  });
}

function weaponClassCreate(title, game, cb) {
  wcdetail = {
    title: title,
    game: game,
  };

  var weaponClass = new WeaponClass(wcdetail);

  weaponClass.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Weapon Class: " + weaponClass);
    console.log(" ");
    weaponClasses.push(weaponClass);
    cb(null, weaponClass);
  });
}

function gunCreate(title, description, weaponClass, image, comp, primary, cb) {
  gundetail = {
    title: title,
    description: description,
    weaponClass: weaponClass,
    image: image,
    compatible: comp,
    primary: primary,
  };

  var gun = new Gun(gundetail);

  gun.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Gun: " + gun);
    console.log(" ");
    guns.push(gun);
    cb(null, gun);
  });
}

function bpCreate(
  title,
  description,
  weaponBase,
  weaponClass,
  attachments,
  warzone,
  cb
) {
  bpdetail = {
    title: title,
    description: description,
    weaponBase: weaponBase,
    weaponClass: weaponClass,
    attachments: attachments,
    warzone: warzone,
  };

  var bp = new Blueprint(bpdetail);

  bp.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Blueprint: " + bp);
    console.log(" ");
    blueprints.push(bp);
    cb(null, bp);
  });
}

function attCreate(title, atc, cb) {
  attdetail = {
    title: title,
    attachmentCategory: atc,
  };

  var att = new Attachment(attdetail);

  att.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Attachment: " + att);
    console.log(" ");
    a.push(att);
    cb(null, att);
  });
}

function attcatCreate(title, game, secondary, cb) {
  attcatdetail = {
    title: title,
    game: game,
    secondary: secondary,
  };

  var attcat = new AttachmentCategory(attcatdetail);

  attcat.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Attachment Category: " + attcat);
    console.log(" ");
    attachmentCategories.push(attcat);
    cb(null, attcat);
  });
}

function createGuns(cb) {
  async.series(
    [
      function (callback) {
        gunCreate(
          "STG-44",
          "Versatile assault rifle adaptable to any situation.",
          weaponClasses[0],
          "stg44.jpg",
          [
            a[0],
            a[1],
            a[2],
            a[3],
            a[4],
            a[5],
            a[6],
            a[7],
            a[9],
            a[11],
            a[12],
            a[14],
            a[16],
            a[18],
            a[19],
          ],
          true,
          callback
        );
      },
      function (callback) {
        gunCreate(
          "Volk",
          "Quick and mobile, this is the lightest automatic rifle, allowing great movement but with low control.",
          weaponClasses[0],
          "volk.jpg",
          [
            a[1],
            a[2],
            a[4],
            a[5],
            a[7],
            a[8],
            a[10],
            a[11],
            a[13],
            a[14],
            a[16],
            a[17],
            a[19],
          ],
          true,
          callback
        );
      },
      function (callback) {
        gunCreate(
          "Kar-98k",
          "A balanced bolt action sniper rifle, this gun can kill with a single shot at long range and has generally low mobility.",
          weaponClasses[1],
          "kar98k.jpg",
          [
            a[1],
            a[3],
            a[4],
            a[6],
            a[7],
            a[8],
            a[13],
            a[15],
            a[16],
            a[18],
            a[19],
          ],
          true,
          callback
        );
      },
      function (callback) {
        gunCreate(
          "Double Barrel",
          "Break-action shotgun with a fast rate of fire. Effective at close range.",
          weaponClasses[2],
          "double-barrel.jpg",
          [a[5], a[6], a[8], a[12], a[14], a[16], a[18], a[19]],
          true,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createGame(cb) {
  async.series(
    [
      function (callback) {
        gameCreate("Vanguard", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createClasses(cb) {
  async.series(
    [
      function (callback) {
        weaponClassCreate("Assault Rifles", games[0], callback);
      },
      function (callback) {
        weaponClassCreate("Sniper Rifles", games[0], callback);
      },
      function (callback) {
        weaponClassCreate("Shotguns", games[0], callback);
      },
    ],
    // optional callback
    cb
  );
}

function createAttCat(cb) {
  async.series(
    [
      function (callback) {
        attcatCreate("Optic", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Muzzle", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Barrel", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Underbarrel", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Stock", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Magazine", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Ammo Type", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Rear Grip", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Proficiency", games[0], false, callback);
      },
      function (callback) {
        attcatCreate("Kit", games[0], false, callback);
      },
    ],
    // optional callback
    cb
  );
}

function createAtt(cb) {
  async.series(
    [
      function (callback) {
        attCreate("2x Scope", [attachmentCategories[0]], callback);
      },
      function (callback) {
        attCreate("3x Scope", [attachmentCategories[0]], callback);
      },
      function (callback) {
        attCreate("Short", [attachmentCategories[1]], callback);
      },
      function (callback) {
        attCreate("Silencer", [attachmentCategories[1]], callback);
      },
      function (callback) {
        attCreate("Heavy", [attachmentCategories[2]], callback);
      },
      function (callback) {
        attCreate("Light", [attachmentCategories[2]], callback);
      },
      function (callback) {
        attCreate("Speed", [attachmentCategories[3]], callback);
      },
      function (callback) {
        attCreate("Bipod", [attachmentCategories[3]], callback);
      },
      function (callback) {
        attCreate("Wire", [attachmentCategories[4]], callback);
      },
      function (callback) {
        attCreate("Thick", [attachmentCategories[4]], callback);
      },
      function (callback) {
        attCreate("20 round", [attachmentCategories[5]], callback);
      },
      function (callback) {
        attCreate("30 round", [attachmentCategories[5]], callback);
      },
      function (callback) {
        attCreate("Fire rounds", [attachmentCategories[6]], callback);
      },
      function (callback) {
        attCreate("FMJ rounds", [attachmentCategories[6]], callback);
      },
      function (callback) {
        attCreate("Rubber", [attachmentCategories[7]], callback);
      },
      function (callback) {
        attCreate("Tape", [attachmentCategories[7]], callback);
      },
      function (callback) {
        attCreate("Fast Sprint", [attachmentCategories[8]], callback);
      },
      function (callback) {
        attCreate("Strength", [attachmentCategories[8]], callback);
      },
      function (callback) {
        attCreate("Sleight of Hand", [attachmentCategories[9]], callback);
      },
      function (callback) {
        attCreate("Quick Fix", [attachmentCategories[9]], callback);
      },
    ],
    // optional callback
    cb
  );
}

function createBlueprints(cb) {
  async.series(
    [
      function (callback) {
        bpCreate(
          "STG 1",
          "bp1",
          guns[0],
          weaponClasses[0],
          [a[0], a[3], a[5], a[7], a[9], a[12], a[16], a[19]],
          true,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "STG 2",
          "bp2",
          guns[0],
          weaponClasses[0],
          [a[1], a[2], a[4], a[6], a[11], a[14], a[18]],
          true,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "Volk 1",
          "bp3",
          guns[1],
          weaponClasses[0],
          [a[2], a[5], a[7], a[11], a[14], a[16]],
          false,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "Volk 2",
          "bp4",
          guns[1],
          weaponClasses[0],
          [a[1], a[4], a[8], a[10], a[13], a[17], a[19]],
          false,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "Kar 1",
          "bp5",
          guns[2],
          weaponClasses[1],
          [a[1], a[3], a[4], a[7], a[8], a[13], a[15], a[16], a[19]],
          true,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "Kar 2",
          "bp6",
          guns[2],
          weaponClasses[1],
          [a[6], a[18]],
          false,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "DoubleBarrel 1",
          "bp7",
          guns[3],
          weaponClasses[2],
          [a[6], a[12], a[16], a[19]],
          false,
          callback
        );
      },
      function (callback) {
        bpCreate(
          "DoubleBarrel 2",
          "bp8",
          guns[3],
          weaponClasses[2],
          [a[5], a[8], a[14], a[18]],
          false,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [
    createGame,
    createClasses,
    createAttCat,
    createAtt,
    createGuns,
    createBlueprints,
  ],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Blueprints: " + blueprints);
    }

    //  All done, disconnect from database
    mongoose.connection.close();
  }
);

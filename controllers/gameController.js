var Blueprint = require("../models/blueprint");
var Att = require("../models/attachment");
var AttCat = require("../models/attachmentCategory");
var WepClass = require("../models/weaponClass");
var Gun = require("../models/gun");
var Game = require("../models/game");
var async = require("async");

const {
  body,
  validationResult
} = require("express-validator");

exports.game_list = function (req, res, next) {
  async.parallel({
      games: function (callback) {
        Game.find()
          .sort([
            ["title", "ascending"]
          ])
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("games/game_list", {
        title: "Games",
        games: results.games,
      });
    }
  );
};

// Display detail page for a specific attachment.
exports.game_detail = function (req, res, next) {
  async.parallel({
      att: function (callback) {
        Att.find().exec(callback);
      },
      guns: function (callback) {
        Gun.find().exec(callback);
      },
      blueprints: function (callback) {
        Blueprint.find().exec(callback);
      },
      attcats: function (callback) {
        AttCat.find({
            game: req.params.id,
          },
          "title url game"
        ).exec(callback);
      },
      wepclasses: function (callback) {
        WepClass.find({
            game: req.params.id,
          },
          "title url game"
        ).exec(callback);
      },
      game: function (callback) {
        Game.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.att == null) {
        // No results.
        var err = new Error("Game not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("games/game_detail", {
        title: "Game Info",
        att: results.att,
        guns: results.guns,
        blueprints: results.blueprints,
        attcats: results.attcats,
        wepclasses: results.wepclasses,
        game: results.game
      });
    }
  );
};


exports.game_create_get = function (req, res, next) {

  res.render("games/new_game", {
    title: "Add new game",
  });

};

// Handle Author create on POST.
exports.game_create_post = [
  // Validate and sanitize fields.
  body("game_name", "Game name must not be empty.")
  .trim()
  .isLength({
    min: 1
  })
  .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Convert the genre to an array.
    // Create Author object with escaped and trimmed data
    var game = new Game({
      title: req.body.game_name,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("new_game", {
        title: "Add new game",
        game_name: game_name,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      game.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new author record.
        res.redirect(game.url);
      });
    }
  },
];

// Display Attachment delete form on GET.
exports.game_delete_get = function (req, res, next) {
  async.parallel({

      atts: function (callback) {
        Att.find()
          .populate('_id')
          .populate('attachmentCategory')
          .populate('title')
          .exec(callback);
      },
      guns: function (callback) {
        Gun.find()
          .populate('title')
          .populate('description')
          .populate('weaponClass')
          .populate('compatible')
          .exec(callback);
      },
      blueprints: function (callback) {
        Blueprint.find().populate('weaponClass').exec(callback);
      },
      attcats: function (callback) {
        AttCat.find({
            game: req.params.id,
          },
          "title url game"
        ).exec(callback);
      },
      wepclasses: function (callback) {
        WepClass.find({
            game: req.params.id,
          },
          "title url game"
        ).exec(callback);
      },
      game: function (callback) {
        Game.findById(req.params.id).exec(callback);
      },


    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results.
        res.redirect("/tracker/guns");
      }
      // Successful, so render.
      res.render("games/game_delete", {
        title: "Delete Game",
        atts: results.atts,
        guns: results.guns,
        blueprints: results.blueprints,
        attcats: results.attcats,
        wepclasses: results.wepclasses,
        game: results.game
      });
    }
  );
};

// Handle Author delete on POST.
exports.game_delete_post = function (req, res, next) {
  async.parallel({
      game: function (callback) {
        Game.findById(req.body.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success.

      // Author has no books. Delete object and redirect to the list of authors.
      Game.findByIdAndRemove(req.body.id, function deleteAttachment(err) {
        if (err) {
          return next(err);
        }
        // Success - go to author list.
        res.redirect("/tracker/games");
      });

    }
  );
};

exports.game_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel({
      game: function (callback) {
        Game.findById(req.params.id)
          .populate("title")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results.
        var err = new Error("Game not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("games/new_game", {
        title: "Update game",
        game: results.game,
      });
    }
  );
};

// Handle Author update on POST.
exports.game_update_post = [


  // Validate and sanitize fields.
  body("game_name", "Game name must not be empty.")
  .trim()
  .isLength({
    min: 1
  })
  .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Convert the genre to an array.
    // Create Author object with escaped and trimmed data
    var game = new Game({
      title: req.body.game_name,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("games/new_game", {
        title: "Update game",
        game_name: game_name,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Game.findByIdAndUpdate(req.params.id, game, {}, function (err, gamee) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to attachment detail page.
        res.redirect(gamee.url);
      });
    }
  },
];
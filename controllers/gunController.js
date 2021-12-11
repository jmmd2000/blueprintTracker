var Gun = require("../models/gun");
var Game = require("../models/game");
var async = require("async");
var Blueprint = require("../models/blueprint");
var AttCat = require("../models/attachmentCategory");
var Att = require("../models/attachment");
var WepClass = require("../models/weaponClass");

const { body, validationResult } = require("express-validator");
const gun = require("../models/gun");

// Display list of all Guns.
exports.gun_list = function (req, res, next) {
  async.parallel(
    {
      guns: function (callback) {
        Gun.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },

      weaponClasses: function (callback) {
        WepClass.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },

      games: function (callback) {
        Game.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("gun/gun_list", {
        title: "Gun List",
        guns: results.guns,
        weaponClasses: results.weaponClasses,
        games: results.games,
      });
    }
  );
};

// Display detail page for a specific Gun.
exports.gun_detail = function (req, res, next) {
  async.parallel(
    {
      gun: function (callback) {
        Gun.findById(req.params.id)
          .populate("title")
          .populate("description")
          .populate("weaponClass")
          .populate("image")
          .populate("compatible")
          .exec(callback);
      },
      guns_blueprints: function (callback) {
        Blueprint.find(
          {
            weaponBase: req.params.id,
          },
          "title description"
        ).exec(callback);
      },
      attcats: function (callback) {
        AttCat.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.gun == null) {
        // No results.
        var err = new Error("Gun not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("gun/gun_detail", {
        title: "Gun Info",
        gun: results.gun,
        guns_blueprints: results.guns_blueprints,
        attcats: results.attcats,
      });
    }
  );
};

exports.pre_gun_create_get = function (req, res, next) {
  async.parallel(
    {
      games: function (callback) {
        Game.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("gun/pre_form", {
        title: "Choose a game",
        games: results.games,
      });
    }
  );
};

exports.gun_create_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      wcs: function (callback) {
        WepClass.find(callback);
      },
      atts: function (callback) {
        Att.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },
      cats: function (callback) {
        AttCat.find(callback);
      },
      game: function (callback) {
        Game.findById(req.params.id).populate("title").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("gun/gun_form", {
        title: "Create Gun",
        wcs: results.wcs,
        atts: results.atts,
        cats: results.cats,
        game: results.game,
      });
    }
  );
};

// Handle Author create on POST.
exports.gun_create_post = [
  // Attachments
  (req, res, next) => {
    if (!(req.body.compatible instanceof Array)) {
      if (typeof req.body.compatible === "undefined") req.body.compatible = [];
      else req.body.compatible = new Array(req.body.compatible);
    }
    next();
  },

  // Validate and sanitize fields.
  body("gun_name", "Name must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("gun_class", "Class must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("compatible.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var gun = new Gun({
      title: req.body.gun_name,
      description: req.body.gun_des,
      weaponClass: req.body.gun_class,
      image: req.body.gun_img,
      compatible: req.body.compatible,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          weaponClasses: function (callback) {
            WepClass.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render("gun/gun_form", {
            title: "Create Gun",
            wcs: results.weaponClasses,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      gun.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new book record.
        res.redirect(gun.url);
      });
    }
  },
];

// Display Author delete form on GET.
exports.gun_delete_get = function (req, res, next) {
  async.parallel(
    {
      gun: function (callback) {
        Gun.findById(req.params.id).exec(callback);
      },
      blueprints: function (callback) {
        Blueprint.find({
          weaponBase: req.params.id,
        }).exec(callback);
      },
      wepclasses: function (callback) {
        WepClass.find({}).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.gun == null) {
        // No results.
        res.redirect("/tracker/guns");
      }
      // Successful, so render.
      res.render("gun/gun_delete", {
        title: "Delete Gun",
        gun: results.gun,
        blueprints: results.blueprints,
        wepclasses: results.wepclasses,
      });
    }
  );
};

// Handle Author delete on POST.
exports.gun_delete_post = function (req, res, next) {
  async.parallel(
    {
      gun: function (callback) {
        Gun.findById(req.body.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } else {
        // Delete object and redirect to the list of guns.
        Gun.findByIdAndRemove(req.body.id, function deleteGun(err) {
          if (err) {
            return next(err);
          }
          // Success - go to gun list.
          res.redirect("/tracker/guns");
        });
      }
    }
  );
};

exports.gun_update_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      wcs: function (callback) {
        WepClass.find(callback);
      },
      atts: function (callback) {
        Att.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },
      cats: function (callback) {
        AttCat.find(callback);
      },
      game: function (callback) {
        Game.findById(req.params.gameid).populate("title").exec(callback);
      },
      gun: function (callback) {
        Gun.findById(req.params.id)
          .populate("title")
          .populate("description")
          .populate("weaponClass")
          .populate("image")
          .populate("compatible")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (gun == null) {
        // No results.
        var err = new Error("Gun not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (
        var all_a_iter = 0;
        all_a_iter < results.gun.compatible.length;
        all_a_iter++
      ) {
        for (
          var gun_a_iter = 0;
          gun_a_iter < results.gun.compatible.length;
          gun_a_iter++
        ) {
          if (
            results.gun.compatible[all_a_iter]._id.toString() ===
            results.gun.compatible[gun_a_iter]._id.toString()
          ) {
            results.gun.compatible[all_a_iter].checked = "true";
          }
        }
      }
      res.render("gun/gun_form", {
        title: "Update Gun",
        wcs: results.wcs,
        atts: results.atts,
        cats: results.cats,
        game: results.game,
        gun: results.gun,
      });
    }
  );
};

exports.gun_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!(req.body.compatible instanceof Array)) {
      if (typeof req.body.compatible === "undefined") req.body.compatible = [];
      else req.body.compatible = new Array(req.body.compatible);
    }
    next();
  },

  // Validate and santitize fields.
  body("gun_name", "Gun name must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("gun_des", "Author must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("gun_class", "Summary must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("gun_img", "ISBN must not be empty")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("compatible.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var gun = new Gun({
      title: req.body.gun_name,
      description: req.body.gun_des,
      weaponClass: req.body.gun_class,
      image: req.body.gun_img,
      compatible:
        typeof req.body.compatible === "undefined" ? [] : req.body.compatible,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      async.parallel(
        {
          wcs: function (callback) {
            WepClass.find(callback);
          },
          atts: function (callback) {
            Att.find(callback);
          },
          cats: function (callback) {
            AttCat.find(callback);
          },
          game: function (callback) {
            Game.findById(req.params.gameid).populate("title").exec(callback);
          },
          gun: function (callback) {
            Gun.findById(req.params.id).populate("title").exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.gun.compatible.length; i++) {
            if (
              results.gun.compatible.indexOf(results.gun.compatible[i]._id) > -1
            ) {
              results.gun.compatible[i].checked = "true";
            }
          }
          res.render("gun/gun_form", {
            title: "Update Gun",
            wcs: results.wcs,
            atts: results.atts,
            cats: results.cats,
            game: results.game,
            gun: results.gun,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Gun.findByIdAndUpdate(req.params.id, gun, {}, function (err, gunn) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(gunn.url);
      });
    }
  },
];

var Gun = require("../models/gun");
var Game = require("../models/game");
var Blueprint = require("../models/blueprint");
var WepClass = require("../models/weaponClass");
var Att = require("../models/attachment");
var AttCat = require("../models/attachmentCategory");

const { body, validationResult } = require("express-validator");

var async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      games: function (callback) {
        Game.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },
      guns: function (callback) {
        Gun.find().exec(callback);
      },
      blueprints: function (callback) {
        Gun.find().exec(callback);
      },
      atts: function (callback) {
        Gun.find().exec(callback);
      },
      game_count: function (callback) {
        Game.countDocuments({}, callback);
      },
      weaponClass_count: function (callback) {
        WepClass.countDocuments({}, callback);
      },
      blueprint_count: function (callback) {
        Blueprint.countDocuments({}, callback);
      },
      gun_count: function (callback) {
        Gun.countDocuments({}, callback);
      },
      att_count: function (callback) {
        Att.countDocuments({}, callback);
      },
      attcat_count: function (callback) {
        AttCat.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Blueprint Tracker",
        error: err,
        data: results,
        games: results.games,
      });
    }
  );
};

// Display list of all Blueprints.
exports.bp_list = function (req, res, next) {
  async.parallel(
    {
      bps: function (callback) {
        Blueprint.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },

      weaponClasses: function (callback) {
        WepClass.find()
          .sort([["title", "ascending"]])
          .exec(callback);
      },
      guns: function (callback) {
        Gun.find()
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
      res.render("blueprints/bp_list", {
        title: "Blueprint List",
        bps: results.bps,
        weaponClasses: results.weaponClasses,
        guns: results.guns,
        games: results.games,
      });
    }
  );
};

// Display detail page for a specific Author.
exports.bp_detail = function (req, res, next) {
  async.parallel(
    {
      bp: function (callback) {
        Blueprint.findById(req.params.id)
          .populate("title")
          .populate("description")
          .populate("weaponBase")
          .populate("weaponClass")
          .populate("attachments")
          .exec(callback);
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
      if (results.bp == null) {
        // No results.
        var err = new Error("Blueprint not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("blueprints/bp_detail", {
        title: "Blueprint Info",
        bp: results.bp,
        attcats: results.attcats,
      });
    }
  );
};

exports.pre_bp_create_get = function (req, res, next) {
  async.parallel(
    {
      guns: function (callback) {
        Gun.find(callback);
      },
      games: function (callback) {
        Game.find(callback);
      },
      wcs: function (callback) {
        WepClass.find().populate("game").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("blueprints/pre_bp_form", {
        title: "Choose a gun",
        guns: results.guns,
        games: results.games,
        wcs: results.wcs,
      });
    }
  );
};

// Display book create form on GET.
exports.bp_create_get = function (req, res, next) {
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
        Game.find().populate("title").exec(callback);
      },
      gun: function (callback) {
        Gun.findById(req.params.id)
          .populate("title")
          .populate("compatible")
          .populate("weaponClass")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("blueprints/bp_form", {
        title: "Create Blueprint",
        wcs: results.wcs,
        atts: results.atts,
        cats: results.cats,
        game: results.game,
        gun: results.gun,
      });
    }
  );
};

// Handle book create on POST.
exports.bp_create_post = [
  // Attachments
  (req, res, next) => {
    if (!(req.body.attachments instanceof Array)) {
      if (typeof req.body.attachments === "undefined")
        req.body.attachments = [];
      else req.body.attachments = new Array(req.body.attachments);
    }
    next();
  },

  // Validate and sanitize fields.
  body("bp_name", "Name must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("attachments.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var bp = new Blueprint({
      title: req.body.bp_name,
      description: req.body.bp_des,
      weaponBase: req.body.bp_base,
      weaponClass: req.body.bp_wc,
      attachments: req.body.attachments,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
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
            Game.find().populate("title").exec(callback);
          },
          gun: function (callback) {
            Gun.findById(req.params.id)
              .populate("title")
              .populate("compatible")
              .populate("weaponClass")
              .exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render("blueprints/bp_form", {
            title: "Create Blueprint",
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
      // Data from form is valid. Save book.
      bp.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new book record.
        res.redirect(bp.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.bp_delete_get = function (req, res, next) {
  async.parallel(
    {
      bp: function (callback) {
        Blueprint.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.bp == null) {
        // No results.
        res.redirect("/tracker/blueprints");
      }
      // Successful, so render.
      res.render("blueprints/bp_delete", {
        title: "Delete Blueprint",
        bp: results.bp,
      });
    }
  );
};

// Handle book delete on POST.
exports.bp_delete_post = function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      bp: function (callback) {
        Blueprint.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      // Delete object and redirect to the list of blueprints.
      Blueprint.findByIdAndRemove(req.body.id, function deleteBlueprint(err) {
        if (err) {
          return next(err);
        }
        // Success - got to blueprints list.
        res.redirect("/tracker/blueprints");
      });
    }
  );
};

// Display book update form on GET.
exports.bp_update_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
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
        Game.find().populate("title").exec(callback);
      },
      bp: function (callback) {
        Blueprint.findById(req.params.id)
          .populate("title")
          .populate("description")
          .populate("weaponBase")
          .populate("weaponClass")
          .populate("attachments")
          .exec(callback);
      },
      gun: function (callback) {
        Gun.findById(req.params.gunid)
          .populate("title")
          .populate("description")
          .populate("weaponClass")
          .populate("compatible")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // if (bp == null) { // No results.
      //     var err = new Error('Blueprint not found');
      //     err.status = 404;
      //     return next(err);
      // }
      // Success.
      // Mark our selected genres as checked.
      for (
        var all_a_iter = 0;
        all_a_iter < results.bp.attachments.length;
        all_a_iter++
      ) {
        for (
          var bp_a_iter = 0;
          bp_a_iter < results.bp.attachments.length;
          bp_a_iter++
        ) {
          if (
            results.bp.attachments[all_a_iter]._id.toString() ===
            results.bp.attachments[bp_a_iter]._id.toString()
          ) {
            results.bp.attachments[all_a_iter].checked = "true";
          }
        }
      }
      res.render("blueprints/bp_form", {
        title: "Update Blueprint",
        wcs: results.wcs,
        atts: results.atts,
        cats: results.cats,
        game: results.game,
        bp: results.bp,
        gun: results.gun,
      });
    }
  );
};

// Handle book update on POST.
exports.bp_update_post = [
  // Attachments
  (req, res, next) => {
    if (!(req.body.attachments instanceof Array)) {
      if (typeof req.body.attachments === "undefined")
        req.body.attachments = [];
      else req.body.attachments = new Array(req.body.attachments);
    }
    next();
  },

  // Validate and sanitize fields.
  body("bp_name", "Name must not be empty.")
    .trim()
    .isLength({
      min: 1,
    })
    .escape(),
  body("attachments.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var bp = new Blueprint({
      title: req.body.bp_name,
      description: req.body.bp_des,
      weaponBase: req.body.bp_base,
      weaponClass: req.body.bp_wc,
      attachments:
        typeof req.body.attachments === "undefined" ? [] : req.body.attachments,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
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
            Game.find().populate("title").exec(callback);
          },
          gun: function (callback) {
            Gun.findById(req.params.id)
              .populate("title")
              .populate("compatible")
              .populate("weaponClass")
              .exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render("blueprints/bp_form", {
            title: "Create Blueprint",
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
      Blueprint.findByIdAndUpdate(req.params.id, bp, {}, function (err, bpp) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(bpp.url);
      });
    }
  },
];

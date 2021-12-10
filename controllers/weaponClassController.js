var Blueprint = require("../models/blueprint");
var Att = require("../models/attachment");
var AttCat = require("../models/attachmentCategory");
var WepClass = require('../models/weaponClass');
var Game = require('../models/game');
var Gun = require("../models/gun");
var async = require("async");

const {
  body,
  validationResult
} = require("express-validator");

// Display detail page for a specific attachment.
exports.wc_detail = function (req, res, next) {
  async.parallel({
      guns: function (callback) {
        Gun.find({
            'weaponClass': req.params.id
          }, 'title weaponClass description')
          .exec(callback)
      },
      wc: function (callback) {
        WepClass.findById(req.params.id)
          .populate('title')
          .populate('game')
          .exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.wc == null) {
        // No results.
        var err = new Error("Weapon Class not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("weaponClass/wc_detail", {
        title: "Weapon Class Info",
        guns: results.guns,
        wc: results.wc,
      });
    }
  );
};

// Display Gun create form on GET.
// exports.attachment_create_get = function (req, res, next) {
//     res.render('new_attachment', {
//         title: 'Add new attachment'
//     });
// };

exports.wc_create_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel({
      games: function (callback) {
        Game.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("weaponClass/new_wc", {
        title: "Add new weapon class",
        games: results.games,
      });
    }
  );
};

// Handle Author create on POST.
exports.wc_create_post = [

  // Validate and sanitize fields.
  body("wc_name", "Class name must not be empty.")
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
    var wc = new WepClass({
      title: req.body.wc_name,
      game: req.body.game_name,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("weaponClass/new_wc", {
        title: "Add new weapon class",
        wc_name: wc_name,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      wc.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new author record.
        res.redirect(wc.url);
      });
    }
  },
];

// Display Attachment delete form on GET.
exports.wc_delete_get = function (req, res, next) {
  async.parallel({
      guns: function (callback) {
        Gun.find({
          weaponClass: req.params.id,
        }).exec(callback);
      },
      wc: function (callback) {
        WepClass.findById(req.params.id).exec(callback);
    },

    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.wc == null) {
        // No results.
        res.redirect("/tracker/guns");
      }
      // Successful, so render.
      res.render("weaponClass/wc_delete", {
        title: "Delete Weapon Class",
        guns: results.guns,
        wc: results.wc
      });
    }
  );
};

// Handle Author delete on POST.
exports.wc_delete_post = function (req, res, next) {
  async.parallel({
      wc: function (callback) {
        WepClass.findById(req.body.id).exec(callback);
      },
      guns: function (callback) {
        Gun.find({
          weaponClass: req.params.id,
        }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success.

      // Author has no books. Delete object and redirect to the list of authors.
      WepClass.findByIdAndRemove(req.body.id, function deleteWepClass(err) {
        if (err) {
          return next(err);
        }
        // Success - go to author list.
        res.redirect("/tracker/guns");
      });

    }
  );
};

exports.wc_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel({
    wc: function (callback) {
        WepClass.findById(req.params.id)
            .populate("title")
            .populate("game")
            .exec(callback);
    },
    games: function (callback) {
        Game.find()
            .populate("title")
            .exec(callback);
    },
},
function (err, results) {
    if (err) {
        return next(err);
    }
    if (results.wc == null) {
        // No results.
        var err = new Error("Weapon Class not found");
        err.status = 404;
        return next(err);
    }
    // Success.
    res.render("weaponClass/new_wc", {
        title: "Update Weapon Class",
        wc: results.wc,
        games: results.games
    });
}
);
};

// Handle Author update on POST.
exports.wc_update_post = [

  // Validate and sanitize fields.
  body("wc_name", "Class name must not be empty.")
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
      var wc = new WepClass({
          title: req.body.wc_name,
          game: req.body.game_name,
          _id: req.params.id
      });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.render("weaponClass/new_wc", {
              title: "Update Weapon Class",
              wc_name: wc_name,
              game: game,
              errors: errors.array(),
          });
          return;
      } else {
          // Data from form is valid. Update the record.
          WepClass.findByIdAndUpdate(req.params.id, wc, {}, function (err, wcc) {
              if (err) {
                  return next(err);
              }
              // Successful - redirect to attachment detail page.
              res.redirect(wcc.url);
          });
      }
  },
];
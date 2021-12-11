var Blueprint = require("../models/blueprint");
var Att = require("../models/attachment");
var AttCat = require("../models/attachmentCategory");
var Gun = require("../models/gun");
var WepClass = require('../models/weaponClass');
var Game = require('../models/game')
var async = require("async");

const {
  body,
  validationResult
} = require("express-validator");

exports.att_list = function (req, res, next) {
  async.parallel({
      categories: function (callback) {
        AttCat.find()
          .exec(callback);
      },

      attachments: function (callback) {
        Att.find()
          .sort([
            ["title", "ascending"]
          ])
          .exec(callback);
      },
      games: function (callback) {
        Game.find()
          .sort([
            ['title', 'ascending']
          ])
          .exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("attachments/att_list", {
        title: "Attachment List",
        categories: results.categories,
        attachments: results.attachments,
        games: results.games
      });
    }
  );
};

// Display detail page for a specific attachment.
exports.att_detail = function (req, res, next) {
  async.parallel({
      att: function (callback) {
        Att.findById(req.params.id)
          .populate("title")
          .populate("attachmentCategory")
          .exec(callback);
      },

      category: function (callback) {
        AttCat.find({
            title: req.params.id,
          },
          "title url"
        ).exec(callback);
      },

      blueprints: function (callback) {
        Blueprint.find({
            attachments: req.params.id,
          },
          "title url weaponClass weaponBase"
        ).exec(callback);
      },

      guns: function (callback) {
        Gun.find({
            compatible: req.params.id,
          },
          "title url weaponClass"
        ).exec(callback);
      },

      wcs: function (callback) {
        WepClass.find()
          .sort([
            ['title', 'ascending']
          ])
          .exec(callback)
      },

      bp_guns: function (callback) {
        Gun.find()
          .exec(callback)
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.att == null) {
        // No results.
        var err = new Error("Attachment not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("attachments/att_detail", {
        title: "Attachment Info",
        att: results.att,
        category: results.category,
        blueprints: results.blueprints,
        guns: results.guns,
        wcs: results.wcs,
        bp_guns: results.bp_guns
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

exports.attachment_create_get = function (req, res, next) {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel({
      attcats: function (callback) {
        AttCat.find(callback);
      },
      games: function (callback) {
        Game.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("attachments/new_attachment", {
        title: "Add new attachment",
        attcats: results.attcats,
        games: results.games
      });
    }
  );
};

// Handle Author create on POST.
exports.attachment_create_post = [
  (req, res, next) => {
    if (!(req.body.att_cat instanceof Array)) {
      if (typeof req.body.att_cat === "undefined") req.body.att_cat = [];
      else req.body.att_cat = new Array(req.body.att_cat);
    }
    next();
  },

  // Validate and sanitize fields.
  body("att_name", "Attachment name must not be empty.")
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
    var att = new Att({
      title: req.body.att_name,
      attachmentCategory: req.body.att_cat,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("new_attachment", {
        title: "Add new attachment",
        att_name: att_name,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      att.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new author record.
        res.redirect(att.url);
      });
    }
  },
];

// Display Attachment delete form on GET.
exports.attachment_delete_get = function (req, res, next) {
  async.parallel({
      att: function (callback) {
        Att.findById(req.params.id).exec(callback);
      },
      blueprints: function (callback) {
        Blueprint.find({
            attachments: req.params.id,
          },
          "title url"
        ).exec(callback);
      },

      guns: function (callback) {
        Gun.find({
            compatible: req.params.id,
          },
          "title url"
        ).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.att == null) {
        // No results.
        res.redirect("/tracker/attachments");
      }
      // Successful, so render.
      res.render("attachments/att_delete", {
        title: "Delete Attachment",
        att: results.att,
        category: results.category,
        blueprints: results.blueprints,
        guns: results.guns,
      });
    }
  );
};

// Handle Author delete on POST.
exports.attachment_delete_post = function (req, res, next) {
  async.parallel({
      att: function (callback) {
        Att.findById(req.body.attid).exec(callback);
      },
      //   authors_books: function (callback) {
      //     Book.find({
      //       author: req.body.authorid,
      //     }).exec(callback);
      //   },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success.

      // Author has no books. Delete object and redirect to the list of authors.
      Att.findByIdAndRemove(req.body.id, function deleteAttachment(err) {
        if (err) {
          return next(err);
        }
        // Success - go to author list.
        res.redirect("/tracker/attachments");
      });

    }
  );
};

exports.attachment_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel({
      att: function (callback) {
        Att.findById(req.params.id)
          .populate("title")
          .populate("attachmentCategory")
          .exec(callback);
      },
      attcats: function (callback) {
        AttCat.find(callback);
      },
      games: function (callback) {
        Game.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.att == null) {
        // No results.
        var err = new Error("Attachment not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("attachments/new_attachment", {
        title: "Update attachment",
        att: results.att,
        attcats: results.attcats,
        games: results.games
      });
    }
  );
};

// Handle Author update on POST.
exports.attachment_update_post = [
  (req, res, next) => {
    if (!(req.body.att_cat instanceof Array)) {
      if (typeof req.body.att_cat === "undefined") req.body.att_cat = [];
      else req.body.att_cat = new Array(req.body.att_cat);
    }
    next();
  },

  // Validate and sanitize fields.
  body("att_name", "Attachment name must not be empty.")
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
    var att = new Att({
      title: req.body.att_name,
      attachmentCategory: req.body.att_cat,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("new_attachment", {
        title: "Add new attachment",
        att_name: att_name,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Att.findByIdAndUpdate(req.params.id, att, {}, function (err, attt) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to attachment detail page.
        res.redirect(attt.url);
      });
    }
  },
];
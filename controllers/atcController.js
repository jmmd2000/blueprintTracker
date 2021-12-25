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
exports.atc_detail = function (req, res, next) {
    async.parallel({
            atts: function (callback) {
                Att.find({
                        'attachmentCategory': req.params.id
                    }, 'title url')
                    .exec(callback)
            },
            atc: function (callback) {
                AttCat.findById(req.params.id)
                    .populate('title')
                    .populate('game')
                    .exec(callback)
            },
            att_count: function (callback) {
                Att.countDocuments({
                    'attachmentCategory': req.params.id
                }, callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            } // Error in API usage.
            if (results.atc == null) {
                // No results.
                var err = new Error("Attachment Category not found");
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render("attachmentCategory/atc_detail", {
                title: "Attachment Category Info",
                atts: results.atts,
                atc: results.atc,
                att_count: results.att_count
            });
        }
    );
};


exports.atc_create_get = function (req, res, next) {
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
            res.render("attachmentCategory/new_atc", {
                title: "Add new attachment category",
                games: results.games,
            });
        }
    );
};

// Handle Author create on POST.
exports.atc_create_post = [

    // Validate and sanitize fields.
    body("atc_name", "Category name must not be empty.")
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
        var atc = new AttCat({
            title: req.body.atc_name,
            game: req.body.game_name,
            secondary: req.body.sec,
            primary: req.body.pri,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render("new_atc", {
                title: "Add new attachment category",
                atc_name: atc_name,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.

            // Save author.
            atc.save(function (err) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to new author record.
                res.redirect(atc.url);
            });
        }
    },
];

// Display Attachment delete form on GET.
exports.atc_delete_get = function (req, res, next) {
    async.parallel({
            atc: function (callback) {
                AttCat.findById(req.params.id).exec(callback);
            },

            atts: function (callback) {
                Att.find({
                        attachmentCategory: req.params.id,
                    },
                    "title url"
                ).exec(callback);
            },

        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            if (results.atc == null) {
                // No results.
                res.redirect("/tracker/attachments");
            }
            // Successful, so render.
            res.render("attachmentCategory/atc_delete", {
                title: "Delete Attachment",
                atts: results.atts,
                atc: results.atc,
            });
        }
    );
};

// Handle Author delete on POST.
exports.atc_delete_post = function (req, res, next) {
    async.parallel({
            att: function (callback) {
                AttCat.findById(req.body.id).exec(callback);
            },
        },
        function (err, results) {
            if (err) {
                return next(err);
            }
            // Success.

            // Author has no books. Delete object and redirect to the list of authors.
            AttCat.findByIdAndRemove(req.body.id, function deleteAttachmentCategory(err) {
                if (err) {
                    return next(err);
                }
                // Success - go to author list.
                res.redirect("/tracker/attachments");
            });

        }
    );
};

exports.atc_update_get = function (req, res, next) {
    // Get book, authors and genres for form.
    async.parallel({
            atc: function (callback) {
                AttCat.findById(req.params.id)
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
            if (results.atc == null) {
                // No results.
                var err = new Error("Attachment Category not found");
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render("attachmentCategory/new_atc", {
                title: "Update Attachment Category",
                atc: results.atc,
                games: results.games
            });
        }
    );
};

// Handle Author update on POST.
exports.atc_update_post = [

    // Validate and sanitize fields.
    body("atc_name", "Attachment name must not be empty.")
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
        var atc = new AttCat({
            title: req.body.atc_name,
            game: req.body.game_name,
            secondary: req.body.sec,
            primary: req.body.pri,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render("attachmentCategory/new_atc", {
                title: "Update Attachment Category",
                atc_name: atc_name,
                game: game,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            AttCat.findByIdAndUpdate(req.params.id, atc, {}, function (err, atcc) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to attachment detail page.
                res.redirect(atcc.url);
            });
        }
    },
];
const { body, validationResult } = require("express-validator");
var Recipe = require("../models/recipe");
var Ingredient = require("../models/ingredient");
var Type = require("../models/type");
var Creator = require("../models/creator");

var async = require("async");

exports.creator_list = function (req, res, next) {
  Creator.find({}, "first_name last_name")
    .sort([["last_name", "ascending"]])
    .exec(function (err, list_creators) {
      if (err) {
        return next(err);
      }
      res.render("creator_list", {
        title: "Creators",
        list_creators: list_creators,
      });
    });
};

exports.creator_detail = function (req, res, next) {
  async.parallel(
    {
      creator: function (callback) {
        Creator.findById(req.params.id).exec(callback);
      },
      creator_recipes: function (callback) {
        Recipe.find({ creator: req.params.id }, "name")
          .populate("creator")
          .populate("description")
          .populate("name")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.creator == null) {
        var err = new Error("Creator not found");
        err.status = 404;
        return next(err);
      }
      res.render("creator_detail", {
        title: "Creator",
        creator: results.creator,
        creator_recipes: results.creator_recipes,
      });
    }
  );
};

exports.creator_create_get = function (req, res, next) {
  res.render("creator_form", { title: "Create Author" });
};

exports.creator_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("creator_form", {
        title: "Create Author",
        creator: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      var creator = new Creator({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      });
      creator.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new author record.
        res.redirect(creator.url);
      });
    }
  },
];

exports.creator_delete_get = function (req, res, next) {
  async.parallel(
    {
      creator: function (callback) {
        Creator.findById(req.params.id).exec(callback);
      },
      creator_recipes: function (callback) {
        Recipe.find({ creator: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.creator == null) {
        res.redirect("/creators");
      }
      res.render("creator_delete", {
        title: "Delete Creator",
        creator: results.creator,
        creator_recipes: results.creator_recipes,
      });
    }
  );
};

exports.creator_delete_post = function (req, res, next) {
  async.parallel(
    {
      creator: function (callback) {
        Creator.findById(req.body.creatorid).exec(callback);
      },
      creator_recipes: function (callback) {
        Recipe.find({ creator: req.body.creatorid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.creator_recipes.length > 0) {
        res.render("creator_delete", {
          title: "Delete Creator",
          creator: results.creator,
          creator_recipes: results.creator_recipes,
        });
        return;
      } else {
        Creator.findByIdAndRemove(
          req.body.creatorid,
          function deleteCreator(err) {
            if (err) {
              return next(err);
            }
            res.redirect("/creators");
          }
        );
      }
    }
  );
};

// Display Genre update form on GET.
exports.creator_update_get = function (req, res, next) {
  Creator.findById(req.params.id, function (err, creator) {
    if (err) {
      return next(err);
    }
    if (creator == null) {
      // No results.
      var err = new Error("Creator not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("creator_form", { title: "Update Creator", creator: creator });
  });
};

exports.creator_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data (and the old id!)
    var creator = new Creator({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("creator_form", {
        title: "Update Creator",
        creator: creator,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Creator.findByIdAndUpdate(
        req.params.id,
        creator,
        {},
        function (err, thecreator) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to genre detail page.
          res.redirect(thecreator.url);
        }
      );
    }
  },
];

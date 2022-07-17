const { body, validationResult } = require("express-validator");
var Recipe = require("../models/recipe");
var Ingredient = require("../models/ingredient");
var Type = require("../models/type");
var Creator = require("../models/creator");

var async = require("async");

// exports.type_list = function(req,res,next){
//     Type.find({},'type')
//     .sort({type:1})
//     .exec(function(err, list_types){
//         if(err) {return next(err)}
//         res.render('type_list',{title:'Type List', type_list: list_types})
//     })
// }

exports.type_list = function (req, res, next) {
  async.parallel(
    {
      type_list: function (callback) {
        Type.find({}, "type").sort({ type: 1 }).exec(callback);
      },
      recipe_type: function (callback) {
        Recipe.find({}, "name description type")
          .populate("type")
          .populate("name")
          .populate("description")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }

      res.render("type_list", {
        title: "Type List",
        type_list: results.type_list,
        recipe_type: results.recipe_type,
      });
    }
  );
};

exports.type_detail = function (req, res, next) {
  async.parallel(
    {
      type: function (callback) {
        Type.findById(req.params.id).exec(callback);
      },

      type_recipes: function (callback) {
        Recipe.find({ type: req.params.id }).populate("creator").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.type == null) {
        var err = new Error("Type not found");
        err.status = 404;
        return next(err);
      }
      res.render("type_detail", {
        title: "Dish Type",
        type: results.type,
        recipe_type: results.type_recipes,
      });
    }
  );
};

exports.type_delete_get = function (req, res, next) {
  async.parallel(
    {
      type: function (callback) {
        Type.findById(req.params.id).exec(callback);
      },
      type_recipes: function (callback) {
        Recipe.find({ type: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.type == null) {
        res.redirect("/types");
      }
      res.render("type_delete", {
        title: "Delete Type",
        type: results.type,
        type_recipes: results.type_recipes,
      });
    }
  );
};

exports.type_delete_post = function (req, res, next) {
  async.parallel(
    {
      type: function (callback) {
        Type.findById(req.body.typeid).exec(callback);
      },
      type_recipes: function (callback) {
        Recipe.find({ type: req.body.typeid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.type_recipes.length > 0) {
        res.render("type_delete", { title: "Delete Type", type: results.type });
        return;
      } else {
        Type.findByIdAndRemove(req.body.typeid, function deleteType(err) {
          if (err) {
            return next(err);
          }
          res.redirect("/types");
        });
      }
    }
  );
};

exports.type_create_get = function (req, res, next) {
  res.render("type_form", { title: "Create Type" });
};

exports.type_create_post = [
  body("type", "Type name required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var type = new Type({ type: req.body.type });

    if (!errors.isEmpty()) {
      res.render("type_form", {
        title: "Create Type",
        type: type,
        errors: errors.array(),
      });
      return;
    } else {
      Type.findOne({ type: req.body.type }).exec(function (err, found_type) {
        if (err) {
          return next(er);
        }
        if (found_type) {
          res.redirect(found_type.url);
        } else {
          type.save(function (err) {
            if (err) {
              return next(err);
            }
            res.redirect(type.url);
          });
        }
      });
    }
  },
];

exports.type_update_get = function (req, res, next) {
  Type.findById(req.params.id, function (err, type) {
    if (err) {
      return next(err);
    }
    if (type == null) {
      var err = new Error("Type not found");
      err.status = "404";
      return next(err);
    }

    res.render("type_form", { title: "Update Type", type: type });
  });
};

exports.type_update_get = function (req, res, next) {
  Type.findById(req.params.id, function (err, type) {
    if (err) {
      return next(err);
    }
    if (type == null) {
      // No results.
      var err = new Error("Type not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("type_form", { title: "Update Type", type: type });
  });
};

exports.type_update_post = [
  // Validate and sanitze the name field.
  body("type", "Type name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    var type = new Type({
      type: req.body.type,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("type_form", {
        title: "Update Type",
        type: type,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Type.findByIdAndUpdate(req.params.id, type, {}, function (err, thetype) {
        if (err) {
          return next(err);
        }
        res.redirect(thetype.url);
      });
    }
  },
];

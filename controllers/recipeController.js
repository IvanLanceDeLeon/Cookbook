const { body, validationResult } = require("express-validator");
var Recipe = require("../models/recipe");
var Ingredient = require("../models/ingredient");
var Type = require("../models/type");
var Creator = require("../models/creator");

var async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      recipe_count: function (callback) {
        Recipe.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Recipe App Home",
        error: err,
        data: results,
      });
    }
  );
};

exports.recipe_list = function (req, res, next) {
  Recipe.find({}, "name creator description")
    .sort({ name: 1 })
    .populate("creator")
    .exec(function (err, list_recipes) {
      if (err) {
        return next(err);
      }
      res.render("recipe_list", {
        title: "Recipe List",
        recipe_list: list_recipes,
      });
    });
};

exports.recipe_detail = function (req, res, next) {
  async.parallel(
    {
      recipe: function (callback) {
        Recipe.findById(req.params.id)
          .populate("creator")
          .populate("type")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.recipe == null) {
        var err = new Error("Recipe not Found");
        err.status = 404;
        return next(err);
      }
      res.render("recipe_detail", {
        title: results.recipe.name,
        recipe: results.recipe,
      });
    }
  );
};

exports.recipe_create_get = function (req, res, next) {
  async.parallel(
    {
      creators: function (callback) {
        Creator.find(callback);
      },
      type: function (callback) {
        Type.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("recipe_form", {
        title: "Create Recipe",
        creators: results.creators,
        type: results.type,
      });
    }
  );
};

exports.recipe_create_post = [
  (req, res, next) => {
    if (!(req.body.type instanceof Array)) {
      if (typeof req.body.type === "undefined") req.body.type = [];
      else req.body.type = new Array(req.body.type);
    }
    next();
  },
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("creator", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("instructions", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("ingredients", "ingredients must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("type.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var recipe = new Recipe({
      name: req.body.name,
      creator: req.body.creator,
      description: req.body.description,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      type: req.body.type,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          creators: function (callback) {
            Creator.find(callback);
          },
          type: function (callback) {
            Type.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          for (let i = 0; i < results.type.length; i++) {
            if (recipe.type.indexOf(results.type[i]._id) > -1) {
              results.type[i].checked = "true";
            }
          }

          res.render("recipe_form", {
            title: "Create Recipe",
            creators: results.creators,
            type: results.type,
          });
        }
      );
      return;
    } else {
      recipe.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(recipe.url);
      });
    }
  },
];

exports.recipe_delete_get = function (req, res, next) {
  async.parallel(
    {
      recipe: function (callback) {
        Recipe.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.recipe == null) {
        res.redirect("/recipes");
      }
      res.render("recipe_delete", {
        title: "Delete Recipe",
        recipe: results.recipe,
      });
    }
  );
};

exports.recipe_delete_post = function (req, res, next) {
  async.parallel(
    {
      recipe: function (callback) {
        Recipe.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      Recipe.findByIdAndRemove(req.body.recipeid, function deleteRecipe(err) {
        if (err) {
          return next(err);
        }
        res.redirect("/recipes");
      });
    }
  );
};

// Display book update form on GET.
exports.recipe_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel(
    {
      recipe: function (callback) {
        Recipe.findById(req.params.id)
          .populate("creator")
          .populate("type")
          .exec(callback);
      },
      creator: function (callback) {
        Creator.find(callback);
      },
      type: function (callback) {
        Type.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.recipe == null) {
        // No results.
        var err = new Error("Recipe not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (var all_t_iter = 0; all_t_iter < results.type.length; all_t_iter++) {
        for (
          var recipe_t_iter = 0;
          recipe_t_iter < results.recipe.type.length;
          recipe_t_iter++
        ) {
          if (
            results.type[all_t_iter]._id.toString() ===
            results.recipe.type[recipe_t_iter]._id.toString()
          ) {
            results.type[all_t_iter].checked = "true";
          }
        }
      }
      res.render("recipe_form", {
        title: "Update Book",
        creators: results.creator,
        type: results.type,
        recipe: results.recipe,
      });
    }
  );
};

exports.recipe_update_post = [
  (req, res, next) => {
    if (!(req.body.type instanceof Array)) {
      if (typeof req.body.type === "undefined") req.body.type = [];
      else req.body.type = new Array(req.body.type);
    }
    next();
  },
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("creator", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("instructions", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("ingredients", "ingredients must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("type.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var recipe = new Recipe({
      name: req.body.name,
      creator: req.body.creator,
      description: req.body.description,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      type: req.body.type,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          creators: function (callback) {
            Creator.find(callback);
          },
          type: function (callback) {
            Type.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          for (let i = 0; i < results.type.length; i++) {
            if (recipe.type.indexOf(results.type[i]._id) > -1) {
              results.type[i].checked = "true";
            }
          }

          res.render("recipe_form", {
            title: "Update Recipe",
            creators: results.creators,
            type: results.type,
            recipe: recipe,
          });
        }
      );
      return;
    } else {
      Recipe.findByIdAndUpdate(
        req.params.id,
        recipe,
        {},
        function (err, therecipe) {
          if (err) {
            return next(err);
          }
          res.redirect(therecipe.url);
        }
      );
    }
  },
];

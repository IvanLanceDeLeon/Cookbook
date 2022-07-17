var express = require('express');
var router = express.Router();

var recipe_controller = require('../controllers/recipeController')
var type_controller = require('../controllers/typeController')
var creator_controller = require('../controllers/creatorController')
/* GET home page. */
router.get('/', recipe_controller.index);

//RECIPE ROUTES


router.get('/createRecipe',recipe_controller.recipe_create_get)

router.post('/createRecipe',recipe_controller.recipe_create_post)

router.get('/recipes',recipe_controller.recipe_list)

router.get('/recipes/:id', recipe_controller.recipe_detail)

router.get('/recipes/:id/delete', recipe_controller.recipe_delete_get)

router.post('/recipes/:id/delete', recipe_controller.recipe_delete_post)

router.get('/recipes/:id/update', recipe_controller.recipe_update_get)

router.post('/recipes/:id/update', recipe_controller.recipe_update_post)

//TYPE ROUTES

router.get('/types', type_controller.type_list)

router.get('/types/create', type_controller.type_create_get)

router.post('/types/create', type_controller.type_create_post)

router.get('/types/:id',type_controller.type_detail)

router.get('/types/:id/delete',type_controller.type_delete_get)

router.post('/types/:id/delete',type_controller.type_delete_post)

router.get('/types/:id/update', type_controller.type_update_get)

router.post('/types/:id/update', type_controller.type_update_post)



//AUTHOR ROUTES

router.get('/creators',creator_controller.creator_list)

router.get('/creators/create',creator_controller.creator_create_get)

router.post('/creators/create',creator_controller.creator_create_post)


router.get('/creators/:id',creator_controller.creator_detail)


router.get('/creators/:id/delete',creator_controller.creator_delete_get)

router.post('/creators/:id/delete',creator_controller.creator_delete_post)

router.get('/creators/:id/update',creator_controller.creator_update_get)

router.post('/creators/:id/update',creator_controller.creator_update_post)
module.exports = router;

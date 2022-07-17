var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var IngredientSchema = new Schema(
    {
        ingredient: {type:String, required:true, maxLength: 100}
    }
)

IngredientSchema
.virtual('name')
.get(function(){
    return this.ingredient
})
module.exports = mongoose.model('Ingredient', IngredientSchema)
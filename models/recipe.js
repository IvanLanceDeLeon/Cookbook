var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RecipeSchema = new Schema(
    {
        name: {type : String, required:true, maxLength: 100},
        creator: {type: Schema.Types.ObjectId, ref: 'Creator', required:true},
        description: {type: String, required:true},
        ingredients: {type: String, required:true},
        type: [{type: Schema.Types.ObjectId, ref: 'Type', required:true}],
        instructions: {type: String, required:true}
    }
)

RecipeSchema
.virtual('url')
.get(function(){
    return '/recipes/' + this._id;
})


module.exports = mongoose.model('Recipe', RecipeSchema)
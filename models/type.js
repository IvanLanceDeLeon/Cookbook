var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var TypeSchema = new Schema(
    {
        type: {type:String, required: true, maxLength:100}
    }
)


TypeSchema
.virtual('url')
.get(function(){
    return '/types/'+this._id;
})


module.exports = mongoose.model('Type', TypeSchema)
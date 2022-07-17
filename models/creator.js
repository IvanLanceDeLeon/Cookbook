var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CreatorSchema = new Schema(
    {
        first_name:{type:String, required:true, maxLength:100},
        last_name: {type:String, required: true, maxLength:100},

    }
)

CreatorSchema
.virtual('name')
.get(function(){
    var fullname = '';
    if(this.first_name && this.last_name){
        fullname = this.last_name + ', ' + this.first_name
    }
    if(!this.first_name || !this.last_name){
        fullname = ' ';
    }
    return fullname;
})

CreatorSchema
.virtual('url')
.get(function(){
    return '/creators/' + this._id
})


module.exports = mongoose.model('Creator', CreatorSchema)
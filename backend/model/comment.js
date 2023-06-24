const mongoose = require('mongoose')

// object of schema 
const {Schema} = mongoose;

const commentSchema = new Schema({
    content:{type:String,required:true},
    // this blog can refer blogs collection in database >> like we make a connection
    blogId:{type:mongoose.SchemaTypes.ObjectId,ref:'Blog'},
    author:{type:mongoose.SchemaTypes.ObjectId,ref:'User'},
},
// authomatically record time when data store in db , creation time updated time 
{timestamps:true})

// ("Model name that we need to import in file",define schema, "name or collection we want to make")
module.exports = mongoose.model('Comment',commentSchema,'comments')
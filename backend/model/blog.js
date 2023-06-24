const mongoose = require('mongoose')

// object of schema 
const {Schema} = mongoose;

const blogSchema = new Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    // imgPath:{type:String,required:true},
    photoPath:{type:String,required:true},
    // reference typed that refers user collection 
    // User is a Model name that we refere to User object in database
    author: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'}
},
// authomatically record time when data store in db , creation time updated time 
{timestamps:true})

// ("Model name",define schema, "name or collection we want to make")
module.exports = mongoose.model('Blog',blogSchema,'blogs')
const mongoose = require('mongoose')

// object of schema 
const {Schema} = mongoose;

const usersSchema = new Schema({
    fullname:{type:String,required:true},
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
},
// authomatically record time when data store in db , creation time updated time 
{timestamps:true})

// ("Model name that we need to import in file",define schema, "name or collection we want to make")
module.exports = mongoose.model('User',usersSchema,'users')
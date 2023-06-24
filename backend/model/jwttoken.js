const mongoose = require('mongoose')

// object of schema  > destructure from mongoose
const {Schema} = mongoose;

const refreshTokenSchema = Schema({
    token : {type:String,required:true},
    userId : {type:mongoose.SchemaTypes.ObjectId,ref:'User'}
    // userID : {type:mongoose.SchemaTypes.ObjectId,ref:'users'}
},{timestamps:true})

module.exports = mongoose.model("RefreshToken",refreshTokenSchema,'tokens')
const mongoose = require('mongoose')
const {connectionString_ENV} = require('../config/index')

// Atlas Database connection url string 
const connectionString = connectionString_ENV


// const connectionString = "mongodb+srv://arslan7008:arslan7008T@cluster0.jejyfac.mongodb.net/cryptalytics_blogapp?retryWrites=true&w=majority"

const connectDbAltlas = async () => {
    try {
        console.log("akak")
        const connect = await mongoose.connect(connectionString);
        console.log(`connnected success:  ${connect.connection.host}`)
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = connectDbAltlas;
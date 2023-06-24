const jwt = require('jsonwebtoken')
const RefreshToken = require('../model/jwttoken')

// Note we use fiffresnt scret for both access and refresh token for security 
// Bcz the access token timelaps is less as compare to refresh token 
// Use you scret key in env > envirmnet variable file 
const {ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET} = require('../config/index')

class JWTService {

    // Signature ===============================
    // signAccessToken(payload, expiryTime, secretKey) {
    //     return jwt.sign(payload, secretKey, { expiresIn: expiryTime })
        //    sign("In payload we pass usrs data","Secret key we pass our secret key","Third we pass options as a object like time duration ")
    // }


    // Note reason to use static keyword with method is to don't make new object every time for call just access through class Name directly

    // 1 => sign access token
    static signAccessToken(payload, expiryTime) {
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime })
    }

    // 2 => sign refresh token
    static signRefreshToken(payload, expiryTime) {
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime })
    }


    // 3 => verify access token
    // token from user end
    static verifyAccessToken(token)
    {
        return jwt.verify(token,ACCESS_TOKEN_SECRET)
    }

    // 4 => verify refresh token
    static verifyRefreshToken(token)
    {
        return jwt.verify(token,REFRESH_TOKEN_SECRET)
    }



    // Store Refresh token in db 
    static async storeRefreshTokenDB(token,userId)
    {
        try {
          const newToken = new RefreshToken({
            token:token,
            userId:userId
          })  

        //   store token object in database as a new document / collection 
          await newToken.save()
        } catch (error) {
            console.log(error)
        }
    }
}




module.exports = JWTService

// genrate random String as Secret key 
// we use crypto by defualt installed in Node js
// const crypto = require('crypto')
// Mention number of bytes we assign , 8,16,32,64,128,256 etc
// Define the formate we use hex which we want to generate in
// crypto.randomBytes(64).toString('hex')
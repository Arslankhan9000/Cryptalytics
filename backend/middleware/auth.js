// In this middleware we check the authenticity of the user 
// Is User have valid access token 
// We can pass this token to our routes > make routes protected so no one can tempare

// verify tokens with help of this class verfy methods 
const JWTService = require('../services/JWTService')

const User = require('../model/user')

const UserDTO = require('../DTO/userdto')


const auth = async (req, res, next) => {
    try {
        // 1. Validate access and refresh token ===========
        // The two thing we get or access from our cookie 
        const { accessToken, refreshToken } = req.cookies;
        // console.log(accessToken);
        // console.log(refreshToken);

        // We check this > is user try to send request to our protected routes have cookie or not 
        if (!accessToken || !refreshToken) {
            const error = {
                status: 401,
                message: 'UnAuthorized'
            }

            // const error = new Error("Unauthorized");
            // error.status = 102;
            // console.log(`Error: ${error}`);

            // we return or send in res via middleware ============
            // console.log(`Error he  bhii err Unauthorized: ${error}`)
            return next(error)
        }

        // It return a payload --> we pass a user id as payload when we create an access and refresh token 
        // Note we also get error if thee is no token in  cookie we use try catch
        let _id;

        try {
            _id = JWTService.verifyAccessToken(accessToken)._id;
        } catch (error) {
            console.log(`Error he  bhii err _id: ${error}`)
            return next(error)
        }


        // User find 
        let user;
        try {

            user = await User.findOne({ _id: _id });

        } catch (error) {
            console.log(`Error he  bhii err _id: ${error}`)
            return next(error)
        }

        const userdto = new UserDTO(user)

        // In request we add usedto so we can access when we request 
        req.user = userdto

        // Call next middleware
        next()
    } catch (error) {
        console.log(`Error he  bhii err _id: ${error}`)
    }
}


module.exports = auth
// All business logic related to routes we handle the req and response here based on users query 
const Joi = require('joi')

const User = require('../model/user')
const UserDTO = require('../DTO/userdto')
const bcrypt = require('bcryptjs');

// jwt auth -----------
const JWTService = require('../services/JWTService')

const RefreshTokenDB = require('../model/jwttoken')

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {

    // 1: Register Controller All Logical work here ======================== Start
    async register(req, res, next) {
        // We check the follwing conditions to register user

        // 1> validate user input i.e email, password ----------
        // -?? We expect some input data in such shape 
        // A concept of Data Transfer Object (DTO) > we define a shape of data
        const userRegiterSchema = Joi.object({
            fullname: Joi.string().max(30).required(),
            username: Joi.string().min(5).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            // refered to password field to confirm both are equal 
            confirmPassword: Joi.ref('password')
        });

        // it validate the coming data in body 
        // we destructure error so if error it return in error, else it return null
        const { error } = userRegiterSchema.validate(req.body);

        // 2> if something wrong in validation => return error via middleware -------
        if (error) {
            // In Join we get a Validation Error so we need to handle error through middleware 
            // It can call our next middleware so finally it throw error if 
            return next(error)
        }
        // 3> if email or username already exit in our db => return error  --------
        const { fullname, username, email, password } = req.body;

        // communicate with database we use try catch i case of error 
        try {
            const isEmailExit = await User.exists({ email });
            const isUsernameExit = await User.exists({ username });

            if (isEmailExit) {
                const error = {
                    status: 409,
                    message: "Email already registered, use another email!",
                };

                return next(error);
            }


            if (isUsernameExit) {
                const error = {
                    // for conflict or data already used
                    status: 409,
                    message: "Username not available choose another one",
                };
                return next(error)
            }
        }
        catch (error) {
            return next(error)
        }

        // 4> hash user password -----------------------------
        // we use library to hash our password  => npm i bcryptjs
        // 10 >> sorting rounds to add some random strings to make hashed pass    
        const hashed_password = await bcrypt.hash(password, 10)


        // 5> store users data in database  ----------------------------
        // const userRegister = new User({
        //     fullname: fullname,
        //     username:username,
        //     email:email,
        //     password:hashed_password
        // })

        // ===============================
        // JWT Token 
        let accessToken;
        let refreshToken;
        let userData;

        try {

            // if key and value are same wrote like this
            const userRegister = new User({
                fullname,
                username,
                email,
                password: hashed_password
            })

            userData = await userRegister.save()
            console.log(userData)

            // Token creation process ========
            // 30m mean 30 minutes 
            // accessToken = JWTService.signAccessToken({ _id: userData._id, username: userData.username }, '30m')

            accessToken = JWTService.signAccessToken({ _id: userData._id }, '30m')

            refreshToken = JWTService.signRefreshToken({ _id: userData._id }, '100m')

        } catch (error) {
            return next(error)
        }

        // store refresh token in db -----------------
        JWTService.storeRefreshTokenDB(refreshToken, userData._id)
        // send token in cookie response ======
        // Note the cookie expires time and jwt expiry time is diffrent in cookie we define in options 
        // maxAge: required time in miliseconds 
        res.cookie('accessToken', accessToken, {
            // one day time will be assign 
            maxAge: 1000 * 60 * 60 * 24,
            //    In client side javaScript/browser cannot access this token 
            // Prevent XSS attacks 
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        // 6> Send response to user based on input  ---------------
        // Call DTO to filter and show specific info to user in response 
        const user = new UserDTO(userData)
        return res.status(201).json({ user, auth: true })

        // For validation we used popular package joi (npm i joi)


        // User data in body JSON
        // {
        //     "username":"alikhan123",
        //     "fullname":"alikhan",
        //     "email":"alikhan123@gmail.com",
        //     "password":"AliKhan123#",
        //     "confirmPassword":"AliKhan123#"
        //    }

    },

    // Register Controller All Logical work here ======>>>>>>>>>>=========== Ends

    // Login =========================================================== Starts
    async login(req, res, next) {

        // 1> Validation of user input ====>
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required(),
        })

        // 2> if error return error via error handler middleware ====>

        const { error } = userLoginSchema.validate(req.body);

        if (error) {
            return next(error)
        }

        // 3> match username and password   ===> match from mongo database
        const { username, password } = req.body;
        // We can do like that 
        // const username = req.body.username;
        let isUsernameFound;
        try {
            //   match username 
            isUsernameFound = await User.findOne({ username: username });
            if (!isUsernameFound) {
                const error = {
                    status: 401 * 1,
                    message: "Invalid credentials or username and password"
                }
                return next(error)
            }

            // match hashed password using bcrypt 
            const passMatch = await bcrypt.compare(password, isUsernameFound.password)

            if (!passMatch) {
                const error = {
                    status: 401,
                    message: "Invalid password"
                }
                return next(error)
            }
        }
        catch (error) {
            return next(error)
        }

        // cookie generation process ====================
        const accessToken = JWTService.signAccessToken({ _id: isUsernameFound._id }, "30m");
        const refreshToken = JWTService.signRefreshToken({ _id: isUsernameFound._id }, "100m");

        // In register we store token in database bcz of firest time user sign up
        // In Login case we can update the token in database 
        // update refresh token in database 

        try {
            await RefreshTokenDB.updateOne(
                // First arg is a query paramter
                { _id: isUsernameFound._id, },
                // Second is data we update ٖ
                { token: refreshToken },
                // 3rd options:  if it gets matching record it update otherwise create new upsert  true mean 
                { upsert: true })
        } catch (error) {

        }

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        // 4> return response if all ok  =====
        // DTO used to send specific info in response to user not the whole user document data  >> info after filetration 
        const userlogindto = new UserDTO(isUsernameFound)
        // return res.status(200).json({user:isUsernameFound})
        // We use auth true value for decion make or condition set when we try to work with protected routes 
        return res.status(200).json({ user: userlogindto, auth: true })


        // {
        //     "username":"asdb123",
        //     "password":"Asdb123A"
        //    }
    },

    // Login =========================>>>>>>>>>==============>>>>>>====== Ends 


    // Logout =========================================================== Starts
    async logout(req, res, next) {
        //  1. Delete refresh token from database 
        //   we use same name as key we define in cookie 
        const { refreshToken } = req.cookies;

        try {
            //  delete those record where cookie value match with our store db refresh token we store 
            await RefreshTokenDB.deleteOne({ token: refreshToken });
        } catch (error) {
            return next(error)
        }

        // delete cookie from browser 
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        // 2. After delet send response to client  ========
        res.status(200).json({ user: null, auth: false })

    },
    // Logout =============>>>>>>>===========>>>>>>>>>>>>>>>>============= Ends


    // Refresh =============>>>>>>>===========>>>>>>>>>>>>>>>>============= Starts
    async refresh(req, res, next) {
        //   1. get refresh token from cookie
        const orignalRefreshToken = req.cookies.refreshToken;
        // Or we can destructure like this 
        // const {refreshToken} = req.cookies;

        //   2. verify refresh token =====================
        let Id;
        try {
            // In verify token we get an object in return so we can get id 
            Id = JWTService.verifyRefreshToken(orignalRefreshToken)._id
        } catch (e) {
            const error = {
                status: 401,
                message: "Unauthorized"
            }
            return next(error)
        }

        // Note if someone tempare the token we get invalid data so we cannot verify it as orignal token (So we can find the id from token we get in database )

        try {
            const match = RefreshTokenDB.find({ _id: Id, token: orignalRefreshToken })

            // if not match the token and id we say it is tempare or unauthorized 
            if (!match) {
                const error = {
                    status: 401,
                    message: "Unauthorized"
                }
                return next(error)
            }


        } catch (err) {
            return next(err)
        }

        //   3. generate new tokens  ============================
        try {
            const accessToken = JWTService.signAccessToken({ _id: Id }, '30m')
            const refreshToken = JWTService.signRefreshToken({ _id: Id }, '100m')

            // Update database with new refresh token -------
            await RefreshTokenDB.updateOne({ _id: Id }, { token: refreshToken })

                    //   4. update database,return response ------
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        } catch (error) {
           return next(error)
        }


        const user = await User.findOne({_id:Id});

        const userDto = new UserDTO(user)

        return res.status(200).json({user:userDto,auth:true})

    }

    // Refresh =============>>>>>>>===========>>>>>>>>>>>>>>>>============= Ends
}


module.exports = authController
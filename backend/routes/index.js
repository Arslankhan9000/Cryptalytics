const express = require('express')

// Router ===============
const router = express.Router();

// auth controller 
const authController = require('../controller/authController')
const blogController = require('../controller/blogController')
const commentController = require('../controller/commentController')

const auth = require('../middleware/auth')

// main routes that we use in app  >>>>>>>>>>>>>>>>>>>>
// ====================== User
// 1: Login, 2: Register, 3:Logout, 4:User, 
// 5 :referesh >> refresh or make new token when expires so user don't need to login again it will automatically make a referesh token 

// ============================ Blog 
// 1:blog,
// All crud operations routes i.e 
// create
// read  >> read all blogs, read single blog by id filter when user click 
// update,
// delete 

// ========================= comment 
// create comment
// read  >> read comments by blog id when user open single blog it will see the related comment on blog 
// 



// ============================== Routes 

// tester ===>
// router.get('/tester',(req,res)=>{res.json({message:"Tester"})})

//  Main App Routes ===========>>

// ============================================================== Authentication
// 1: Register Route
router.post('/register',authController.register)

// 2: Login Route
router.post('/login',authController.login)

// 3: Logout Route
router.post('/logout',auth,authController.logout)

// 4: Refresh Route
router.get('/refresh',authController.refresh)


// ============================================================== Blog 
// 1: Create Blog Route
router.post('/blog',auth,blogController.createBlog)

// 2: Get All Blogs Route
router.get('/blog/all',auth,blogController.getAllBlog)

// 3: Get Blog By ID Route
router.get('/blog/:id',auth,blogController.getBlogByID)

// 4: Update Blog Route
router.put('/blog',auth,blogController.updateBlog)

// 4: Delete Blog Route
router.delete('/blog/:id',auth,blogController.deleteBlog)




// =====================================================================Commrnts 
// 1: Create Comment Route
router.post('/comment/',auth,commentController.createComment)

// 2: Get Comment from blog Route
router.get('/comment/:id',auth,commentController.getCommentById)

// 3: Create Comment Route
router.delete('/comment/',auth,commentController.createComment)

module.exports = router
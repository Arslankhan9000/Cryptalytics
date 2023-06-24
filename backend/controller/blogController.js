const Joi = require('joi')

// For Express Files system  fs
const fs = require("fs")

//  Model 
const blogModel = require('../model/blog')
const commentModel = require('../model/comment')

const BlogDTO = require('../DTO/blogdto')
const Blog_DetailsDTO = require('../DTO/Blog_detailsdto')


const { base_url } = require('../config/index')

// 24 mean the length of pattern string will be equal to 24
const mongoIDPattern = /^[0-9a-fA-F]{24}$/
const blogController = {
    // ========================================================= Create 1 Starts 
    async createBlog(req, res, next) {
        // validate req body --------
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            // match mongodb pattern id 
            author: Joi.string().regex(mongoIDPattern).required(),
            // We can get photo from client side in base64 encoded form 
            // Decode => save photo => save photo path in database 
            photo: Joi.string().required(),
            content: Joi.string().required(),
        });

        const { error } = createBlogSchema.validate(req.body)

        if (error) {
            return next(error)
        }

        const { title, author, photo, content } = req.body;
        // Handle photo  -----
        // Read photo as nodejs buffer >> we only accept this pattern image in cleaning photo
        // In base64 encoded data >> in this data we have meta data or starting string from this part data:image\  and allow that our image will be in this formates (png|jpg|jpeg)
        // so in replace we remove the whole pattern string 
        // For example this is a base 64 encoded image
        //     <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="
        // ></img>

        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/), 'base64')
        // assign a random unique name 
        // We add name from>   timeStamp with author id
        const imagePath = `${Date.now()}_${author}.png`

        // save locally in folder storage > create storage 
        // We use NodeJS file system and built_in module 

        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error)
        }

        // Save blog in Database ===========================
        let newBlog;
        try {
            // newBlog = new blogModel({
            //     title:title,
            //     author:author,
            //     content:content,
            //     imgPath:`${base_url}/storage/${imgPath}`,
            // });

            // We get this info from our request body 
            // Author id will be a user id --------------->>
            newBlog = new blogModel({
                title,
                author,
                content,
                photoPath: `${base_url}/storage/${imagePath}`,
            });

            await newBlog.save()

        } catch (error) {
            next(error)
        }

        // return response ====================
        const blog_dto = new BlogDTO(newBlog)
        return res.status(201).json({ blog: blog_dto })
    },

    // ========================================================= Get All 2 Starts 
    async getAllBlog(req, res, next) {
        try {

            const blogs = await blogModel.find({})
            // console.log(blogs)
            const blogsDto = []
            for (let i = 0; i < blogs.length; i++) {
                // store return list of blogs  in dto array through loop
                // push single item one by one in array 
                const singleDto = new BlogDTO(blogs[i]);
                blogsDto.push(singleDto)
                // console.log(blogsDto)
            }

            return res.status(200).json({ blogs: blogsDto })

        } catch (error) {
            // console.log(`Error message : ${error}`)
            next(error)
        }
    },

    // ========================================================= Get By ID 3 Starts 
    async getBlogByID(req, res, next) {
        // Validate id to check if its exist in db and length of string with regex pattern

        const getByIDSchema = Joi.object({
            id: Joi.string().regex(mongoIDPattern).required()
        })

        // we can send this in request params not in body 
        const { error } = getByIDSchema.validate(req.params);
        if (error) {
            return next(error)
        }
        let blogById;
        // Get id from params in url 
        // For example localhost:5000/blog/64932621eb811a192800aa17
        // After blog/ the params we get is the blog id 
        const { id } = req.params;
        try {
            // blogById = await blogModel.findOne({_id:id})
            // Populate with author
            blogById = await blogModel.findOne({ _id: id }).populate("author");;
            // console.log(blogById)
        } catch (error) {
            return next(error)
        }

        // const blogdto = new BlogDTO(blogById)
        const blogdetaildto = new Blog_DetailsDTO(blogById)
        // res.status(200).json({blog:blogdto})
        // return res.status(200).json({blog:blogById})
        return res.status(200).json({ blog: blogdetaildto })
    },

    // ========================================================= Update 4 Starts 
    async updateBlog(req, res, next) {
        // Validate requsest body ----------------------
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongoIDPattern).required(),
            blogId: Joi.string().regex(mongoIDPattern).required(),
            photo: Joi.string(),
            content: Joi.string().required(),
        })

        const { error } = updateBlogSchema.validate(req.body)

        if (error) {
            return next(error)
        }

        const { title, content, author, blogId, photo } = req.body;

        // If we update a photo as well we delete the old photo
        // If we don't update a photo don' need to delete photo 

        // get blog from db that we want to update 
        let fblog;
        try {
            fblog = await blogModel.findOne({ _id: blogId })
            // console.log(fblog)
        } catch (error) {
            return next(error)
        }


        // If user is updating a photo or we have photo in request body 

        if (photo) {
            // First we remove the previous photo, we get previous photo
            let previousPhoto = fblog.photoPath;

            // we split url base on / and we access the last index on -1 or a filename only
            // Hows its work >> 
            // Our url > http://localhost:5000/storage/1687459768060_63e3930ef4875cb6dd7a0853.png
            // The split method split this string based on / and make an array
            // [http://localhost:5000,storage,1687459768060_63e3930ef4875cb6dd7a0853]
            // so we need the last index value which is file name 
            previousPhoto = previousPhoto.split("/").at(-1);

            // delete photo
            fs.unlinkSync(`storage/${previousPhoto}`);


            // create another photo url path 
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/), 'base64')
            const imagePath = `${Date.now()}_${author}.png`
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error)
            }

            // update the blog =======================
            await blogModel.updateOne(
                // match constraints 
                { _id: blogId },
                // updated fields 
                { title, content, photoPath: `${base_url}/storage/${imagePath}` })
        } else {
            const uBlog = await blogModel.updateOne({ _id: blogId }, { title, content });
            // console.log(uBlog)
        }

        return res.status(200).json({ message: "blog updated successfully" });




    },

    // ========================================================= Delete 5 Starts 
    async deleteBlog(req, res, next) {
        // Validate Id >> we find user in db to check his/her existence 
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongoIDPattern).required(),
        })

        const { error } = deleteBlogSchema.validate(req.params)

        if (error) {
            return next(error)
        }

        // get or destructure id from params 
        let { id } = req.params;

        // Delete Blog & Comments -----
        try {
            await blogModel.deleteOne({ _id: id })

            // there are many comments that user can post on single blog 

            await commentModel.deleteMany({ blog: id })
        } catch (error) {
            return next(error)
        }

        // return response ---
        return res.status(200).json({ message: "blog deleted successfully" });
     },
}

module.exports = blogController


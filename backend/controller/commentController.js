const Joi = require('joi');

const mongoIDPattern = /^[0-9a-fA-F]{24}$/

const commentModel = require('../model/comment');
const CommentDTO = require('../model/comment');

const commentController = {

    // Create Comment ===================================================== Starts
    async createComment(req,res,next){
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongoIDPattern).required(),
            blogId: Joi.string().regex(mongoIDPattern).required()
        });

        const {error} = createCommentSchema.validate(req.body);

        if (error){
            return next(error);
        }
       
        // blog mean the blog id 
        const {content, author, blogId} = req.body;

        try{
            const newComment = new commentModel({
                content, author, blogId
            });

            await newComment.save();
        }
        catch(error){
            return next(error);
        }

        return res.status(201).json({message: 'comment created successfully'});

    },

     // Get Comment by ID===================================================== Starts
    async getCommentById(req,res,next){
        const getCommentByIdSchema = Joi.object({
            id: Joi.string().regex(mongoIDPattern).required()
        });

        const {error} = getCommentByIdSchema.validate(req.params);

        if (error){
            return next(error);
        }

        const {id} = req.params;

        let getcomments;

        try{
            getcomments = await commentModel.find({blogId: id}).populate('author');
        }
        catch(error){
            return next(error);
        }

        let commentsDto = [];

        for(let i = 0; i < getcomments.length; i++){
            const obj = new CommentDTO(getcomments[i]);
            commentsDto.push(obj);
        }

        return res.status(200).json({comments: commentsDto});
    },
}

module.exports = commentController
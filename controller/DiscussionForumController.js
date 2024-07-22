const mongoose = require('mongoose');
const { Post, Comment } = require('./../models/Discussion');
const { validationResult } = require('express-validator');

module.exports.createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, author, content, comments } = req.body;

        // Validate comments if present
        if (comments && !Array.isArray(comments)) {
            return res.status(400).json({ error: 'Comments must be an array' });
        }
        if (comments && comments.some(comment => !mongoose.Types.ObjectId.isValid(comment))) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }
        const newPost = new Post({
            title,
            author,
            content,
            comments: comments || [] // Set to an empty array if no comments
        });

        const response = await newPost.save();
        console.log('Post created Successfully');
        console.log(response);
        res.status(200).json({ message: "Post created Successfully", response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.getAllPost = async (req, res) => {
    try {
        const data = await Post.find().populate('comments');
        console.log('Post data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.getSinglePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author').populate('comments');
        if (!post) {
            return res.status(404).send();
        }
        res.send(post);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const updatedPostData = req.body;

        const response = await Post.findByIdAndUpdate(postId, updatedPostData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Post not found' });
        }

        console.log('Post updated successfully');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const response = await Post.findByIdAndDelete(postId);

        if (!response) {
            return res.status(404).json({ error: 'Post not found' });
        }

        console.log('Post deleted successfully');
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.createComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { content, author, post } = req.body;

        const newComment = new Comment({
            content,
            author,
            post
        });

        const response = await newComment.save();
        console.log('Comment created Successfully');
        console.log(response);

        // Add comment to post
        await Post.findByIdAndUpdate(post, { $push: { comments: response._id } });

        res.status(200).json({ message: "Comment created Successfully", response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports.getAllComments = async (req, res) => {
    try {
        const data = await Comment.find().populate('post');
        console.log('Comment data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const updatedCommentData = req.body;

        const response = await Comment.findByIdAndUpdate(commentId, updatedCommentData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        console.log('Comment updated successfully');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;

        const response = await Comment.findByIdAndDelete(commentId);

        if (!response) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Remove comment from post
        await Post.findByIdAndUpdate(response.post, { $pull: { comments: commentId } });

        console.log('Comment deleted successfully');
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//see the post and all the comments from that specific post
module.exports.seePostcomments = async(req,res)=>{
    try{
        const postId = req.params.postId;
        const comments= req.body;
        const response = await Post.find(postId,comments).populate('postId comments');
        if(!response){
            res.status(404).json({message: "Comment and Post are not found"});
        }
        console.log("Single Post of multiple comments are",response);
        res.status(200).json({message: "Post and Comments Fetched Successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports.getSpecificPostAlongComments = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('author');
      if (!post) {
        return res.status(404).send({ error: 'Post not found' });
      }
      const comments = await Comment.find({ post: req.params.id }).populate('author');
      res.json({ post, comments });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
};
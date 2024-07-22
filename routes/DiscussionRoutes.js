const express = require('express');
const router = express.Router();
const cors = require('cors');
const DiscussionForumController = require('./../controller/DiscussionForumController');
const { validatePost, validateComment } = require('./../middleware/Discussionvalidation');

// Create post
router.post('/discussionforum/createpost', cors(), validatePost, DiscussionForumController.createPost);

// Get all posts
router.get('/discussionforum/getallpost', cors(), DiscussionForumController.getAllPost);

// Get single post
router.get('/discussionforum/getpost/:id', cors(), DiscussionForumController.getSinglePost);

// Update post
router.put('/discussionforum/updatepost/:id', cors(), validatePost, DiscussionForumController.updatePost);

// Delete post
router.delete('/discussionforum/deletepost/:id', cors(), DiscussionForumController.deletePost);

// Create comment
router.post('/discussionforum/createcomment', cors(), validateComment, DiscussionForumController.createComment);

// Get all comments
router.get('/discussionforum/getcomments', cors(), DiscussionForumController.getAllComments);

// Update comment
router.put('/discussionforum/updatecomment/:id', cors(), validateComment, DiscussionForumController.updateComment);

// Delete comment
router.delete('/discussionforum/deletecomment/:id', cors(), DiscussionForumController.deleteComment);

//get specific post along comments
router.get('/discussionforum/getSpecificPostAlongComments/:id',cors(), DiscussionForumController.getSpecificPostAlongComments);

module.exports = router;

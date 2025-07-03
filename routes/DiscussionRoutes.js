const express = require('express');
const router = express.Router();
const cors = require('cors');
const DiscussionForumController = require('./../controller/DiscussionForumController');
// const { validatePost } = require('./../middleware/Discussionvalidation');

// Create post
router.post('/discussionforum/createpost', cors(), DiscussionForumController.createPost);

// Get all posts
router.get('/discussionforum/getallpost', cors(), DiscussionForumController.getAllPost);


// Delete post
router.delete('/discussionforum/deletepost/:content', cors(), DiscussionForumController.deletePost);

// Create Reply
router.post('/discussionforum/createReply', cors(), DiscussionForumController.createReply);


// Get Replys
router.get('/discussionforum/getReply', cors(), DiscussionForumController.getAllReplies);

// Get Reply for specific post
router.get('/discussionforum/getReplys', cors(), DiscussionForumController.getSpecificPostAlongReplies);



// Delete Reply
router.delete('/discussionforum/deleteReply/:reply', cors(), DiscussionForumController.deleteReply);


module.exports = router;

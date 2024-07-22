const mongoose = require('mongoose');

// Define the PostSchema for Discussion Forum
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        match: [/(.*@student\.uol\.edu\.pk$|.*@faculty\.uol\.edu\.pk$|.*@admin\.uol\.edu\.pk$)/, 'Invalid author email format'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

// Define the CommentSchema for Discussion Forum
const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        match: [/(.*@student\.uol\.edu\.pk$|.*@faculty\.uol\.edu\.pk$|.*@admin\.uol\.edu\.pk$)/, 'Invalid author email format'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create models
const Post = mongoose.model('Post', PostSchema);
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
    Post,
    Comment
};

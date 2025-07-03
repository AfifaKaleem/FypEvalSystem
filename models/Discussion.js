const mongoose = require('mongoose');

// Define the PostSchema for Discussion Forum
const PostSchema = new mongoose.Schema({
    author: {
        type: String,
        match: [/(.*@student\.uol\.edu\.pk$|.*@cs\.uol\.edu\.pk$|.*@admin\.cs\.uol\.edu\.pk$)/, 'Invalid author email format'],
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
    audience: {
    type: [String],
    enum: ["Evaluator", "Student","Supervisor","Admin"],
    default:["Evaluator", "Student","Supervisor","Admin"]
   },
    comments: [{
        type: mongoose.Schema.Types.String,
        ref: 'Reply'
    }]
});

// Define the ReplySchema for Discussion Forum
const ReplySchema = new mongoose.Schema({
    reply: {
        type: String,
        required: true
    },
    author: {
        type: String,
        match: [/(.*@student\.uol\.edu\.pk$|.*@cs\.uol\.edu\.pk$|.*@admin\.cs\.uol\.edu\.pk$)/, 'Invalid author email format'],
        required: true
    },
    content: {
        type: mongoose.Schema.Types.String,
        ref: 'Post',
        required: true
    },
    audience: {
    type: [String],
    enum: ["Evaluator", "Student","Supervisor","Admin"],
    default: ["Evaluator", "Student","Supervisor","Admin"]
   },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create models
const Post = mongoose.model('Post', PostSchema);
const Reply = mongoose.model('Reply', ReplySchema);

module.exports = {
    Post,
    Reply
};

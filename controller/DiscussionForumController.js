const { Post, Reply } = require('../models/Discussion');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { author, content ,audience} = req.body;
    const newPost = new Post({ author, content, createdAt: new Date(),audience });
    const savedPost = await newPost.save();
    res.status(200).json({ message: 'Post created successfully', post: savedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all posts
const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a post (Admin only)
const deletePost = async (req, res) => {
  try {
    const content = req.params.content;
    const deletedPost = await Post.findOneAndDelete({content:content});

    if (!deletedPost) return res.status(404).json({ error: 'Post not found' });

    await Reply.deleteMany({ content: content });

    res.status(200).json({ message: 'Post and its replies deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const createReply = async (req, res) => {
  try {
    const { reply, author, content, audience } = req.body;

    // Find the most recent matching post
    const post = await Post.findOne({ content }).sort({ createdAt: -1 });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create reply with reference to post ID
    const newReply = new Reply({
      reply,
      author,              // person replying
      content: post.content, // original post content
      post: post._id,        // reference to Post
      audience,
      createdAt: new Date()
    });

    const savedReply = await newReply.save();

    res.status(200).json({ message: 'Reply created successfully', reply: savedReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Get all replies
const getAllReplies = async (req, res) => {
  try {
    const replies = await Reply.find().sort({ createdAt: -1 });
    res.status(200).json(replies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get replies for a specific post
const getRepliesForPost = async (req, res) => {
  try {
    const content = req.params.content;
    const replies = await Reply.find({ content: content }).sort({ createdAt: -1 });
    res.status(200).json(replies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a reply (Admin only)

const deleteReply = async (req, res) => {
  try {
    const replyText = req.params.reply; // using req.params since you're passing it in the URL

    const deletedReply = await Reply.findOneAndDelete({ reply: replyText });

    if (!deletedReply) return res.status(404).json({ error: 'Reply not found' });

    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Get a specific post along with its replies
const getSpecificPostAlongReplies = async (req, res) => {
  try {
    const reply = req.params.reply;
    const content = req.params.content;

    const post = await Post.find(content).populate('author');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const replies = await Reply.find(reply ).populate('author');

    res.status(200).json({ post, replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createPost,
  getAllPost,
  deletePost,
  createReply,
  getAllReplies,
  getRepliesForPost,
  deleteReply,
  getSpecificPostAlongReplies,
};

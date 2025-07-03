const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true,  match: [/(.*@student\.uol\.edu\.pk$|.*@cs\.uol\.edu\.pk$|.*@admin.cs.uol.edu.pk)/, 'Invalid email domain'], },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// routes/loginSignupRoutes.js
const express = require('express');
const router = express.Router();
const loginSignupController = require('./../controller/LoginSignUpController');
const { jwtAuthMiddleware } = require('./../jwt');
const {checkAdmin} = require('./../middleware/validateEmail')
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const User = require('../models/User');

router.get('/protected-route', jwtAuthMiddleware, (req, res) => {
    // If the middleware allows the request through, this handler will execute.
    res.json({ message: 'This is a protected route', user: req.user });
 });
 
router.post('/signup', cors(),checkAdmin, loginSignupController.signup);
router.post('/login', cors(),loginSignupController.login);
router.post('/logout', cors(), loginSignupController.logout);

router.get('/',  cors(),loginSignupController.getAllUsers);
router.get('/login',  cors(),loginSignupController.getLoginusersData);
router.get('/logout', cors(),loginSignupController.getLogoutusersData);
router.get('/details',cors(),loginSignupController.getAllData);
router.get('/DetailUser',cors(),loginSignupController.getAll);

router.get('/profile', cors(), jwtAuthMiddleware, loginSignupController.getProfile);

router.put('/:id',  cors(),loginSignupController.updateUser);
router.put('/:id/password',  cors(),loginSignupController.updatePassword);

router.delete('/:id', cors(), loginSignupController.deleteUser);


// POST /loginsignup/google
router.post('/google', async (req, res) => {
  const { accessToken } = req.body;

  try {
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Fetch user info from Google
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { email, sub: googleId, name } = googleRes.data;

    if (!email) {
      return res.status(400).json({ error: 'Invalid Google response' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If not, create new
    if (!user) {
      user = new User({
        email,
        username: name || email.split('@')[0],
        googleId
      });
      await user.save();
    }

    res.json({ message: 'Google login successful', email });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
});

module.exports = router;

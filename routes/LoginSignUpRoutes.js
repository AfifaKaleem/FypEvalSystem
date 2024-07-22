// routes/loginSignupRoutes.js
const express = require('express');
const router = express.Router();
const loginSignupController = require('./../controller/LoginSignUpController');
const { jwtAuthMiddleware } = require('./../jwt');

router.post('/signup', loginSignupController.signup);
router.post('/login', loginSignupController.login);
router.post('/logout', loginSignupController.logout);

router.get('/', loginSignupController.getAllUsers);
router.get('/profile', jwtAuthMiddleware, loginSignupController.getProfile);

router.put('/:id', loginSignupController.updateUser);
router.put('/:id/password', loginSignupController.updatePassword);

router.delete('/:id', loginSignupController.deleteUser);

module.exports = router;

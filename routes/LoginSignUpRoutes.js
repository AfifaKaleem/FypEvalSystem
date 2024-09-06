// routes/loginSignupRoutes.js
const express = require('express');
const router = express.Router();
const loginSignupController = require('./../controller/LoginSignUpController');
const { jwtAuthMiddleware } = require('./../jwt');
const cors = require('cors');
router.post('/signup', cors(), loginSignupController.signup);
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

module.exports = router;
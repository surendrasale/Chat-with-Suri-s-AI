const express = require('express');
const { body } = require('express-validator');
const { 
  signup, 
  login, 
  getMe, 
  googleAuth, 
  firebaseSignup, 
  firebaseLogin 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signupValidation, signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', googleAuth);

// @route   POST /api/auth/firebase-signup
// @desc    Firebase email signup
// @access  Public
router.post('/firebase-signup', firebaseSignup);

// @route   POST /api/auth/firebase-login
// @desc    Firebase email login
// @access  Public
router.post('/firebase-login', firebaseLogin);

module.exports = router;
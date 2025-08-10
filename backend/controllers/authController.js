const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase-admin');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Create new user (User.create will check for existing email)
    const user = await User.create({
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.getSafeUserData()
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Server error during signup'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: user.getSafeUserData()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: user.getSafeUserData()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { firebaseToken, user: firebaseUser } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: 'Firebase token is required'
      });
    }

    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(firebaseToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        message: 'Invalid Firebase token'
      });
    }

    const { email, uid } = verificationResult.user;

    // Check if user exists
    let user = await User.findByEmail(email);
    
    if (!user) {
      // Create new user with Google data
      user = await User.create({
        email,
        password: null, // No password for Google users
        firebase_uid: uid,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
        provider: 'google'
      });
    } else {
      // Update existing user with Firebase UID if not set
      if (!user.firebase_uid) {
        await User.updateFirebaseUid(user.id, uid);
      }
      // Update last login
      await User.updateLastLogin(user.id);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Google authentication successful',
      token,
      user: user.getSafeUserData()
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      message: 'Server error during Google authentication'
    });
  }
};

// @desc    Firebase email signup
// @route   POST /api/auth/firebase-signup
// @access  Public
const firebaseSignup = async (req, res) => {
  try {
    const { firebaseToken, user: firebaseUser } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: 'Firebase token is required'
      });
    }

    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(firebaseToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        message: 'Invalid Firebase token'
      });
    }

    const { email, uid } = verificationResult.user;

    // Create new user
    const user = await User.create({
      email,
      password: null, // Password managed by Firebase
      firebase_uid: uid,
      provider: 'firebase'
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully with Firebase',
      token,
      user: user.getSafeUserData()
    });

  } catch (error) {
    console.error('Firebase signup error:', error);
    res.status(500).json({
      message: 'Server error during Firebase signup'
    });
  }
};

// @desc    Firebase email login
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res) => {
  try {
    const { firebaseToken, user: firebaseUser } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: 'Firebase token is required'
      });
    }

    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(firebaseToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        message: 'Invalid Firebase token'
      });
    }

    const { email, uid } = verificationResult.user;

    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please sign up first.'
      });
    }

    // Update Firebase UID if not set
    if (!user.firebase_uid) {
      await User.updateFirebaseUid(user.id, uid);
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Firebase login successful',
      token,
      user: user.getSafeUserData()
    });

  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(500).json({
      message: 'Server error during Firebase login'
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  googleAuth,
  firebaseSignup,
  firebaseLogin
};
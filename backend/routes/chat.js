const express = require('express');
const { body } = require('express-validator');
const { sendMessage, getModels } = require('../controllers/chatController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules for chat message
const messageValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 4000 })
    .withMessage('Message is too long (max 4000 characters)')
];

// @route   POST /api/chat
// @desc    Send message to AI
// @access  Private
router.post('/', auth, messageValidation, sendMessage);

// @route   GET /api/chat/models
// @desc    Get available AI models
// @access  Private
router.get('/models', auth, getModels);

module.exports = router;
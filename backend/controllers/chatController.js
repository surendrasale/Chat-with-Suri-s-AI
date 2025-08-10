const axios = require('axios');

// @desc    Send message to OpenRouter AI
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        message: 'Message is required'
      });
    }

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        message: 'OpenRouter API key not configured'
      });
    }

    // Prepare messages for OpenRouter API
    // Include conversation history for context
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message.trim()
      }
    ];

    // Prepare request payload
    const requestPayload = {
      model: 'openai/gpt-4.1-mini',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    const requestHeaders = {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': 'Chat AI App'
    };

    // Log the OpenRouter API call details
    console.log('\n🚀 Making OpenRouter API Call:');
    console.log('📍 URL:', 'https://openrouter.ai/api/v1/chat/completions');
    console.log('🤖 Model:', requestPayload.model);
    console.log('💬 Messages:', JSON.stringify(messages, null, 2));
    console.log('⚙️  Settings:', {
      max_tokens: requestPayload.max_tokens,
      temperature: requestPayload.temperature,
      top_p: requestPayload.top_p
    });
    console.log('🔑 API Key:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 20)}...` : 'NOT SET');
    console.log('⏰ Timestamp:', new Date().toISOString());

    // Make request to OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      requestPayload,
      {
        headers: requestHeaders,
        timeout: 30000 // 30 seconds timeout
      }
    );

    // Log the response
    console.log('\n✅ OpenRouter API Response:');
    console.log('📊 Usage:', response.data.usage);
    console.log('🎯 Response Length:', response.data.choices[0]?.message?.content?.length || 0, 'characters');
    console.log('💰 Cost Info:', response.data.usage ? `${response.data.usage.total_tokens} tokens` : 'N/A');

    // Extract AI response
    const aiResponse = response.data.choices[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({
        message: 'No response received from AI'
      });
    }

    // Return the AI response
    res.json({
      message: 'Response generated successfully',
      response: aiResponse,
      usage: response.data.usage || null
    });

  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    
    // Handle specific OpenRouter API errors
    if (error.response?.status === 401) {
      return res.status(500).json({
        message: 'Invalid OpenRouter API key'
      });
    } else if (error.response?.status === 429) {
      return res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.'
      });
    } else if (error.response?.status === 400) {
      return res.status(400).json({
        message: 'Invalid request to AI service'
      });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        message: 'Request timeout. Please try again.'
      });
    }

    res.status(500).json({
      message: 'Error communicating with AI service'
    });
  }
};

// @desc    Get available models (optional feature)
// @route   GET /api/chat/models
// @access  Private
const getModels = async (req, res) => {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      models: response.data.data || []
    });

  } catch (error) {
    console.error('Models fetch error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error fetching available models'
    });
  }
};

module.exports = {
  sendMessage,
  getModels
};
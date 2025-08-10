const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Connect to PostgreSQL and initialize database
connectDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Serve React app for all non-API routes (this must come after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`📱 Frontend and Backend served from the same port!`);
});
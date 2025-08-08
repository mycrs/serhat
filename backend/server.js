const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const playlistRoutes = require('./routes/playlists');
const categoryRoutes = require('./routes/categories');
const channelRoutes = require('./routes/channels');
const CronService = require('./utils/cronService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/playlists', playlistRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/channels', channelRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Serhat M3U Admin API',
    version: '1.0.0',
    endpoints: {
      playlists: '/api/playlists',
      categories: '/api/categories',
      channels: '/api/channels',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/serhat_m3u', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Initialize cron service after database connection
  if (process.env.NODE_ENV !== 'test') {
    CronService.init();
  }
})
.catch((error) => {
  console.error('Database connection error:', error);
  console.log('Note: MongoDB is required for full functionality. Install and start MongoDB to use all features.');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
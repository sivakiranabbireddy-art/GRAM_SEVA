const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middlewares/errorHandler');
const apiRoutes = require('./routes');
const { getConnectionStatus } = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint with MongoDB status
app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.status(200).json({
    status: 'OK',
    app: 'GramSeva Local Services Platform',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      type: 'MongoDB',
      connected: dbStatus.isConnected,
      dbName: dbStatus.dbName,
      host: dbStatus.host,
      error: dbStatus.error
    }
  });
});

// Middleware to ensure MongoDB is ready before processing API data operations
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB database is currently not connected. Please verify your MONGODB_URI in server/.env (e.g., MongoDB Atlas connection string).',
      code: 'DB_DISCONNECTED'
    });
  }
  next();
});

// Mount API Routes
app.use('/api', apiRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;

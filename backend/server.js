const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const waterRoutes = require('./routes/waterRoutes');


const app = express();
const PORT = process.env.PORT || 4000;

// Import water scheduler
const { scheduleWaterTasks } = require('./utils/waterScheduler');

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      status: 'fail',
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicevitals')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'VoiceVitals Backend Server Running!',
    version: '2.0.0',
    features: ['Authentication', 'Health Records', 'Vitals Tracking', 'User Settings', 'AI Analysis', 'Achievements'],
    endpoints: {
      auth: '/api/auth/*',
      health: '/api/health/*',
      vitals: '/api/vitals/*',
      settings: '/api/settings/*',
      medications: '/api/medications/*',
      achievements: '/api/achievements/*',
      water: '/api/water/*',

    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/water', waterRoutes);




// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🏥 Health endpoints: http://localhost:${PORT}/api/health`);
  console.log(`💓 Vitals endpoints: http://localhost:${PORT}/api/vitals`);
  console.log(`⚙️ Settings endpoints: http://localhost:${PORT}/api/settings`);
  console.log(`💊 Medication endpoints: http://localhost:${PORT}/api/medications`);
  console.log(`🏆 Achievement endpoints: http://localhost:${PORT}/api/achievements`);
  console.log(`💧 Water endpoints: http://localhost:${PORT}/api/water`);

  
  // Start water scheduler
  scheduleWaterTasks();
});

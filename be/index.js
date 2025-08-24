// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`); // Debug log
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Kết nối database
connectDB();

// Import routes sau khi đã load env
const authRoutes = require('./routes/AuthRoute.js');

// Routes
app.use('/api/auth', authRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Bánh Pía Quê Mình đang hoạt động!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/auth/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Specific error handling
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi server!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} không tồn tại`,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🍰 Bánh Pía Quê Mình API v1.0.0`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
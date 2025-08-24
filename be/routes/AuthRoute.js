// routes/AuthRoute.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  resendEmailVerification
} = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');

// Routes công khai (không cần token)
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendEmailVerification);

// Route test server
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

// Routes bảo vệ (cần token)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

// Route test token
router.get('/test-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token hợp lệ',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;

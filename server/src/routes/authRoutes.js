const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register-customer', authController.registerCustomer);
router.post('/register-worker', authController.registerWorker);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.get('/me', authenticateToken, authController.getProfile);

// Password Reset Routes with OTP Verification
router.post('/forgot-password/request-otp', authController.forgotPasswordRequestOtp);
router.post('/forgot-password/verify-otp', authController.forgotPasswordVerifyOtp);
router.post('/forgot-password/reset', authController.forgotPasswordReset);

module.exports = router;

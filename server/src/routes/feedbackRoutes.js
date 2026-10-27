const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Customer submits feedback
router.post('/', authenticateToken, requireRole('CUSTOMER'), feedbackController.submitFeedback);

// Worker views feedback
router.get('/worker/:workerId', feedbackController.getWorkerFeedback);

// Admin views all feedback
router.get('/', authenticateToken, requireRole('ADMIN'), feedbackController.getAllFeedback);

module.exports = router;

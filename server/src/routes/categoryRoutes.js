const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Public route to view active service categories
router.get('/', categoryController.getCategories);

// Admin routes
router.get('/all', authenticateToken, requireRole('ADMIN'), categoryController.getAllCategoriesAdmin);
router.post('/', authenticateToken, requireRole('ADMIN'), categoryController.createCategory);
router.put('/:id', authenticateToken, requireRole('ADMIN'), categoryController.updateCategory);

module.exports = router;

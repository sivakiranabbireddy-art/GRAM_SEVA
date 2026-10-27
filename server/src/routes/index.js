const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const workerRoutes = require('./workerRoutes');
const adminRoutes = require('./adminRoutes');
const categoryRoutes = require('./categoryRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);
router.use('/worker', workerRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;

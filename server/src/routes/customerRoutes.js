const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(requireRole('CUSTOMER'));

router.get('/bookings', customerController.getMyBookings);
router.post('/bookings', customerController.createBooking);
router.put('/bookings/:id/cancel', customerController.cancelBooking);
router.put('/bookings/:id/confirm', customerController.confirmCompletion);
router.put('/bookings/:id/dispute', customerController.raiseDispute);
router.put('/profile', customerController.updateProfile);

module.exports = router;

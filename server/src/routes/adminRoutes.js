const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/stats', adminController.getDashboardStats);
router.get('/customers', adminController.getCustomers);
router.put('/customers/:id/toggle-status', adminController.toggleCustomerStatus);

router.get('/workers', adminController.getWorkers);
router.put('/workers/:id/approve', adminController.approveWorker);
router.put('/workers/:id/approval', adminController.updateWorkerApproval);

router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id/candidates', adminController.getMatchingCandidates);
router.put('/bookings/:id/assign', adminController.assignWorker);
router.put('/bookings/:id/resolve-dispute', adminController.resolveDispute);
router.get('/bookings/export-csv', adminController.exportBookingsCsv);

router.post('/reset-demo', adminController.resetDemoData);

module.exports = router;

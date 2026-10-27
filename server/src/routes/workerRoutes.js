const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(requireRole('WORKER'));

router.get('/tasks', workerController.getMyTasks);
router.put('/availability', workerController.toggleAvailability);
router.put('/tasks/:id/accept', workerController.acceptTask);
router.put('/tasks/:id/reject', workerController.rejectTask);
router.put('/tasks/:id/start', workerController.startTask);
router.put('/tasks/:id/complete', workerController.completeTask);
router.put('/profile', workerController.updateProfile);

module.exports = router;

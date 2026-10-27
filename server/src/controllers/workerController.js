const { Booking, Worker } = require('../models');
const { createNotification } = require('../services/notificationService');

/**
 * Get all tasks assigned to the authenticated worker
 */
async function getMyTasks(req, res, next) {
  try {
    const workerTasks = await Booking.find({ assignedWorkerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      tasks: workerTasks
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle Worker Availability Status (Online / Offline)
 */
async function toggleAvailability(req, res, next) {
  try {
    const { isAvailable } = req.body;
    const worker = await Worker.findOne({ id: req.user.id });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    worker.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !worker.isAvailable;
    await worker.save();

    return res.status(200).json({
      success: true,
      message: `Availability updated to: ${worker.isAvailable ? 'Available' : 'Unavailable'}`,
      isAvailable: worker.isAvailable
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Worker Accepts an Assigned Service Request
 */
async function acceptTask(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id, assignedWorkerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Assignment not found or not assigned to you.' });
    }

    if (booking.status !== 'WORKER_ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: `Task cannot be accepted. Current status is ${booking.status}`
      });
    }

    const now = new Date().toISOString();
    booking.status = 'ACCEPTED';
    booking.timeline.push({
      status: 'ACCEPTED',
      timestamp: now,
      note: 'Worker accepted the task assignment and confirmed schedule.',
      by: req.user.name
    });

    await booking.save();

    // Notify Customer
    await createNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: 'Worker Accepted Your Booking!',
      message: `${req.user.name} accepted your service request for ${booking.categoryName}.`,
      link: '/customer'
    });

    // Notify Admin
    await createNotification({
      role: 'ADMIN',
      title: 'Worker Accepted Assignment',
      message: `Worker ${req.user.name} accepted assignment for booking ${booking.id}.`,
      link: '/admin'
    });

    return res.status(200).json({
      success: true,
      message: 'Task accepted! Please visit the location at the scheduled time.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Worker Rejects an Assigned Task with Reason
 */
async function rejectTask(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid reason for rejecting this assignment.' });
    }

    const booking = await Booking.findOne({ id, assignedWorkerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Assignment not found or not assigned to you.' });
    }

    if (booking.status !== 'WORKER_ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: `Only freshly assigned tasks can be rejected. Current status is ${booking.status}`
      });
    }

    const now = new Date().toISOString();
    const rejectedWorkerName = req.user.name;

    booking.status = 'REJECTED_BY_WORKER';
    booking.rejectionReason = reason.trim();
    booking.lastRejectedWorkerId = req.user.id;
    booking.assignedWorkerId = null;
    booking.assignedWorkerName = null;
    booking.assignedWorkerPhone = null;

    booking.timeline.push({
      status: 'REJECTED_BY_WORKER',
      timestamp: now,
      note: `Worker ${rejectedWorkerName} rejected assignment. Reason: ${reason.trim()}`,
      by: rejectedWorkerName
    });

    await booking.save();

    // Notify Admin with Alert to reassign
    await createNotification({
      role: 'ADMIN',
      title: '⚠️ Assignment Rejected by Worker',
      message: `Worker ${rejectedWorkerName} rejected booking ${booking.id}. Reason: "${reason.trim()}". Reassignment needed.`,
      link: '/admin',
      metadata: { bookingId: booking.id }
    });

    return res.status(200).json({
      success: true,
      message: 'Task rejected. Admin has been notified for reassignment.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Worker starts the task (moves to IN_PROGRESS)
 */
async function startTask(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id, assignedWorkerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Task must be accepted before starting. Current status is ${booking.status}`
      });
    }

    const now = new Date().toISOString();
    booking.status = 'IN_PROGRESS';
    booking.timeline.push({
      status: 'IN_PROGRESS',
      timestamp: now,
      note: 'Worker has arrived at location and commenced service work.',
      by: req.user.name
    });

    await booking.save();

    // Notify customer
    await createNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: 'Service Work In Progress',
      message: `${req.user.name} has started work on your booking ${booking.id}.`,
      link: '/customer'
    });

    return res.status(200).json({
      success: true,
      message: 'Service marked as In Progress.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Worker marks task as completed with completion notes
 */
async function completeTask(req, res, next) {
  try {
    const { id } = req.params;
    const { completionNote = 'Service completed as requested.' } = req.body;

    const booking = await Booking.findOne({ id, assignedWorkerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: `Task must be IN_PROGRESS before marking completed. Current status is ${booking.status}`
      });
    }

    const now = new Date().toISOString();
    booking.status = 'AWAITING_CONFIRMATION';
    booking.completionNote = completionNote;
    booking.completionTime = now;
    booking.timeline.push({
      status: 'AWAITING_CONFIRMATION',
      timestamp: now,
      note: `Worker finished service work. Notes: ${completionNote}`,
      by: req.user.name
    });

    await booking.save();

    // Notify customer to confirm
    await createNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: 'Service Completed! Please Confirm',
      message: `Worker ${req.user.name} has marked your service as completed. Please inspect and confirm completion.`,
      link: '/customer',
      metadata: { bookingId: booking.id }
    });

    return res.status(200).json({
      success: true,
      message: 'Task marked as completed! Waiting for customer confirmation.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Worker Profile
 */
async function updateProfile(req, res, next) {
  try {
    const { skills, serviceArea, pincode, experienceYears, description } = req.body;
    const updateFields = {};

    if (skills) {
      updateFields.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (serviceArea) updateFields.serviceArea = serviceArea.trim();
    if (pincode) updateFields.pincode = pincode.toString().trim();
    if (experienceYears !== undefined) updateFields.experienceYears = parseInt(experienceYears, 10);
    if (description) updateFields.description = description.trim();

    const updatedWorker = await Worker.findOneAndUpdate(
      { id: req.user.id },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updatedWorker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully.',
      worker: updatedWorker
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyTasks,
  toggleAvailability,
  acceptTask,
  rejectTask,
  startTask,
  completeTask,
  updateProfile
};

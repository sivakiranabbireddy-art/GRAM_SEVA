const { Booking, Category, Worker, User } = require('../models');
const { createNotification } = require('../services/notificationService');

/**
 * Customer creates a new service booking request
 */
async function createBooking(req, res, next) {
  try {
    const {
      categoryId,
      categoryName,
      description,
      address,
      locality,
      pincode,
      preferredDate,
      preferredTimeSlot,
      contactNumber,
      attachmentUrl
    } = req.body;

    if (!description || !address || !locality || !pincode || !preferredDate || !preferredTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, address, locality, pincode, preferred date and time slot are required.'
      });
    }

    const category = await Category.findOne({
      $or: [
        { id: categoryId },
        { name: new RegExp(`^${(categoryName || '').trim()}$`, 'i') }
      ]
    });

    const finalCategoryName = category ? category.name : (categoryName || 'General Service');
    const finalCategoryId = category ? category.id : (categoryId || 'cat_general');
    const priceEstimate = category ? category.basePriceEstimate : 299;

    const bookingId = `GSB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newBooking = await Booking.create({
      id: bookingId,
      customerId: req.user.id,
      customerName: req.user.name,
      customerPhone: contactNumber || req.user.phone || '',
      customerAddress: address.trim(),
      locality: locality.trim(),
      pincode: pincode.toString().trim(),
      categoryId: finalCategoryId,
      categoryName: finalCategoryName,
      description: description.trim(),
      preferredDate,
      preferredTimeSlot,
      contactNumber: contactNumber || '',
      attachmentUrl: attachmentUrl || '',
      priceEstimate,
      status: 'REQUESTED',
      assignedWorkerId: null,
      assignedWorkerName: null,
      assignedWorkerPhone: null,
      timeline: [
        {
          status: 'REQUESTED',
          timestamp: now,
          note: 'Customer submitted local service request.',
          by: req.user.name
        }
      ]
    });

    // Notify Administrator for worker matching
    await createNotification({
      role: 'ADMIN',
      title: 'New Service Request',
      message: `Booking ${bookingId} for ${finalCategoryName} in ${locality} requires worker assignment.`,
      link: '/admin',
      metadata: { bookingId }
    });

    return res.status(201).json({
      success: true,
      message: 'Service request created successfully! We will match a verified local worker soon.',
      booking: newBooking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all bookings belonging to the authenticated customer
 */
async function getMyBookings(req, res, next) {
  try {
    const customerBookings = await Booking.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      bookings: customerBookings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Customer cancels an eligible booking (before work starts)
 */
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const booking = await Booking.findOne({ id, customerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const cancelableStatuses = ['REQUESTED', 'WORKER_ASSIGNED', 'ACCEPTED'];
    if (!cancelableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled at this stage (Current status: ${booking.status}). Work is already in progress or completed.`
      });
    }

    const prevWorker = booking.assignedWorkerId;
    const now = new Date().toISOString();

    booking.status = 'CANCELLED';
    booking.cancelReason = reason;
    booking.timeline.push({
      status: 'CANCELLED',
      timestamp: now,
      note: `Booking cancelled: ${reason}`,
      by: req.user.name
    });

    await booking.save();

    // Notify assigned worker if any
    if (prevWorker) {
      await createNotification({
        userId: prevWorker,
        role: 'WORKER',
        title: 'Booking Cancelled',
        message: `Customer cancelled booking ${booking.id} (${booking.categoryName}). Reason: ${reason}`,
        link: '/worker'
      });
    }

    // Notify admin
    await createNotification({
      role: 'ADMIN',
      title: 'Booking Cancelled by Customer',
      message: `Customer ${req.user.name} cancelled booking ${booking.id}.`,
      link: '/admin'
    });

    return res.status(200).json({
      success: true,
      message: 'Booking has been cancelled.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Customer confirms completion after worker marks it AWAITING_CONFIRMATION
 */
async function confirmCompletion(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id, customerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'AWAITING_CONFIRMATION') {
      return res.status(400).json({
        success: false,
        message: `Only bookings awaiting customer confirmation can be finalized. Current status: ${booking.status}`
      });
    }

    const now = new Date().toISOString();
    booking.status = 'COMPLETED';
    booking.timeline.push({
      status: 'COMPLETED',
      timestamp: now,
      note: 'Customer inspected and confirmed successful service completion.',
      by: req.user.name
    });

    await booking.save();

    // Update worker stats
    if (booking.assignedWorkerId) {
      await Worker.updateOne(
        { id: booking.assignedWorkerId },
        {
          $inc: {
            totalCompletedBookings: 1,
            earningsTotal: booking.priceEstimate || 0
          }
        }
      );

      await createNotification({
        userId: booking.assignedWorkerId,
        role: 'WORKER',
        title: 'Work Confirmed by Customer',
        message: `Customer confirmed completion for booking ${booking.id}! Your earnings have been credited.`,
        link: '/worker'
      });
    }

    // Notify admin
    await createNotification({
      role: 'ADMIN',
      title: 'Booking Completed',
      message: `Booking ${booking.id} (${booking.categoryName}) completed and confirmed.`,
      link: '/admin'
    });

    return res.status(200).json({
      success: true,
      message: 'Service marked as completed! Please share your rating and feedback.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Customer raises a dispute regarding a service
 */
async function raiseDispute(req, res, next) {
  try {
    const { id } = req.params;
    const { disputeReason } = req.body;

    if (!disputeReason) {
      return res.status(400).json({ success: false, message: 'Please describe the problem or dispute in detail.' });
    }

    const booking = await Booking.findOne({ id, customerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const now = new Date().toISOString();
    booking.status = 'DISPUTED';
    booking.disputeReason = disputeReason;
    booking.disputeCreatedAt = now;
    booking.timeline.push({
      status: 'DISPUTED',
      timestamp: now,
      note: `Dispute raised: ${disputeReason}`,
      by: req.user.name
    });

    await booking.save();

    // Notify Admin with high priority
    await createNotification({
      role: 'ADMIN',
      title: '⚠️ Customer Dispute Raised',
      message: `Dispute on booking ${booking.id} by ${req.user.name}: "${disputeReason.slice(0, 80)}..."`,
      link: '/admin',
      metadata: { bookingId: booking.id }
    });

    return res.status(200).json({
      success: true,
      message: 'Dispute submitted. GramSeva administrator will review and resolve shortly.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Customer Profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, locality, pincode } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name.trim();
    if (phone) updateFields.phone = phone.trim();
    if (address) updateFields.address = address.trim();
    if (locality) updateFields.locality = locality.trim();
    if (pincode) updateFields.pincode = pincode.toString().trim();

    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { $set: updateFields },
      { new: true }
    ).select('-passwordHash').lean();

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  confirmCompletion,
  raiseDispute,
  updateProfile
};

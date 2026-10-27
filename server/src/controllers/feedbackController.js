const { Feedback, Booking, Worker } = require('../models');
const { createNotification } = require('../services/notificationService');

/**
 * Customer submits feedback for a completed booking
 */
async function submitFeedback(req, res, next) {
  try {
    const { bookingId, rating, review, tags = [] } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID and star rating (1-5) are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    const booking = await Booking.findOne({ id: bookingId, customerId: req.user.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or you are not authorized.' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted after booking completion has been confirmed.'
      });
    }

    const existingFeedback = await Feedback.findOne({ bookingId });
    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: 'Feedback has already been submitted for this booking.'
      });
    }

    const newFeedback = await Feedback.create({
      id: `fb_${Date.now()}`,
      bookingId,
      customerId: req.user.id,
      customerName: req.user.name,
      workerId: booking.assignedWorkerId,
      workerName: booking.assignedWorkerName,
      categoryName: booking.categoryName,
      rating: numRating,
      review: (review || '').trim(),
      tags: Array.isArray(tags) ? tags : [],
      resolutionStatus: 'RESOLVED'
    });

    // Update worker average rating and rating count
    if (booking.assignedWorkerId) {
      const workerReviews = await Feedback.find({ workerId: booking.assignedWorkerId });
      const sumRatings = workerReviews.reduce((sum, r) => sum + r.rating, 0);
      const totalRatings = workerReviews.length;
      const averageRating = Math.round((sumRatings / totalRatings) * 10) / 10;

      await Worker.updateOne(
        { id: booking.assignedWorkerId },
        { $set: { totalRatings, averageRating } }
      );

      // Notify Worker
      await createNotification({
        userId: booking.assignedWorkerId,
        role: 'WORKER',
        title: `New Rating Received: ${numRating} ⭐`,
        message: `${req.user.name} reviewed your work on ${booking.categoryName}: "${(review || '').slice(0, 60)}..."`,
        link: '/worker'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your rating and review!',
      feedback: newFeedback
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get feedback for a specific worker
 */
async function getWorkerFeedback(req, res, next) {
  try {
    const { workerId } = req.params;
    const workerReviews = await Feedback.find({ workerId }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      feedback: workerReviews
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all feedback (Admin)
 */
async function getAllFeedback(req, res, next) {
  try {
    const { rating, search } = req.query;
    const query = {};

    if (rating && rating !== 'ALL') {
      query.rating = parseInt(rating, 10);
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { customerName: regex },
        { workerName: regex },
        { review: regex },
        { bookingId: regex }
      ];
    }

    const feedbackList = await Feedback.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      feedback: feedbackList
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitFeedback,
  getWorkerFeedback,
  getAllFeedback
};

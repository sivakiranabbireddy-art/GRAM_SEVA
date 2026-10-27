const { User, Worker, Booking, Feedback } = require('../models');
const { findAndRankWorkers } = require('../services/matchingService');
const { createNotification } = require('../services/notificationService');
const { seedInitialData } = require('../services/seedService');

/**
 * Get comprehensive analytics and dashboard metrics for Admin
 */
async function getDashboardStats(req, res, next) {
  try {
    const [users, workers, bookings, feedback] = await Promise.all([
      User.find().lean(),
      Worker.find().lean(),
      Booking.find().lean(),
      Feedback.find().lean()
    ]);

    const customers = users.filter(u => u.role === 'CUSTOMER');
    const workerUsers = users.filter(u => u.role === 'WORKER');

    const totalCustomers = customers.length;
    const totalWorkers = workerUsers.length;
    const workersPendingApproval = workers.filter(w => w.status === 'PENDING_APPROVAL').length;
    const approvedWorkers = workers.filter(w => w.status === 'APPROVED').length;

    const totalRequests = bookings.length;
    const pendingRequests = bookings.filter(b => ['REQUESTED', 'REJECTED_BY_WORKER', 'AWAITING_WORKER'].includes(b.status)).length;
    const activeBookings = bookings.filter(b => ['WORKER_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_CONFIRMATION'].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const disputedBookings = bookings.filter(b => b.status === 'DISPUTED').length;

    // Category Distribution for charts
    const categoryCounts = {};
    bookings.forEach(b => {
      const cat = b.categoryName || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryCounts).map(name => ({
      name,
      count: categoryCounts[name]
    })).sort((a, b) => b.count - a.count);

    // Status Distribution for charts
    const statusCounts = {};
    bookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    const statusDistribution = Object.keys(statusCounts).map(name => ({
      name,
      value: statusCounts[name]
    }));

    // Recent 7 days activity
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = bookings.filter(b => {
        const cDate = b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '';
        return cDate === dateStr;
      }).length;

      last7Days.push({
        date: dateStr.slice(5), // MM-DD
        bookings: count
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalWorkers,
        workersPendingApproval,
        approvedWorkers,
        totalRequests,
        pendingRequests,
        activeBookings,
        completedBookings,
        cancelledBookings,
        disputedBookings,
        totalFeedback: feedback.length,
        categoryDistribution,
        statusDistribution,
        recentActivity: last7Days
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get customers list with booking summary
 */
async function getCustomers(req, res, next) {
  try {
    const { search, status } = req.query;
    const [users, bookings] = await Promise.all([
      User.find({ role: 'CUSTOMER' }).select('-passwordHash').lean(),
      Booking.find().select('customerId createdAt').lean()
    ]);

    let customers = users;

    if (status === 'ACTIVE') {
      customers = customers.filter(c => c.isActive !== false);
    } else if (status === 'INACTIVE') {
      customers = customers.filter(c => c.isActive === false);
    }

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.locality && c.locality.toLowerCase().includes(q))
      );
    }

    const customerListWithStats = customers.map(c => {
      const customerBookings = bookings.filter(b => b.customerId === c.id);
      return {
        ...c,
        totalBookings: customerBookings.length,
        lastBookingDate: customerBookings.length > 0 ? customerBookings[0].createdAt : null
      };
    });

    return res.status(200).json({
      success: true,
      customers: customerListWithStats
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle customer account active status
 */
async function toggleCustomerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id, role: 'CUSTOMER' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Customer account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      isActive: user.isActive
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get workers list with approval status and stats
 */
async function getWorkers(req, res, next) {
  try {
    const { status, skill, search } = req.query;

    const [users, workers] = await Promise.all([
      User.find({ role: 'WORKER' }).select('-passwordHash').lean(),
      Worker.find().lean()
    ]);

    let combined = workers.map(w => {
      const u = users.find(user => user.id === w.id);
      return {
        ...w,
        name: u ? u.name : 'Unknown Worker',
        email: u ? u.email : '',
        phone: u ? u.phone : '',
        isActive: u ? u.isActive : true
      };
    });

    if (status && status !== 'ALL') {
      combined = combined.filter(w => w.status === status);
    }

    if (skill && skill !== 'ALL') {
      combined = combined.filter(w =>
        w.skills && w.skills.some(s => s.toLowerCase() === skill.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(w =>
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.email && w.email.toLowerCase().includes(q)) ||
        (w.phone && w.phone.includes(q)) ||
        (w.serviceArea && w.serviceArea.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      workers: combined
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve a pending worker registration
 */
async function approveWorker(req, res, next) {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ id });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    worker.status = 'APPROVED';
    await worker.save();

    // Notify worker
    await createNotification({
      userId: worker.id,
      role: 'WORKER',
      title: 'Profile Approved! 🎉',
      message: 'Congratulations! Your GramSeva worker profile and skills have been approved. You will now receive local service assignments.',
      link: '/worker'
    });

    return res.status(200).json({
      success: true,
      message: 'Worker has been approved and activated.',
      worker
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update worker approval / account status (APPROVED, REJECTED, SUSPENDED, PENDING_APPROVAL)
 */
async function updateWorkerApproval(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const allowedStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING_APPROVAL'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const worker = await Worker.findOne({ id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    worker.status = status;
    if (adminNotes) worker.adminNotes = adminNotes;
    await worker.save();

    // Notify worker
    await createNotification({
      userId: worker.id,
      role: 'WORKER',
      title: `Account Status Updated: ${status}`,
      message: `Your worker profile status has been changed to ${status}.${adminNotes ? ' Note: ' + adminNotes : ''}`,
      link: '/worker'
    });

    return res.status(200).json({
      success: true,
      message: `Worker status updated to ${status}.`,
      worker
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all service booking requests with search, filter, and pagination
 */
async function getAllBookings(req, res, next) {
  try {
    const { status, category, search, date } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (category && category !== 'ALL') {
      query.categoryName = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (date) {
      query.preferredDate = date;
    }

    if (search) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      query.$or = [
        { id: regex },
        { customerName: regex },
        { customerPhone: regex },
        { assignedWorkerName: regex },
        { description: regex },
        { locality: regex }
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get ranked matching candidates for a booking request
 */
async function getMatchingCandidates(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id }).lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const candidates = await findAndRankWorkers(booking);

    return res.status(200).json({
      success: true,
      booking,
      candidates
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Assign a worker to a service request
 */
async function assignWorker(req, res, next) {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ success: false, message: 'Worker ID is required.' });
    }

    const [booking, workerUser, workerProfile] = await Promise.all([
      Booking.findOne({ id }),
      User.findOne({ id: workerId, role: 'WORKER' }).lean(),
      Worker.findOne({ id: workerId }).lean()
    ]);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    if (!workerUser || !workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    if (workerProfile.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign worker. Worker profile is not APPROVED (Current status: ${workerProfile.status}).`
      });
    }

    const now = new Date().toISOString();
    booking.assignedWorkerId = workerUser.id;
    booking.assignedWorkerName = workerUser.name;
    booking.assignedWorkerPhone = workerUser.phone;
    booking.status = 'WORKER_ASSIGNED';

    booking.timeline.push({
      status: 'WORKER_ASSIGNED',
      timestamp: now,
      note: `Admin assigned verified worker ${workerUser.name} to this service request.`,
      by: 'Administrator'
    });

    await booking.save();

    // Notify Worker
    await createNotification({
      userId: workerUser.id,
      role: 'WORKER',
      title: 'New Service Assignment! 📌',
      message: `You have been assigned to Booking ${booking.id} (${booking.categoryName}) in ${booking.locality}. Please accept or reject promptly.`,
      link: '/worker',
      metadata: { bookingId: booking.id }
    });

    // Notify Customer
    await createNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: 'Worker Assigned to Your Request!',
      message: `Verified local worker ${workerUser.name} has been assigned to your service request for ${booking.categoryName}.`,
      link: '/customer',
      metadata: { bookingId: booking.id }
    });

    return res.status(200).json({
      success: true,
      message: `Worker ${workerUser.name} assigned successfully to booking ${booking.id}.`,
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Resolve Customer Dispute
 */
async function resolveDispute(req, res, next) {
  try {
    const { id } = req.params;
    const { resolution, action = 'RESOLVED' } = req.body;

    if (!resolution || !resolution.trim()) {
      return res.status(400).json({ success: false, message: 'Resolution details are required.' });
    }

    const booking = await Booking.findOne({ id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const now = new Date().toISOString();
    booking.disputeResolution = resolution.trim();
    booking.disputeResolvedAt = now;

    if (action === 'CANCEL') {
      booking.status = 'CANCELLED';
      booking.cancelReason = `Dispute resolved with cancellation: ${resolution.trim()}`;
    } else {
      booking.status = 'COMPLETED';
    }

    booking.timeline.push({
      status: booking.status,
      timestamp: now,
      note: `Dispute resolved by Admin: ${resolution.trim()}`,
      by: 'Administrator'
    });

    await booking.save();

    // Notify customer
    await createNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: 'Dispute Resolved by Admin',
      message: `Your dispute for booking ${booking.id} has been resolved: ${resolution.trim()}`,
      link: '/customer'
    });

    // Notify worker if assigned
    if (booking.assignedWorkerId) {
      await createNotification({
        userId: booking.assignedWorkerId,
        role: 'WORKER',
        title: 'Dispute Resolution Notice',
        message: `Dispute on booking ${booking.id} has been resolved by Admin: ${resolution.trim()}`,
        link: '/worker'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dispute has been resolved and recorded.',
      booking
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Export bookings report as CSV
 */
async function exportBookingsCsv(req, res, next) {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

    const headers = [
      'Booking ID',
      'Customer Name',
      'Phone',
      'Locality',
      'Pincode',
      'Category',
      'Preferred Date',
      'Slot',
      'Estimate (INR)',
      'Status',
      'Assigned Worker',
      'Created At'
    ];

    let csv = headers.join(',') + '\n';

    bookings.forEach(b => {
      const row = [
        `"${b.id || ''}"`,
        `"${(b.customerName || '').replace(/"/g, '""')}"`,
        `"${b.customerPhone || b.contactNumber || ''}"`,
        `"${(b.locality || '').replace(/"/g, '""')}"`,
        `"${b.pincode || ''}"`,
        `"${(b.categoryName || '').replace(/"/g, '""')}"`,
        `"${b.preferredDate || ''}"`,
        `"${b.preferredTimeSlot || ''}"`,
        `"${b.priceEstimate || 0}"`,
        `"${b.status || ''}"`,
        `"${(b.assignedWorkerName || 'Unassigned').replace(/"/g, '""')}"`,
        `"${b.createdAt || ''}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=gramseva_bookings_report.csv');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

/**
 * Reset Demo Data endpoint (Strictly for Admin)
 */
async function resetDemoData(req, res, next) {
  try {
    await seedInitialData(true);
    return res.status(200).json({
      success: true,
      message: 'Application demo data has been reset in MongoDB with realistic test accounts and bookings.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getCustomers,
  toggleCustomerStatus,
  getWorkers,
  approveWorker,
  updateWorkerApproval,
  getAllBookings,
  getMatchingCandidates,
  assignWorker,
  resolveDispute,
  exportBookingsCsv,
  resetDemoData
};

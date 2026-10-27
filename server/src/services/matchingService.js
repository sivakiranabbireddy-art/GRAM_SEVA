const { User, Worker, Booking } = require('../models');

/**
 * Rule-Based Worker Matching Algorithm for GramSeva backed by MongoDB
 * Transparent scoring (0 - 100) based on:
 * - Skill / Category Match (Mandatory eligibility)
 * - Approval Status (Must be APPROVED)
 * - Availability Toggle (25 points)
 * - Schedule Conflict on Date & Slot (25 points)
 * - Location Match: Pincode (20 points) & Locality (10 points)
 * - Experience (up to 10 points) & Rating (up to 10 points)
 */
async function findAndRankWorkers(booking) {
  const users = await User.find({ role: 'WORKER', isActive: true }).lean();
  const workers = await Worker.find({ status: 'APPROVED' }).lean();

  const requestedCategory = (booking.categoryId || booking.categoryName || '').toLowerCase().trim();
  const customerPincode = (booking.pincode || '').toString().trim();
  const customerLocality = (booking.locality || '').toLowerCase().trim();
  const preferredDate = booking.preferredDate;
  const preferredTimeSlot = booking.preferredTimeSlot;

  // Find overlapping bookings for conflicting schedule check
  const activeBookings = await Booking.find({
    preferredDate,
    preferredTimeSlot,
    status: { $in: ['WORKER_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] },
    id: { $ne: booking.id }
  }).lean();

  const candidateResults = [];

  for (const workerProfile of workers) {
    const user = users.find(u => u.id === workerProfile.id);
    if (!user) continue;

    // Filter: Skill Match check
    const workerSkills = (workerProfile.skills || []).map(s => s.toLowerCase().trim());
    const hasSkill = workerSkills.some(skill => 
      skill === requestedCategory || 
      skill.includes(requestedCategory) || 
      requestedCategory.includes(skill)
    );

    if (!hasSkill) {
      continue; // Disqualified: lacks required skill
    }

    let score = 0;
    const matchReasons = [];

    // 1. Availability Status (25 points)
    if (workerProfile.isAvailable) {
      score += 25;
      matchReasons.push('Worker is currently marked Available (+25 pts)');
    } else {
      matchReasons.push('Worker is currently marked Busy/Unavailable (0 pts)');
    }

    // 2. Schedule Conflict Check (25 points)
    const conflictingBooking = activeBookings.find(b => b.assignedWorkerId === workerProfile.id);
    const hasConflict = !!conflictingBooking;
    if (!hasConflict) {
      score += 25;
      matchReasons.push('No schedule conflict for requested date and slot (+25 pts)');
    } else {
      matchReasons.push(`Conflict: Worker is assigned to booking ${conflictingBooking.id} in this slot (0 pts)`);
    }

    // 3. Location / Pincode Proximity (up to 30 points)
    const workerPincode = (workerProfile.pincode || '').toString().trim();
    const workerArea = (workerProfile.serviceArea || '').toLowerCase().trim();

    let locationPoints = 0;
    if (customerPincode && workerPincode && customerPincode === workerPincode) {
      locationPoints += 20;
      matchReasons.push(`Exact Pincode Match: ${customerPincode} (+20 pts)`);
    } else if (customerPincode && workerPincode && customerPincode.slice(0, 3) === workerPincode.slice(0, 3)) {
      locationPoints += 10;
      matchReasons.push(`Nearby Postal Sub-district: ${customerPincode.slice(0, 3)}xxx (+10 pts)`);
    }

    if (customerLocality && workerArea && (customerLocality.includes(workerArea) || workerArea.includes(customerLocality))) {
      locationPoints += 10;
      matchReasons.push(`Locality Match: Area matches "${workerProfile.serviceArea}" (+10 pts)`);
    }

    score += locationPoints;

    // 4. Rating Score (up to 10 points)
    const rating = workerProfile.averageRating !== undefined && workerProfile.averageRating !== null 
      ? Number(workerProfile.averageRating) 
      : 4.0;
    const ratingPoints = Math.round((rating / 5) * 10 * 10) / 10;
    score += ratingPoints;
    matchReasons.push(`Performance Rating: ${rating.toFixed(1)}/5 stars (+${ratingPoints} pts)`);

    // 5. Experience Score (up to 10 points)
    const expYears = Number(workerProfile.experienceYears || 0);
    const expPoints = Math.min(Math.round(expYears * 2), 10);
    score += expPoints;
    matchReasons.push(`Experience: ${expYears} year(s) in field (+${expPoints} pts)`);

    candidateResults.push({
      workerId: workerProfile.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      skills: workerProfile.skills,
      serviceArea: workerProfile.serviceArea,
      pincode: workerProfile.pincode,
      experienceYears: workerProfile.experienceYears,
      averageRating: rating,
      totalRatings: workerProfile.totalRatings || 0,
      completedBookings: workerProfile.totalCompletedBookings || 0,
      isAvailable: workerProfile.isAvailable,
      hasConflict,
      score: Math.min(Math.round(score), 100),
      matchReasons
    });
  }

  // Sort descending by score
  candidateResults.sort((a, b) => b.score - a.score);

  return candidateResults;
}

module.exports = {
  findAndRankWorkers
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Worker, Otp } = require('../models');
const { JWT_SECRET } = require('../middlewares/auth');
const { sendOtpEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

/**
 * Generate and dispatch 6-digit OTP for email verification
 */
async function requestOtp(req, res, next) {
  try {
    const { email, name = 'User' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store or update OTP
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash,
        expiresAt,
        attempts: 0
      },
      { upsert: true, new: true }
    );

    const emailResult = await sendOtpEmail(normalizedEmail, otp, name);

    return res.status(200).json({
      success: true,
      message: emailResult.devMode 
        ? 'Verification code generated in demo mode (logged in console and included below for easy testing).'
        : 'Verification code sent to your email address.',
      devMode: emailResult.devMode,
      devOtp: emailResult.devOtp || null
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify 6-digit OTP
 */
async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No verification code found. Please request a new code.' });
    }

    if (Date.now() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Register Customer Account
 */
async function registerCustomer(req, res, next) {
  try {
    const { name, email, phone, password, address, locality, pincode, otp } = req.body;

    if (!name || !email || !phone || !password || !address || !locality || !pincode) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
    }

    // Verify OTP if provided
    if (otp) {
      const otpRecord = await Otp.findOne({ email: normalizedEmail });
      if (otpRecord) {
        const isMatch = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
        if (!isMatch || Date.now() > otpRecord.expiresAt) {
          return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
        }
        await Otp.deleteOne({ email: normalizedEmail });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_cust_${Date.now()}`;

    const newUser = await User.create({
      id: userId,
      role: 'CUSTOMER',
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      address: address.trim(),
      locality: locality.trim(),
      pincode: pincode.toString().trim(),
      isVerified: true,
      isActive: true
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Welcome Notification
    await createNotification({
      userId: newUser.id,
      role: 'CUSTOMER',
      title: 'Welcome to GramSeva! 🌾',
      message: `Namaste ${newUser.name}! Your citizen account is ready. You can now request verified local services with transparent pricing.`,
      link: '/customer'
    });

    const safeUser = newUser.toObject();
    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to GramSeva.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Register Service Worker / Artisan Account
 */
async function registerWorker(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      password,
      skills,
      experienceYears,
      serviceArea,
      pincode,
      description,
      otp
    } = req.body;

    if (!name || !email || !phone || !password || !skills || !serviceArea || !pincode) {
      return res.status(400).json({ success: false, message: 'All worker registration details and trade skills are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
    }

    if (otp) {
      const otpRecord = await Otp.findOne({ email: normalizedEmail });
      if (otpRecord) {
        const isMatch = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
        if (!isMatch || Date.now() > otpRecord.expiresAt) {
          return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
        }
        await Otp.deleteOne({ email: normalizedEmail });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_work_${Date.now()}`;
    const parsedSkills = Array.isArray(skills)
      ? skills
      : skills.split(',').map(s => s.trim()).filter(Boolean);

    const newUser = await User.create({
      id: userId,
      role: 'WORKER',
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      locality: serviceArea.trim(),
      pincode: pincode.toString().trim(),
      isVerified: true,
      isActive: true
    });

    const newWorker = await Worker.create({
      id: userId,
      skills: parsedSkills,
      experienceYears: parseInt(experienceYears, 10) || 1,
      serviceArea: serviceArea.trim(),
      pincode: pincode.toString().trim(),
      description: (description || '').trim(),
      isAvailable: true,
      status: 'PENDING_APPROVAL', // Requires admin review
      averageRating: 5.0,
      totalRatings: 0,
      totalCompletedBookings: 0,
      earningsTotal: 0
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Welcome Notification for Worker
    await createNotification({
      userId: newUser.id,
      role: 'WORKER',
      title: 'Registration Submitted for Review ⏳',
      message: 'Your profile has been submitted. GramSeva administrator will verify your profile and trade skills shortly.',
      link: '/worker'
    });

    // Notify Admin about new worker registration
    await createNotification({
      role: 'ADMIN',
      title: 'New Worker Awaiting Approval 🛠️',
      message: `Worker ${newUser.name} (${parsedSkills.join(', ')}) registered in ${serviceArea}. Review and approve in admin dashboard.`,
      link: '/admin',
      metadata: { workerId: userId }
    });

    const safeUser = { ...newUser.toObject(), ...newWorker.toObject() };
    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Your account is pending admin approval.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Universal Login for Customers and Workers
 */
async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account is registered as ${user.role}, not ${role}. Please use the correct login portal.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact GramSeva support.'
      });
    }

    let extraProfile = {};
    if (user.role === 'WORKER') {
      const worker = await Worker.findOne({ id: user.id }).lean();
      if (worker) extraProfile = worker;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = { ...user.toObject(), ...extraProfile };
    delete safeUser.passwordHash;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Administrator Login
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gramseva.in').toLowerCase();

    // Look up in database or check configured admin email
    let admin = await User.findOne({
      $or: [{ email: normalizedEmail, role: 'ADMIN' }, { email: adminEmail }]
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'ADMIN', name: admin.name, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = admin.toObject();
    delete safeUser.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Admin access granted.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    let extraProfile = {};
    if (user.role === 'WORKER') {
      const worker = await Worker.findOne({ id: user.id }).lean();
      if (worker) extraProfile = worker;
    }

    const safeUser = { ...user.toObject(), ...extraProfile };
    delete safeUser.passwordHash;

    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Request OTP for Password Reset
 */
async function forgotPasswordRequestOtp(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered GramSeva account found with this email address.'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash,
        expiresAt,
        attempts: 0
      },
      { upsert: true, returnDocument: 'after' }
    );

    const emailResult = await sendOtpEmail(normalizedEmail, otp, user.name, 'password_reset');

    return res.status(200).json({
      success: true,
      message: emailResult.devMode
        ? 'Password reset code generated (demo mode: displayed below and logged in console).'
        : 'Password reset code has been sent to your email address.',
      devMode: emailResult.devMode,
      devOtp: emailResult.devOtp || null
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify OTP for Password Reset
 */
async function forgotPasswordVerifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No active reset request found. Please request a new code.' });
    }

    if (Date.now() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Code verified successfully. You may now set a new password.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reset Password using verified OTP
 */
async function forgotPasswordReset(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset session. Please request a new code.' });
    }

    if (Date.now() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    // Delete used OTP
    await Otp.deleteOne({ email: normalizedEmail });

    // Send notification to user account
    await createNotification({
      userId: user.id,
      role: user.role,
      title: 'Security Notice: Password Reset 🔐',
      message: 'Your GramSeva account password was updated successfully. If this was not you, please contact support immediately.',
      link: user.role === 'WORKER' ? '/worker' : '/customer'
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requestOtp,
  verifyOtp,
  registerCustomer,
  registerWorker,
  login,
  adminLogin,
  getProfile,
  forgotPasswordRequestOtp,
  forgotPasswordVerifyOtp,
  forgotPasswordReset
};

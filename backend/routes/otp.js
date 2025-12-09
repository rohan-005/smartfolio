const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOTPEmail, sendPasswordResetOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

const router = express.Router();

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'OTP routes are working!' });
});

// Test email route
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const testOTP = '123456'; // Test OTP
    const result = await sendOTPEmail(email, testOTP, 'Test User');
    
    if (result) {
      res.json({ 
        message: 'Test email sent successfully',
        email,
        success: true
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send test email',
        success: false
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Server error sending test email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      success: false
    });
  }
});

// @desc    Send OTP for email verification
// @route   POST /api/otp/send-verification
// @access  Public
router.post('/send-verification', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otp = user.generateEmailVerificationOTP();
    await user.save();

    const emailSent = await sendOTPEmail(user.email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify OTP for email verification
// @route   POST /api/otp/verify-email
// @access  Public
router.post('/verify-email', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    if (user.emailVerificationOTP !== hashedOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.emailVerificationOTPExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpire = undefined;
    await user.save();

    // Generate JWT so frontend can optionally sign-in the user
    const token = generateToken(user._id);

    res.json({ 
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApprovedByAdmin: user.isApprovedByAdmin
      },
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Forgot password - send OTP
// @route   POST /api/otp/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ 
        message: 'If an account with this email exists, a password reset OTP has been sent',
        email: email
      });
    }

    const otp = user.generatePasswordResetOTP();
    await user.save();

    const emailSent = await sendPasswordResetOTPEmail(user.email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset OTP' });
    }

    res.json({ 
      message: 'Password reset OTP sent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// @desc    Verify password reset OTP
// @route   POST /api/otp/verify-password-reset
// @access  Public
router.post('/verify-password-reset', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.passwordResetOTP || !user.passwordResetOTPExpire) {
      return res.status(400).json({ message: 'No active password reset request found' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    if (user.passwordResetOTP !== hashedOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.passwordResetOTPExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const resetToken = generateToken(user._id, '15m');

    user.clearPasswordResetOTP();
    await user.save();

    res.json({ 
      message: 'OTP verified successfully',
      resetToken,
      email: user.email
    });

  } catch (error) {
    console.error('Verify password reset OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset password with token (after OTP verification)
// @route   PUT /api/otp/reset-password
// @access  Public
router.put('/reset-password', [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resetToken, password } = req.body;

    const jwt = require('jsonwebtoken');
    let decoded;
    
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ 
      message: 'Password reset successful',
      email: user.email
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Resend password reset OTP
// @route   POST /api/otp/resend-password-reset
// @access  Public
router.post('/resend-password-reset', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ 
        message: 'If an account with this email exists, a password reset OTP has been sent',
        email: email
      });
    }

    const otp = user.generatePasswordResetOTP();
    await user.save();

    const emailSent = await sendPasswordResetOTPEmail(user.email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset OTP' });
    }

    res.json({ 
      message: 'Password reset OTP resent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('Resend password reset OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Resend OTP for email verification
// @route   POST /api/otp/resend-otp
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otp = user.generateEmailVerificationOTP();
    await user.save();

    const emailSent = await sendOTPEmail(user.email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP resent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fix the export - this was the main issue
module.exports = router;
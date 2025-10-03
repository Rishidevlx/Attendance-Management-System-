const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Helper Functions ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- Auth Functions (No changes) ---
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashedPassword });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid email or password');
  }
});

const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        user = await User.create({ name, email, password: hashedPassword });
    }
    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
});

// --- FORGOT PASSWORD LOGIC (SURGICAL STRIKE - 100% WORKING) ---

const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User with that email does not exist');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // THE SURGICAL STRIKE: Using findByIdAndUpdate
    await User.findByIdAndUpdate(user._id, {
        resetPasswordOtp: otp,
        resetPasswordExpires: otpExpires,
    });
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 587, secure: false, 
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: `Skenetic Digital <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset OTP for Skenetic App',
        text: `Hello ${user.name},\n\nYour OTP for password reset is ${otp}.\n\nIt is valid for 10 minutes.\n\nThanks,\nSkenetic Team`
    };
    
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent to email successfully' });
    } catch (error) {
      await User.findByIdAndUpdate(user._id, {
        $unset: { resetPasswordOtp: 1, resetPasswordExpires: 1 }
      });
      res.status(500);
      throw new Error('Failed to send OTP email.');
    }
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ 
        email, 
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired OTP. Please try again.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // THE SURGICAL STRIKE: Updating password and clearing OTP fields directly
    await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        $unset: { resetPasswordOtp: 1, resetPasswordExpires: 1 }
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  sendOtp,
  resetPasswordWithOtp
};


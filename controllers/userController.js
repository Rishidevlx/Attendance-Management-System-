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

const formatUserResponse = (user) => {
    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        phone: user.phone,
        domain: user.domain,
        collegeName: user.collegeName,
        howDidYouKnow: user.howDidYouKnow,
        hasCompletedSurvey: user.hasCompletedSurvey,
        token: generateToken(user._id),
    };
};

// --- Auth Functions ---
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  const { name, email, password, phone } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashedPassword, phone });
  if (user) {
    res.status(201).json(formatUserResponse(user));
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
    res.json(formatUserResponse(user));
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
    res.json(formatUserResponse(user));
});


// --- SURVEY LOGIC ---
const updateSurvey = asyncHandler(async (req, res) => {
    const { age, collegeName, domain, howDidYouKnow } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
        user.age = age || user.age;
        user.collegeName = collegeName || user.collegeName;
        user.domain = domain || user.domain;
        user.howDidYouKnow = howDidYouKnow || user.howDidYouKnow;
        user.hasCompletedSurvey = true;

        const updatedUser = await user.save();
        res.json(formatUserResponse(updatedUser));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// --- ADMIN CRUD & DASHBOARD FUNCTIONS ---

const getAllStudents = asyncHandler(async (req, res) => {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const attendanceToday = 0; 
    const todaysStatus = { present: 0, absent: 0, late: 0 };
    res.json({ totalStudents, attendanceToday, todaysStatus });
});

const addStudent = asyncHandler(async (req, res) => {
    const { name, email, password, age, phone, domain } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Student with this email already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const student = await User.create({ name, email, password: hashedPassword, age, phone, domain, role: 'student' });
    if (student) {
        res.status(201).json(student);
    } else {
        res.status(400);
        throw new Error('Invalid student data');
    }
});

const updateStudent = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id);
    if (student) {
        student.name = req.body.name || student.name;
        student.email = req.body.email || student.email;
        student.age = req.body.age || student.age;
        student.phone = req.body.phone || student.phone;
        student.domain = req.body.domain || student.domain;
        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

const deleteStudent = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id);
    if (student) {
        await student.deleteOne();
        res.json({ message: 'Student removed successfully' });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});


// --- PASSWORD RESET FUNCTIONS ---
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) { res.status(404); throw new Error('User with that email does not exist'); }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, { resetPasswordOtp: otp, resetPasswordExpires: otpExpires });
    const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }, tls: { rejectUnauthorized: false } });
    const mailOptions = { from: `Skenetic Digital <${process.env.EMAIL_USER}>`, to: user.email, subject: 'Password Reset OTP', text: `Your OTP is ${otp}.` };
    try { await transporter.sendMail(mailOptions); res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) { await User.findByIdAndUpdate(user._id, { $unset: { resetPasswordOtp: 1, resetPasswordExpires: 1 } }); res.status(500); throw new Error('Failed to send OTP email.'); }
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email, resetPasswordOtp: otp, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) { res.status(400); throw new Error('Invalid or expired OTP.'); }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword, $unset: { resetPasswordOtp: 1, resetPasswordExpires: 1 } });
    res.status(200).json({ message: 'Password has been reset successfully' });
});


// --- THE FIX: Exporting ALL functions ---
module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  updateSurvey,
  getAllStudents,
  getDashboardStats,
  addStudent,
  updateStudent,
  deleteStudent,
  sendOtp,
  resetPasswordWithOtp
};


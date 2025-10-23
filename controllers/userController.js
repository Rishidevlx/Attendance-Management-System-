const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const Information = require('../models/informationModel'); // Import Information model
const VerificationToken = require('../models/verificationTokenModel'); // --- NEW: Import VerificationToken model ---
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail');
const { getProfileUpdateEmailHTML } = require('../utils/emailTemplates');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Funcoes Auxiliares ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUserResponse = (user) => {
    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        age: user.age,
        phone: user.phone,
        domain: user.domain,
        collegeName: user.collegeName,
        howDidYouKnow: user.howDidYouKnow,
        hasCompletedSurvey: user.hasCompletedSurvey,
        createdAt: user.createdAt,
        token: generateToken(user._id),
    };
};

// --- User Profile Functions ---
const getUserProfile = asyncHandler(async (req, res) => {
    // ... (no changes) ...
    const user = await User.findById(req.user.id);
    if (user) {
        res.json(formatUserResponse(user));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    // ... (no changes) ...
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.age = req.body.age || user.age;
        user.phone = req.body.phone || user.phone;

        const updatedUser = await user.save();

        if (req.body.name) {
             await Attendance.updateMany(
                { studentId: user._id },
                { $set: { studentName: updatedUser.name } }
            );
        }

        res.json(formatUserResponse(updatedUser));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserPassword = asyncHandler(async (req, res) => {
    // ... (no changes) ...
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (await bcrypt.compare(oldPassword, user.password)) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});


// --- Funcoes de Autenticacao ---

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public (with verification token)
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array({ onlyFirstError: true })[0].msg });
  }

  const { name, email, password, phone, verificationToken } = req.body;

  // Step 1: Validate Verification Token
  if (!verificationToken) {
    res.status(400);
    throw new Error('Verification token is required.');
  }
  const now = new Date();
  const foundToken = await VerificationToken.findOne({
    token: verificationToken,
    isActive: true,
    expiresAt: { $gt: now },
  });

  if (!foundToken) {
     res.status(400);
     throw new Error('Invalid or expired verification token.');
  }

  // Step 2: Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Step 3: Create User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashedPassword, phone, role: 'student', isActive: true }); // Ensure role and isActive

  if (user) {
    // Don't log in automatically, prompt user to login page
    res.status(201).json({ message: 'Account created successfully! Please sign in.' });
  } else {
    res.status(400);
    throw new Error('Invalid user data during registration');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  // ... (no changes) ...
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array({ onlyFirstError: true })[0].msg });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && !user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated. Please contact an admin.');
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json(formatUserResponse(user));
  } else {
    res.status(400);
    throw new Error('Invalid email or password');
  }
});

// @desc    Authenticate user via Google & get token, or create user if new
// @route   POST /api/users/google-login
// @access  Public (Verification token checked on frontend for NEW users only)
const googleLogin = asyncHandler(async (req, res) => {
    // --- CORRECTED: Expecting Google ID Token (JWT) ---
    const { token } = req.body; // This 'token' MUST be the Google ID Token JWT

    if (!token) {
        res.status(400);
        throw new Error('Google ID token is required.');
    }

    try {
        // --- Verify Google ID Token ---
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Verify it's for our app
        });
        const { name, email, picture } = ticket.getPayload(); // Get user info from token

        if (!email) {
            throw new Error('Could not extract email from Google token.');
        }

        let user = await User.findOne({ email });

        // Check if existing user is deactivated
        if (user && !user.isActive) {
            res.status(403);
            throw new Error('Your account associated with this Google account has been deactivated. Please contact an admin.');
        }

        // If user doesn't exist, create a new one
        if (!user) {
            console.log(`Google Sign-Up: User ${email} not found, creating new account.`);
            // Generate a random password (required by schema, but won't be used for login)
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);
            user = await User.create({
                name: name || 'Google User', // Use name from Google or a default
                email: email,
                password: hashedPassword,
                role: 'student', // Default role for Google sign-ups
                isActive: true, // New users are active by default
                // Optionally add picture: user.picture = picture;
            });
             if (!user) {
                res.status(400);
                throw new Error('Failed to create user account via Google Sign-Up.');
            }
            console.log(`New user created via Google: ${email}`);
        } else {
            console.log(`Existing user logged in via Google: ${email}`);
            // Optionally update user's name or picture from Google if needed
            // if (user.name !== name && name) user.name = name;
            // await user.save();
        }

        // Return user data and OUR app's JWT token
        res.json(formatUserResponse(user));

    } catch (error) {
        console.error("Google login/signup error in backend:", error.message);
        // Handle specific errors like invalid token format or verification failure
        if (error.message.includes("Invalid token") || error.message.includes("Wrong number of segments") || error.message.includes("verifyIdToken")) {
             res.status(401); // Unauthorized
             throw new Error('Invalid or expired Google token. Please try signing in again.');
        }
        res.status(500); // General server error for other issues
        throw new Error('Google authentication failed. Please try again later.');
    }
});

// --- NEW: Check if user exists by email ---
// @desc    Check if a user exists by email
// @route   GET /api/users/check-email/:email
// @access  Public
const checkUserExistsByEmail = asyncHandler(async (req, res) => {
    const email = req.params.email;
    // Basic email format check (optional but recommended)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email parameter is required.' });
    }
    try {
        // Find user, select only _id to be efficient
        const user = await User.findOne({ email: email }).select('_id');
        res.json({ exists: !!user }); // Return true if user exists, false otherwise
    } catch (error) {
        console.error("Error checking user existence:", error);
        // Avoid sending detailed error messages to the client
        res.status(500).json({ message: 'Server error while checking user existence.' });
    }
});


// --- LOGICA DO INQUERITO ---
const updateSurvey = asyncHandler(async (req, res) => {
    // ... (no changes) ...
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


// --- FUNCOES CRUD & DASHBOARD DO ADMIN ---
const getAllStudents = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
});

const getStudentInfoData = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaysPosts, pinnedPosts, recentPolls, allPosts] = await Promise.all([
        Information.find({ createdAt: { $gte: todayStart } }).sort({ createdAt: -1 }),
        Information.find({ isPinned: true }).sort({ createdAt: -1 }),
        Information.find({ type: 'poll' }).sort({ createdAt: -1 }).limit(5),
        Information.find({}).sort({ isPinned: -1, createdAt: -1 }) // For the main feed
    ]);

    res.json({ todaysPosts, pinnedPosts, recentPolls, allPosts });
});

const getAdminDashboardData = asyncHandler(async (req, res) => {
    // ... (no changes) ...
      const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Obter todas as estatisticas base
    const [
        totalStudents,
        pendingRequestsCount,
        lateRequestsCount,
        leaveRequestsCount,
        todaysRecords,
        allStudents
    ] = await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        Attendance.countDocuments({ status: 'Pending', type: 'Check-in' }),
        Attendance.countDocuments({ status: 'Late', type: 'Check-in' }), // Count pending late requests
        Attendance.countDocuments({ status: 'Pending', type: 'Leave' }),
        Attendance.find({ date: { $gte: todayStart, $lt: todayEnd }, type: 'Check-in' }),
        User.find({ role: 'student' }).select('name email phone domain isActive _id') // Need _id for map key
    ]);

    // 2. Processar os registos de hoje e criar um mapa para consulta rapida
    let todaysPresentCount = 0;
    let todaysAbsentCount = 0;
    let todaysLateCount = 0; // Count students marked as late (present but late)

    // Initialize map with all active students marked as 'Absent' initially for today
    const studentStatusMap = new Map(
      allStudents
        .filter(s => s.isActive) // Only consider active students for today's status
        .map(s => [s._id.toString(), { status: 'Absent', details: s, wasLate: false }])
    );


    // Update status based on today's attendance records
    todaysRecords.forEach(record => {
        const studentId = record.studentId.toString();
        if (studentStatusMap.has(studentId)) {
            // Update status only if it's not 'Pending' (already processed)
            if (record.status !== 'Pending') {
                 studentStatusMap.get(studentId).status = record.status;
                 studentStatusMap.get(studentId).wasLate = record.wasLate; // Store if they were late
            }
        }
    });

    // Count final statuses
    Array.from(studentStatusMap.values()).forEach(s => {
        if(s.status === 'Present') {
            todaysPresentCount++;
            if(s.wasLate) {
                todaysLateCount++; // Increment late count if present but wasLate
            }
        } else if (s.status === 'Absent') {
            todaysAbsentCount++;
        }
        // 'Late' status (pending late) is counted in lateRequestsCount, not here
    });

    const absentTodayList = Array.from(studentStatusMap.values())
        .filter(s => s.status === 'Absent')
        .map(s => s.details); // Get details of absent students

    // 3. Obter as tendencias de assiduidade dos ultimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const attendanceTrend = await Attendance.aggregate([
        { $match: { date: { $gte: thirtyDaysAgo }, type: 'Check-in', status: { $in: ['Present', 'Absent']} } }, // Only count final statuses
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
            absentCount: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
        }},
        { $sort: { _id: 1 } }
    ]);

    const trendMap = new Map(attendanceTrend.map(item => [item._id, { present: item.presentCount, absent: item.absentCount }]));
    const last30DaysAttendance = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        last30DaysAttendance.push({
            date: dateString,
            presentCount: trendMap.get(dateString)?.present || 0,
            absentCount: trendMap.get(dateString)?.absent || 0,
        });
    }

    // 4. Calculo de assiduidade por dominio
    const domainData = await User.aggregate([
        { $match: { role: 'student', isActive: true, domain: { $ne: null, $ne: "" } } },
        { $group: { _id: "$domain", studentIds: { $push: "$_id" }, totalStudents: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    const domainAttendancePromises = domainData.map(async (domain) => {
        const studentIds = domain.studentIds;

        const [presentCount, absentCount] = await Promise.all([
            Attendance.countDocuments({
                studentId: { $in: studentIds },
                date: { $gte: todayStart, $lt: todayEnd },
                status: 'Present',
                type: 'Check-in' // Ensure we only count check-ins
            }),
             Attendance.countDocuments({
                studentId: { $in: studentIds },
                date: { $gte: todayStart, $lt: todayEnd },
                status: 'Absent',
                type: 'Check-in' // Ensure we only count check-ins
            })
        ]);

        return {
            domain: domain._id,
            totalStudents: domain.totalStudents,
            // Calculate percentage based on total ACTIVE students in that domain
            presentPercentage: domain.totalStudents > 0 ? (presentCount / domain.totalStudents) * 100 : 0,
            absentPercentage: domain.totalStudents > 0 ? (absentCount / domain.totalStudents) * 100 : 0,
        };
    });

    const domainWiseAttendance = await Promise.all(domainAttendancePromises);

    res.json({
        totalStudents: await User.countDocuments({ role: 'student', isActive: true }), // Recalculate based on active only
        todaysPresent: todaysPresentCount,
        todaysAbsent: todaysAbsentCount,
        todaysLate: todaysLateCount, // Students who are present but were late
        pendingRequestsCount, // Check-in pending
        lateRequestsCount, // Late check-in pending
        leaveRequestsCount, // Leave pending
        last30DaysAttendance,
        absentTodayList,
        domainWiseAttendance
    });
});

const addStudent = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const { name, email, password, age, phone, domain } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Student with this email already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Add student with isActive: true by default
    const student = await User.create({ name, email, password: hashedPassword, age, phone, domain, role: 'student', isActive: true });
    if (student) {
        res.status(201).json(student);
    } else {
        res.status(400);
        throw new Error('Invalid student data');
    }
});

const updateStudent = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const student = await User.findById(req.params.id);

    if (student) {
        const updatedFields = {};

        // Track changes for email notification
        if (req.body.name && req.body.name !== student.name) updatedFields.name = req.body.name;
        if (req.body.email && req.body.email !== student.email) {
            // Check if new email already exists
            const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: student._id } });
            if (emailExists) {
                res.status(400);
                throw new Error('Email already associated with another account.');
            }
            updatedFields.email = req.body.email;
        }
        if (req.body.age && req.body.age !== student.age) updatedFields.age = req.body.age;
        if (req.body.phone && req.body.phone !== student.phone) updatedFields.phone = req.body.phone;
        if (req.body.domain && req.body.domain !== student.domain) updatedFields.domain = req.body.domain;

        // Apply updates
        student.name = req.body.name || student.name;
        student.email = req.body.email || student.email;
        student.age = req.body.age || student.age;
        student.phone = req.body.phone || student.phone;
        student.domain = req.body.domain || student.domain;
        // Optionally update isActive status if provided
        if (req.body.isActive !== undefined) {
            student.isActive = req.body.isActive;
             if (student.isActive !== req.body.isActive) updatedFields.status = req.body.isActive ? 'Activated' : 'Deactivated';
        }

        const updatedStudent = await student.save();

        // Update name in attendance records if changed
        if (updatedFields.name) {
            await Attendance.updateMany(
                { studentId: student._id },
                { $set: { studentName: updatedFields.name } }
            );
        }

        // Send notification email if any fields were actually updated
        if (Object.keys(updatedFields).length > 0) {
            const html = getProfileUpdateEmailHTML(student.name, updatedFields);
            sendEmail(student.email, 'Your Skenetic Profile Has Been Updated', html);
        }

        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

const deleteStudent = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const student = await User.findById(req.params.id);
    if (student) {
        // Also delete associated attendance records
        await Attendance.deleteMany({ studentId: student._id });
        await student.deleteOne();
        res.json({ message: 'Student and associated attendance removed successfully' });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

const deleteBulkStudents = asyncHandler(async (req, res) => {
    // ... (no changes) ...
      const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('No student IDs provided');
    }

     // Also delete associated attendance records
    await Attendance.deleteMany({ studentId: { $in: ids } });
    const result = await User.deleteMany({ _id: { $in: ids }, role: 'student' });

    if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} students and associated attendance deleted successfully.` });
    } else {
        res.status(404);
        throw new Error('No matching students found to delete.');
    }
});


// --- FUNCOES DE RESET DE PASSWORD ---
const sendOtp = asyncHandler(async (req, res) => {
    // ... (no changes) ...
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) { res.status(404); throw new Error('User with that email does not exist'); }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    // Save OTP and expiry to user document
    user.passwordResetOtp = otp;
    user.passwordResetExpires = otpExpires;
    await user.save();
    // Send OTP email (using sendEmail utility for consistency)
    const emailHtml = `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`;
    try {
        await sendEmail(user.email, 'Your Password Reset OTP', emailHtml);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        // If email fails, clear OTP fields to allow retry
        user.passwordResetOtp = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        console.error("Failed to send OTP email:", error);
        res.status(500);
        throw new Error('Failed to send OTP email.');
    }
});

const resetPasswordWithOtp = asyncHandler(async (req, res) => {
    // ... (no changes) ...
      const { email, otp, password } = req.body;
    // Find user by email, OTP, and ensure OTP hasn't expired
    const user = await User.findOne({
        email,
        passwordResetOtp: otp,
        passwordResetExpires: { $gt: Date.now() } // Check if expiry is greater than now
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired OTP.');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
});


// --- Funcao para alternar o estado ativo do aluno ---
const updateStudentStatus = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const student = await User.findById(req.params.id);
    if (student) {
        student.isActive = req.body.isActive; // Expecting { isActive: true/false } in body
        await student.save();
        res.json({ message: `Student status updated to ${student.isActive ? 'Active' : 'Inactive'}` });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Admin updates their own password
// @route   PUT /api/users/admin/change-password
// @access  Private (Admin)
const updateAdminPassword = asyncHandler(async (req, res) => {
    // ... (no changes) ...
     const { oldPassword, newPassword } = req.body;
    // Assuming admin middleware sets req.user
    const admin = await User.findById(req.user.id);

    if (!admin) {
        res.status(404);
        throw new Error('Admin user not found.'); // Should not happen if protect/admin middleware works
    }
     if (admin.role !== 'admin') {
         res.status(403);
         throw new Error('User is not an admin.');
     }

    // Check if old password matches
    if (await bcrypt.compare(oldPassword, admin.password)) {
        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        res.json({ message: 'Admin password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});


module.exports = {
  registerUser, loginUser, googleLogin, updateSurvey,
  getAllStudents, addStudent, updateStudent, deleteStudent, // Removed getDashboardStats
  sendOtp, resetPasswordWithOtp,
  updateStudentStatus, updateAdminPassword,
  deleteBulkStudents,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getAdminDashboardData,
  getStudentInfoData,
  checkUserExistsByEmail // Export new function
};


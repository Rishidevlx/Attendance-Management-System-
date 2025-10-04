const asyncHandler = require('express-async-handler');
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// @desc    Student creates a check-in request
// @route   POST /api/attendance/check-in
// @access  Private (Student)
const createCheckIn = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRequest = await Attendance.findOne({
        studentId: req.user.id,
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    if (existingRequest) {
        res.status(400);
        throw new Error('You have already submitted a request for today.');
    }

    const attendance = new Attendance({
        studentId: req.user.id,
        date: new Date(),
        type: 'Check-in',
        status: 'Pending',
        reason: '-'
    });

    const createdAttendance = await attendance.save();
    res.status(201).json(createdAttendance);
});

// @desc    Get student's own attendance history
// @route   GET /api/attendance/history
// @access  Private (Student)
const getMyAttendanceHistory = asyncHandler(async (req, res) => {
    const history = await Attendance.find({ studentId: req.user.id }).sort({ date: -1 });
    res.json(history);
});

// @desc    Get all attendance requests for admin
// @route   GET /api/attendance/requests
// @access  Private (Admin)
const getAttendanceRequests = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({})
        .populate('studentId', 'name')
        .sort({ date: -1 });

    const formattedRequests = requests.map(req => ({
        _id: req._id,
        studentName: req.studentId ? req.studentId.name : 'Unknown Student',
        date: req.date,
        status: req.status
    }));

    res.json(formattedRequests);
});


// @desc    Admin updates an attendance request status
// @route   PUT /api/attendance/requests/:id
// @access  Private (Admin)
const updateAttendanceStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('User is not authorized to perform this action.');
    }

    const { status } = req.body;
    const attendanceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
        res.status(400);
        throw new Error('Invalid attendance ID');
    }
    
    const attendance = await Attendance.findById(attendanceId);

    if (attendance) {
        attendance.status = status || attendance.status;
        const updatedAttendance = await attendance.save();
        res.json(updatedAttendance);
    } else {
        res.status(404);
        throw new Error('Attendance record not found.');
    }
});

// --- NEW FUNCTION ---
// @desc    Get all attendance records for admin reports
// @route   GET /api/attendance/reports
// @access  Private (Admin)
const getAttendanceReports = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view reports.');
    }

    // Fetch all non-pending records and populate student name
    const reports = await Attendance.find({ status: { $ne: 'Pending' } })
        .populate('studentId', 'name')
        .sort({ date: -1 });

    const formattedReports = reports
        .filter(report => report.studentId) // Ensure student exists
        .map(report => ({
            _id: report._id,
            name: report.studentId.name,
            date: report.date,
            status: report.status,
            reason: report.reason || '-',
        }));

    res.json(formattedReports);
});


module.exports = {
    createCheckIn,
    getMyAttendanceHistory,
    getAttendanceRequests,
    updateAttendanceStatus,
    getAttendanceReports // --- EXPORT THE NEW FUNCTION ---
};


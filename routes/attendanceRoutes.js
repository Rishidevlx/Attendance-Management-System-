const express = require('express');
const router = express.Router();
const { 
    createCheckIn,
    getMyAttendanceHistory,
    getAttendanceRequests,
    updateAttendanceStatus,
    getAttendanceReports // --- IMPORT THE NEW FUNCTION ---
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Student Routes ---
router.route('/check-in').post(protect, createCheckIn);
router.route('/history').get(protect, getMyAttendanceHistory);

// --- Admin Routes ---
router.route('/requests').get(protect, admin, getAttendanceRequests);
router.route('/requests/:id').put(protect, admin, updateAttendanceStatus);
// --- NEW ROUTE for Reports ---
router.route('/reports').get(protect, admin, getAttendanceReports);


module.exports = router;


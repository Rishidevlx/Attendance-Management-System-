const express = require('express');
const router = express.Router();
const { 
    createCheckIn,
    getMyAttendanceHistory,
    getAttendanceRequests,
    getTodaysHistory,
    getLateRequests,
    getTodaysLateHistory, 
    updateAttendanceStatus,
    getAttendanceReports,
    getLeaveSummary,
    deleteAttendanceRecord,
    deleteBulkAttendanceRecords,
    bulkUpdateAttendanceStatus,
    createLeaveRequest,
    getMyLeaveHistory,
    getLeaveRequestsAdmin,
    updateLeaveRequestStatus,
    // --- NEW: Importing admin history function ---
    getLeaveRequestsHistoryAdmin
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Student Check-in Routes ---
router.route('/check-in').post(protect, createCheckIn);
router.route('/history').get(protect, getMyAttendanceHistory);

// --- Student Leave Routes ---
router.route('/leave-request').post(protect, createLeaveRequest);
router.route('/leave-history').get(protect, getMyLeaveHistory);

// --- Admin Check-in Management Routes ---
router.route('/requests').get(protect, admin, getAttendanceRequests);
router.route('/requests/bulk-update').post(protect, admin, bulkUpdateAttendanceStatus);
router.route('/requests/:id').put(protect, admin, updateAttendanceStatus);

// --- Admin Leave Management Routes ---
router.route('/leave-requests').get(protect, admin, getLeaveRequestsAdmin);
// --- NEW: Route for admin history ---
router.route('/leave-requests-history').get(protect, admin, getLeaveRequestsHistoryAdmin);
router.route('/leave-requests/:id').put(protect, admin, updateLeaveRequestStatus);


// --- Admin Reporting & History Routes ---
router.route('/reports').get(protect, admin, getAttendanceReports);
router.route('/reports/:id').delete(protect, admin, deleteAttendanceRecord);
router.route('/reports/bulk-delete').post(protect, admin, deleteBulkAttendanceRecords);
router.route('/leave-summary').get(protect, admin, getLeaveSummary);
router.route('/late-requests').get(protect, admin, getLateRequests);
router.route('/today-history').get(protect, admin, getTodaysHistory);
router.route('/today-late-history').get(protect, admin, getTodaysLateHistory);


module.exports = router;


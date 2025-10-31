const express = require('express');
const router = express.Router();
const {
    createCheckIn,
    getMyAttendanceHistory,
    // --- IMPORT NEW FUNCTION ---
    getMyLateHistory,
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
    getLeaveRequestsHistoryAdmin
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Student Check-in & History Routes ---
router.route('/check-in').post(protect, createCheckIn);
router.route('/history').get(protect, getMyAttendanceHistory);
// --- ADD NEW ROUTE ---
router.route('/late-history').get(protect, getMyLateHistory); // New route for student's late history

// --- Student Leave Routes ---
router.route('/leave-request').post(protect, createLeaveRequest);
router.route('/leave-history').get(protect, getMyLeaveHistory);

// --- Admin Check-in Management Routes ---
router.route('/requests').get(protect, admin, getAttendanceRequests);
router.route('/requests/bulk-update').post(protect, admin, bulkUpdateAttendanceStatus);
router.route('/requests/:id').put(protect, admin, updateAttendanceStatus); // Handles Present/Absent for Check-ins

// --- Admin Leave Management Routes ---
router.route('/leave-requests').get(protect, admin, getLeaveRequestsAdmin); // Pending Leaves
router.route('/leave-requests-history').get(protect, admin, getLeaveRequestsHistoryAdmin); // Processed Leaves
router.route('/leave-requests/:id').put(protect, admin, updateLeaveRequestStatus); // Handles Approved/Declined for Leaves


// --- Admin Reporting & History Routes ---
router.route('/reports').get(protect, admin, getAttendanceReports); // Combined Check-in/Leave History
router.route('/reports/:id').delete(protect, admin, deleteAttendanceRecord); // Delete ANY record by ID
router.route('/reports/bulk-delete').post(protect, admin, deleteBulkAttendanceRecords); // Bulk delete ANY records by IDs
router.route('/leave-summary').get(protect, admin, getLeaveSummary); // Summary of Absent/Late Check-ins
router.route('/late-requests').get(protect, admin, getLateRequests); // Pending Check-ins marked 'Late'
router.route('/today-history').get(protect, admin, getTodaysHistory); // Today's Processed Check-ins
router.route('/today-late-history').get(protect, admin, getTodaysLateHistory); // Today's Processed Check-ins that were late


module.exports = router;

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getAttendanceTimes } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin mattum dhan settings-a paaka and maatha mudiyum
router.route('/')
    .get(protect, admin, getSettings)
    .put(protect, admin, updateSettings);

// --- NEW: Route for any logged-in user to get times ---
// Student page, check-in time ah therinjika indha route use aagum
router.route('/times').get(protect, getAttendanceTimes);


module.exports = router;

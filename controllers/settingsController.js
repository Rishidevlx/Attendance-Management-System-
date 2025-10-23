const asyncHandler = require('express-async-handler');
const Settings = require('../models/settingsModel');

// @desc    Get application settings
// @route   GET /api/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ settingName: 'attendance' });
    if (!settings) {
        settings = await Settings.create({}); 
    }
    res.json(settings);
});

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
    const { value } = req.body;
    
    const settings = await Settings.findOneAndUpdate(
        { settingName: 'attendance' },
        { value },
        { new: true, upsert: true }
    );

    res.json(settings);
});

// --- NEW: Function for any logged-in user to get times ---
// @desc    Get just attendance time settings
// @route   GET /api/settings/times
// @access  Private (Any logged-in user)
const getAttendanceTimes = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ settingName: 'attendance' });
     if (!settings) {
        // Default time vechi anupurom, settings illa naalum app crash aagadhu
        return res.json({ value: { startTime: '18:00', endTime: '18:30', lateTime: '18:45' } });
    }
    res.json(settings);
});


module.exports = { getSettings, updateSettings, getAttendanceTimes };

const express = require('express');
const router = express.Router();
const {
  generateAutoToken,
  createManualToken,
  getActiveToken,
  validateToken,
} = require('../controllers/verificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes to manage tokens
router.route('/auto').post(protect, admin, generateAutoToken);
router.route('/manual').post(protect, admin, createManualToken);
router.route('/active').get(protect, admin, getActiveToken); // Admin gets the current active token

// Public route for validation during registration
router.route('/validate').post(validateToken); // No 'protect' or 'admin' needed

module.exports = router;

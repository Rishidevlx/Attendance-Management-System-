const { body } = require('express-validator');

exports.validateRegister = [
  body('name', 'Name is required').not().isEmpty().trim().escape(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('phone', 'Please enter a valid 10-digit phone number').optional({ checkFalsy: true }).isLength({ min: 10, max: 10 }).isNumeric(), // Made phone optional
  body('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
  // --- NEW: Add validation for the verification token ---
  body('verificationToken', 'Verification token is required').not().isEmpty().trim(),
];

exports.validateLogin = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists(),
];

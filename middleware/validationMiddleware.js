const { body } = require('express-validator');

exports.validateRegister = [
  body('name', 'Name is required').not().isEmpty().trim().escape(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  // Phone validation is already here, which is why we don't need a separate middleware
  body('phone', 'Please enter a valid 10-digit phone number').isLength({ min: 10, max: 10 }).isNumeric(),
  body('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
];

exports.validateLogin = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists(),
];

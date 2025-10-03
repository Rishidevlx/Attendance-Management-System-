const express = require('express');
const router = express.Router();
// Controller la irundhu functions-a import panrom
const { 
  registerUser, 
  loginUser,  // Correct name is loginUser
  googleLogin, 
  sendOtp, 
  resetPasswordWithOtp 
} = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// Auth Routes
router.post('/register', validateRegister, registerUser);
// --- TYPO FIX IN THIS LINE ---
// loginFUser-ku badhila ippo correct ah loginUser nu maathiyachu
router.post('/login', validateLogin, loginUser); 
router.post('/google-login', googleLogin);

// Password Reset Routes
router.post('/send-otp', sendOtp);
router.post('/reset-password-with-otp', resetPasswordWithOtp);

module.exports = router;


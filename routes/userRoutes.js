const express = require('express');
const router = express.Router();

// --- Correctly importing ALL necessary functions ---
const { 
  registerUser, 
  loginUser,
  googleLogin,
  updateSurvey,
  getAllStudents,
  getDashboardStats,
  addStudent,
  updateStudent,
  deleteStudent,
  sendOtp, 
  resetPasswordWithOtp 
} = require('../controllers/userController');

// --- FIX: Removed 'validatePhone' from the import as it doesn't exist ---
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

// --- Auth Routes ---
// --- FIX: Removed the non-existent 'validatePhone' middleware from the array ---
// The phone validation is already included inside 'validateRegister'
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser); 
router.post('/google-login', googleLogin);

// --- Password Reset Routes ---
router.post('/send-otp', sendOtp);
router.post('/reset-password-with-otp', resetPasswordWithOtp);

// --- Survey Route ---
router.put('/survey', protect, updateSurvey);

// --- Admin Student Management CRUD Routes ---
router.route('/students')
    .get(protect, getAllStudents) // Get all students
    .post(protect, addStudent);    // Add a new student

router.route('/students/:id')
    .put(protect, updateStudent)   // Update a student
    .delete(protect, deleteStudent); // Delete a student

// --- Admin Dashboard Stats Route ---
router.get('/stats', protect, getDashboardStats);


module.exports = router;

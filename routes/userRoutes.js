const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  updateSurvey,
  getAllStudents,
  // getDashboardStats, // Removed
  getAdminDashboardData,
  addStudent,
  updateStudent,
  deleteStudent,
  sendOtp,
  resetPasswordWithOtp,
  updateStudentStatus,
  updateAdminPassword,
  deleteBulkStudents,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getStudentInfoData,
  checkUserExistsByEmail // --- NEW: Import checkUserExistsByEmail ---
} = require('../controllers/userController');

const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Auth Routes ---
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/google-login', googleLogin);

// --- NEW: Check Email Route ---
router.get('/check-email/:email', checkUserExistsByEmail); // Public route

// --- User Profile Routes ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/change-password', protect, updateUserPassword);

// --- Student Info Page Route ---
router.get('/student-info', protect, getStudentInfoData);

// --- Password Reset Routes ---
router.post('/send-otp', sendOtp);
router.post('/reset-password-with-otp', resetPasswordWithOtp);

// --- Survey Route ---
router.put('/survey', protect, updateSurvey);

// --- Admin Student Management CRUD Routes ---
router.route('/students')
    .get(protect, admin, getAllStudents)
    .post(protect, admin, addStudent);

router.post('/students/bulk-delete', protect, admin, deleteBulkStudents);

router.route('/students/:id')
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

router.put('/students/:id/status', protect, admin, updateStudentStatus);

// @desc    Admin updates their own password
// @route   PUT /api/users/admin/change-password
// @access  Private (Admin)
router.put('/admin/change-password', protect, admin, updateAdminPassword);

// --- Admin Dashboard Stats Route ---
// router.get('/stats', protect, admin, getDashboardStats); // Removed route
router.get('/dashboard-data', protect, admin, getAdminDashboardData);


module.exports = router;

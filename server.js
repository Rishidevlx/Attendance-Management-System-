const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const informationRoutes = require('./routes/informationRoutes');
const verificationRoutes = require('./routes/verificationRoutes'); // --- NEW: Import verification routes ---
const cron = require('node-cron');
const { markAbsentStudents } = require('./controllers/attendanceController');
const { checkExpiredPins, deleteOldPosts } = require('./controllers/informationController');
const { deactivateExpiredTokens } = require('./controllers/verificationController'); // --- NEW: Import token cleanup function ---


dotenv.config();
connectDB();
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Basic route for testing server status
app.get('/', (req, res) => {
  res.json({ message: "API is running successfully..." });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/info', informationRoutes);
app.use('/api/verification', verificationRoutes); // --- NEW: Use verification routes ---

// --- Cron Jobs ---

// Cron job to mark absent students (runs every 15 mins)
cron.schedule('*/15 * * * *', () => {
  console.log('Running scheduled job to check for absent students...');
  markAbsentStudents();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Set your timezone
});

// Cron job to check for expired pins (runs every hour)
cron.schedule('0 * * * *', () => { // Runs at the start of every hour
    console.log('Running hourly job to check for expired pins...');
    checkExpiredPins();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// Cron job to delete posts older than 30 days (runs daily at midnight)
cron.schedule('0 0 * * *', () => { // Runs daily at 00:00
    console.log('Running daily job to delete old posts...');
    deleteOldPosts();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// --- NEW: Cron job to deactivate expired verification tokens (runs every hour) ---
cron.schedule('0 * * * *', () => { // Runs at the start of every hour
    console.log('Running hourly job to deactivate expired verification tokens...');
    deactivateExpiredTokens();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});

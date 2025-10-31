const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); // --- ADD THIS ---
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const informationRoutes = require('./routes/informationRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const cron = require('node-cron');
const { markAbsentStudents } = require('./controllers/attendanceController');
const { checkExpiredPins, deleteOldPosts } = require('./controllers/informationController');
const { deactivateExpiredTokens } = require('./controllers/verificationController');


dotenv.config();
connectDB();
const app = express();

// --- CORS CONFIGURATION START ---
// Indha list la irukuravangala mattum namma API ah use panna anumathikirom
const whitelist = [
  'http://localhost:5173', // Unga local frontend
  'https://app.yourdomain.com' // Unga future production frontend
];

// Neenga subdomain vanginathum, 'https://app.yourdomain.com' ah unga correct URL ku maathikonga

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      // !origin (like Postman) or whitelist la irundha allow pannu
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions)); // --- ADD THIS ---
// --- CORS CONFIGURATION END ---


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
app.use('/api/verification', verificationRoutes);

// --- Cron Jobs ---
// (No changes in cron jobs)
cron.schedule('*/15 * * * *', () => {
  console.log('Running scheduled job to check for absent students...');
  markAbsentStudents();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

cron.schedule('0 * * * *', () => {
    console.log('Running hourly job to check for expired pins...');
    checkExpiredPins();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

cron.schedule('0 0 * * *', () => {
    console.log('Running daily job to delete old posts...');
    deleteOldPosts();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

cron.schedule('0 * * * *', () => {
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

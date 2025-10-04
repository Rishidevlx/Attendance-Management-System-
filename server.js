const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
// --- NEW: Importing attendance routes ---
const attendanceRoutes = require('./routes/attendanceRoutes');

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "API is running successfully..." });
});

// API routes
app.use('/api/users', userRoutes);
// --- NEW: Using attendance routes ---
app.use('/api/attendance', attendanceRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

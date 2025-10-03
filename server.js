const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express app
const app = express();

// --- MIDDLEWARE ---
// This allows our app to accept JSON data in the body of requests
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
  res.json({ message: "API is running successfully..." });
});

// User routes
app.use('/api/users', userRoutes);

// --- SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
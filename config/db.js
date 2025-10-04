const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials .env file-la illa. Adhunaala admin create pannala.');
      return;
    }
    
    const adminExists = await User.findOne({ email: adminEmail });

    // --- FIX STARTS HERE ---
    
    // Case 1: Admin user illaama irundha, puthusa create panrom
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin', // Make sure role is set to 'admin'
      });
      console.log('Admin user successfully create aayiduchu!');
    } 
    // Case 2: Admin user irundhu, aana avaruku 'admin' role illana, role-ah update panrom
    else if (adminExists && adminExists.role !== 'admin') {
      await User.updateOne(
        { email: adminEmail },
        { $set: { role: 'admin' } }
      );
      console.log('Existing user-ku Admin role successfully update aayiduchu!');
    }
    // --- FIX ENDS HERE ---

  } catch (error) {
    console.error('Admin user create/update panrapo error:', error);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // DB connect aanadhum, admin create/update panra function-a call panrom
    await createAdmin();

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

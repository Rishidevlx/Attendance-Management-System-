const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Linking to the User model
    },
    studentName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // --- CHANGE: Added 'Approved' and 'Declined' for leave requests ---
    status: {
      type: String,
      required: true,
      enum: ['Present', 'Absent', 'Pending', 'Late', 'Approved', 'Declined'],
      default: 'Pending',
    },
    // --- CHANGE: Added 'Leave' as a possible type ---
    type: {
      type: String,
      enum: ['Check-in', 'Leave'],
      default: 'Check-in',
    },
    reason: {
      type: String,
      default: '-',
    },
    wasLate: {
      type: Boolean,
      default: false,
    },
    // --- NEW: Fields specifically for leave requests ---
    leaveEndDate: {
      type: Date,
    },
    leaveDuration: {
        type: Number, // In days
    }
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

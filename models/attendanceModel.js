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
    status: {
      type: String,
      required: true,
      enum: ['Present', 'Absent', 'Pending', 'Late'],
      default: 'Pending',
    },
    type: {
      type: String,
      default: 'Check-in',
    },
    reason: {
      type: String,
      default: '-',
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

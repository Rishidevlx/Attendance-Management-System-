const asyncHandler = require('express-async-handler');
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const Settings = require('../models/settingsModel');

// --- NEW: Importing email utilities ---
const sendEmail = require('../utils/sendEmail');
const { 
    getPresentEmailHTML, 
    getAbsentEmailHTML,
    getLeaveApprovedEmailHTML,
    getLeaveDeclinedEmailHTML
} = require('../utils/emailTemplates');


// @desc    Student creates a check-in request
// @route   POST /api/attendance/check-in
// @access  Private (Student)
const createCheckIn = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // --- LOGIC CORRECTION: Check for existing requests but IGNORE 'Declined' ones ---
    const existingRequest = await Attendance.findOne({
        studentId: req.user.id,
        date: { $gte: today, $lt: tomorrow },
        status: { $ne: 'Declined' } // 'Declined' status irundha, adha kanakula eduthukadhu
    });

    if (existingRequest) {
        res.status(400);
        throw new Error('You have already submitted a non-declined request for today.');
    }

    const settings = await Settings.findOne({ settingName: 'attendance' });
    const { startTime, endTime, lateTime } = settings.value;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    let newStatus = '';
    let reasonText = 'On-time check-in';
    let wasLateStatus = false;

    if (currentTime >= startTime && currentTime <= endTime) {
        newStatus = 'Pending';
    } else if (currentTime > endTime && currentTime <= lateTime) {
        newStatus = 'Late';
        reasonText = 'Late check-in';
        wasLateStatus = true;
    } else {
        res.status(400);
        throw new Error('The check-in window is currently closed.');
    }

    // --- LOGIC CORRECTION: If a declined record exists, update it instead of creating a new one ---
    const declinedRequest = await Attendance.findOne({
        studentId: req.user.id,
        date: { $gte: today, $lt: tomorrow },
        status: 'Declined'
    });

    if(declinedRequest){
        declinedRequest.status = newStatus;
        declinedRequest.reason = reasonText;
        declinedRequest.wasLate = wasLateStatus;
        declinedRequest.type = 'Check-in';
        declinedRequest.date = now;
        await declinedRequest.save();
        res.status(201).json(declinedRequest);

    } else {
         const attendance = new Attendance({
            studentId: req.user.id,
            studentName: req.user.name,
            date: now,
            type: 'Check-in',
            status: newStatus,
            reason: reasonText,
            wasLate: wasLateStatus
        });
        const createdAttendance = await attendance.save();
        res.status(201).json(createdAttendance);
    }
});

// @desc    Student creates a leave request
// @route   POST /api/attendance/leave-request
// @access  Private (Student)
const createLeaveRequest = asyncHandler(async (req, res) => {
    const { startDate, endDate, reason, duration } = req.body;

    if (!startDate || !reason || !duration) {
        res.status(400);
        throw new Error('Please provide start date, reason, and duration.');
    }

    const start = new Date(startDate);
    start.setHours(0,0,0,0);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    end.setHours(23,59,59,999);
    
    // --- FINAL LOGIC CORRECTION: Do NOT allow new leave if ANY record exists for that date ---
    // Inga namma `status: { $ne: 'Declined' }` line-ah remove pannitom. So, declined aanaalum puthu leave anupa mudiyadhu.
    const existingRecord = await Attendance.findOne({
        studentId: req.user.id,
        $or: [
            { date: { $gte: start, $lte: end } },
            { leaveEndDate: { $gte: start, $lte: end } }
        ]
    });

    if (existingRecord) {
        res.status(400);
        throw new Error(`You already have a request (of status '${existingRecord.status}') for these dates. You cannot submit another leave request.`);
    }

    const leaveRequest = await Attendance.create({
        studentId: req.user.id,
        studentName: req.user.name,
        date: start,
        leaveEndDate: end,
        leaveDuration: duration,
        type: 'Leave',
        status: 'Pending',
        reason: reason,
    });

    res.status(201).json(leaveRequest);
});

// @desc    Get student's own leave request history
// @route   GET /api/attendance/leave-history
// @access  Private (Student)
const getMyLeaveHistory = asyncHandler(async (req, res) => {
    const history = await Attendance.find({ studentId: req.user.id, type: 'Leave' }).sort({ date: -1 });
    res.json(history);
});


// @desc    Get student's own attendance history
// @route   GET /api/attendance/history
// @access  Private (Student)
const getMyAttendanceHistory = asyncHandler(async (req, res) => {
    const history = await Attendance.find({ studentId: req.user.id }).sort({ date: -1 });
    res.json(history);
});

// @desc    Get all PENDING attendance requests for admin
// @route   GET /api/attendance/requests
// @access  Private (Admin)
const getAttendanceRequests = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ status: 'Pending', type: 'Check-in' })
        .populate('studentId', 'name')
        .sort({ date: -1 });
    res.json(requests);
});

// @desc    Get all PENDING leave requests for admin
// @route   GET /api/attendance/leave-requests
// @access  Private (Admin)
const getLeaveRequestsAdmin = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ status: 'Pending', type: 'Leave' })
        .populate('studentId', 'name domain')
        .sort({ date: -1 });
    res.json(requests);
});

// @desc    Get all PROCESSED leave requests for admin history
// @route   GET /api/attendance/leave-requests-history
// @access  Private (Admin)
const getLeaveRequestsHistoryAdmin = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ 
        type: 'Leave',
        status: { $in: ['Approved', 'Declined'] },
    })
    .populate('studentId', 'name domain')
    .sort({ updatedAt: -1 }); 
    res.json(requests);
});


// @desc    Get today's processed attendance records
// @route   GET /api/attendance/today-history
// @access  Private (Admin)
const getTodaysHistory = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const requests = await Attendance.find({
        status: { $in: ['Present', 'Absent', 'Late'] },
        date: { $gte: today, $lt: tomorrow }
    }).populate('studentId', 'name').sort({ updatedAt: -1 });

    res.json(requests);
});


// @desc    Get all LATE attendance requests for admin
// @route   GET /api/attendance/late-requests
// @access  Private (Admin)
const getLateRequests = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ status: 'Late' })
        .populate('studentId', 'name').sort({ date: -1 });
    res.json(requests);
});

// @desc    Get today's LATE and PROCESSED attendance records
// @route   GET /api/attendance/today-late-history
// @access  Private (Admin)
const getTodaysLateHistory = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const requests = await Attendance.find({
        wasLate: true,
        status: { $in: ['Present', 'Absent'] },
        date: { $gte: today, $lt: tomorrow }
    }).populate('studentId', 'name').sort({ updatedAt: -1 });

    res.json(requests);
});


// @desc    Admin updates an attendance request status
// @route   PUT /api/attendance/requests/:id
// @access  Private (Admin)
const updateAttendanceStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (attendance) {
        attendance.status = status || attendance.status;
        if (reason !== undefined) {
            attendance.reason = reason;
        }
        const updatedAttendance = await attendance.save();
        
        const populatedRequest = await updatedAttendance.populate('studentId', 'name email');
        
        const student = populatedRequest.studentId;
        if(student && student.email) {
            const checkInTime = new Date(populatedRequest.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            if(status === 'Present') {
                const html = getPresentEmailHTML(student.name, populatedRequest.wasLate, checkInTime);
                sendEmail(student.email, 'Your Attendance has been Confirmed!', html);
            } else if (status === 'Absent') {
                const html = getAbsentEmailHTML(student.name, populatedRequest.reason, populatedRequest.wasLate);
                sendEmail(student.email, 'Your Attendance Status Update', html);
            }
        }

        res.json(populatedRequest);
    } else {
        res.status(404).json({ message: 'Attendance record not found.' });
    }
});


// @desc    Admin updates a leave request status
// @route   PUT /api/attendance/leave-requests/:id
// @access  Private (Admin)
const updateLeaveRequestStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // Approved or Declined
    const leaveRequest = await Attendance.findById(req.params.id).populate('studentId', 'name email');

    if (leaveRequest && leaveRequest.type === 'Leave') {
        leaveRequest.status = status;
        
        if (status === 'Approved') {
            const startDate = new Date(leaveRequest.date);
            const endDate = new Date(leaveRequest.leaveEndDate);

            let currentDate = new Date(startDate);
            while(currentDate <= endDate) {
                const startOfDay = new Date(currentDate).setHours(0, 0, 0, 0);
                const endOfDay = new Date(currentDate).setHours(23, 59, 59, 999);

                const existingRecord = await Attendance.findOne({
                    studentId: leaveRequest.studentId._id,
                    type: 'Check-in',
                    date: { $gte: startOfDay, $lt: endOfDay }
                });
                
                if (!existingRecord) {
                    await Attendance.create({
                        studentId: leaveRequest.studentId._id,
                        studentName: leaveRequest.studentName,
                        date: new Date(currentDate).setHours(0, 0, 0, 0),
                        status: 'Present',
                        reason: `Approved Leave: ${leaveRequest.reason}`,
                        type: 'Check-in',
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        const updatedRequest = await leaveRequest.save();

        const student = updatedRequest.studentId;
        if(student && student.email) {
            const startDateFormatted = new Date(updatedRequest.date).toLocaleDateString('en-GB');
            const endDateFormatted = new Date(updatedRequest.leaveEndDate).toLocaleDateString('en-GB');

            if (status === 'Approved') {
                const html = getLeaveApprovedEmailHTML(student.name, startDateFormatted, endDateFormatted);
                sendEmail(student.email, 'Your Leave Request has been Approved', html);
            } else if (status === 'Declined') {
                const html = getLeaveDeclinedEmailHTML(student.name, startDateFormatted, endDateFormatted);
                sendEmail(student.email, 'Your Leave Request Status Update', html);
            }
        }

        res.json(updatedRequest);

    } else {
        res.status(404).json({ message: 'Leave request not found.' });
    }
});


// @desc    Admin updates multiple attendance statuses at once
// @route   POST /api/attendance/requests/bulk-update
// @access  Private (Admin)
const bulkUpdateAttendanceStatus = asyncHandler(async (req, res) => {
    const { ids, status, reason } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('No record IDs provided.');
    }
    if (!status) {
        res.status(400);
        throw new Error('No status provided.');
    }
    
    const requestsToUpdate = await Attendance.find({ _id: { $in: ids } }).populate('studentId', 'name email');

    await Attendance.updateMany(
        { _id: { $in: ids } },
        { $set: { status: status, reason: reason || '-' } }
    );

    for (const request of requestsToUpdate) {
        const student = request.studentId;
        if(student && student.email) {
            const checkInTime = new Date(request.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            if(status === 'Present') {
                const html = getPresentEmailHTML(student.name, request.wasLate, checkInTime);
                sendEmail(student.email, 'Your Attendance has been Confirmed!', html);
            } else if (status === 'Absent') {
                const finalReason = reason || 'Bulk action by admin';
                const html = getAbsentEmailHTML(student.name, finalReason, request.wasLate);
                sendEmail(student.email, 'Your Attendance Status Update', html);
            }
        }
    }

    res.status(200).json({ message: `${ids.length} requests updated successfully.` });
});


// @desc    Get all attendance records for admin reports
// @route   GET /api/attendance/reports
// @access  Private (Admin)
const getAttendanceReports = asyncHandler(async (req, res) => {
    const reports = await Attendance.find({ status: { $ne: 'Pending' } })
        .populate('studentId', 'name domain').sort({ date: -1 });
    
    const formattedReports = reports
      .filter(report => report.studentId)
      .map(report => {
        if (report.type === 'Check-in') {
            return {
                _id: report._id,
                name: report.studentId.name,
                domain: report.studentId.domain || 'Not Assigned',
                date: report.date,
                leaveEndDate: null,
                status: report.status,
                reason: report.reason || '-',
                wasLate: report.wasLate,
                type: report.type 
            };
        }
        if (report.type === 'Leave') {
             return {
                _id: report._id,
                name: report.studentId.name,
                domain: report.studentId.domain || 'Not Assigned',
                date: report.date,
                leaveEndDate: report.leaveEndDate,
                status: report.status,
                reason: report.reason || '-',
                wasLate: false,
                type: report.type 
            };
        }
        return null;
    }).filter(Boolean);
    
    res.json(formattedReports);
});


// @desc    Get leave summary report for all students
// @route   GET /api/attendance/leave-summary
// @access  Private (Admin)
const getLeaveSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const matchStage = {
      status: { $in: ['Absent', 'Late'] }
    };

    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date = { $gte: start, $lte: end };
    }

    const leaveSummary = await Attendance.aggregate([
        { $match: matchStage },
        { $group: {
                _id: '$studentId',
                noOfDaysLeave: { $sum: 1 },
                leaveDetails: { $push: { _id: '$_id', date: '$date', reason: '$reason', status: '$status' } }
            }
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentDetails' } },
        { $unwind: '$studentDetails' },
        { $project: {
                _id: 0, 
                studentId: '$_id', 
                studentName: '$studentDetails.name',
                domain: '$studentDetails.domain', 
                noOfDaysLeave: '$noOfDaysLeave',
                leaveDetails: '$leaveDetails'
            }
        },
        { $sort: { noOfDaysLeave: -1 } }
    ]);
    res.json(leaveSummary);
});

// @desc    Admin deletes a single attendance record
// @route   DELETE /api/attendance/reports/:id
// @access  Private (Admin)
const deleteAttendanceRecord = asyncHandler(async (req, res) => {
    const attendanceRecord = await Attendance.findById(req.params.id);

    if (attendanceRecord) {
        await attendanceRecord.deleteOne();
        res.json({ message: 'Attendance record removed successfully' });
    } else {
        res.status(404);
        throw new Error('Attendance record not found');
    }
});

// @desc    Admin deletes multiple attendance records
// @route   POST /api/attendance/reports/bulk-delete
// @access  Private (Admin)
const deleteBulkAttendanceRecords = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('No record IDs provided.');
    }

    const result = await Attendance.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} records deleted successfully.` });
    } else {
        res.status(404);
        throw new Error('No matching records found to delete.');
    }
});


// @desc Cron job to mark absent students
const markAbsentStudents = asyncHandler(async () => {
    const settings = await Settings.findOne({ settingName: 'attendance' });
    if (!settings || !settings.value || !settings.value.lateTime) {
        console.log('Attendance settings or lateTime not found. Skipping absent marking.');
        return;
    }
    const { lateTime } = settings.value;

    const now = new Date();
    const [lateHour, lateMinute] = lateTime.split(':').map(Number);
    
    const lateCheckinTimeToday = new Date();
    lateCheckinTimeToday.setHours(lateHour, lateMinute, 0, 0);

    if (now < lateCheckinTimeToday) {
        console.log(`Current time is before late time (${lateTime}). No action needed.`);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const allStudents = await User.find({ role: 'student', isActive: true });

    for (const student of allStudents) {
        // --- LOGIC CORRECTION: Check for existing requests but IGNORE 'Declined' ones ---
        const attendanceRecord = await Attendance.findOne({
            studentId: student._id,
            date: { $gte: today, $lt: tomorrow },
            status: { $ne: 'Declined' } // 'Declined' status irundha, adha kanakula eduthukadhu
        });

        if (!attendanceRecord) {
            await Attendance.create({
                studentId: student._id,
                studentName: student.name,
                date: new Date(),
                status: 'Absent',
                reason: 'Auto-marked absent (No check-in)',
                type: 'Check-in'
            });
            console.log(`Marked ${student.name} as absent for today.`);
        }
    }
});


module.exports = {
    createCheckIn,
    getMyAttendanceHistory,
    getAttendanceRequests,
    getTodaysHistory,
    getLateRequests,
    getTodaysLateHistory,
    updateAttendanceStatus,
    bulkUpdateAttendanceStatus,
    getAttendanceReports,
    getLeaveSummary,
    deleteAttendanceRecord,
    deleteBulkAttendanceRecords,
    markAbsentStudents,
    createLeaveRequest,
    getMyLeaveHistory,
    getLeaveRequestsAdmin,
    updateLeaveRequestStatus,
    getLeaveRequestsHistoryAdmin,
};


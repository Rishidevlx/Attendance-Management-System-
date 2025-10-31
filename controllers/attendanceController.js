const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // Import mongoose
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const Settings = require('../models/settingsModel');
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
    if (!settings || !settings.value) {
        res.status(500);
        throw new Error('Attendance time settings are not configured.');
    }
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
        declinedRequest.date = now; // Update the date to the current check-in time
        await declinedRequest.save();
        res.status(201).json(declinedRequest);

    } else {
         const attendance = new Attendance({
            studentId: req.user.id,
            studentName: req.user.name, // Save student name during creation
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

    const existingRecord = await Attendance.findOne({
        studentId: req.user.id,
        $or: [
            { date: { $lte: end }, leaveEndDate: { $gte: start } }, // Existing range overlaps new range
            { date: { $gte: start, $lte: end }, type: 'Check-in' } // Existing single-day record within new range
        ],
        // status: { $ne: 'Declined' } // Keep commented if you want to block applying over declined records
    });

    if (existingRecord) {
        res.status(400);
        throw new Error(`You already have a request (status: '${existingRecord.status}') overlapping these dates.`);
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


// @desc    Get student's own attendance history (all types)
// @route   GET /api/attendance/history
// @access  Private (Student)
const getMyAttendanceHistory = asyncHandler(async (req, res) => {
    const history = await Attendance.find({ studentId: req.user.id }).sort({ date: -1 });
    res.json(history);
});

// @desc    Get student's own LATE attendance history
// @route   GET /api/attendance/late-history
// @access  Private (Student)
const getMyLateHistory = asyncHandler(async (req, res) => {
    const history = await Attendance.find({
        studentId: req.user.id,
        wasLate: true,
     }).sort({ date: -1 });
    res.json(history);
});

// @desc    Get all PENDING attendance requests for admin
// @route   GET /api/attendance/requests
// @access  Private (Admin)
const getAttendanceRequests = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ status: 'Pending', type: 'Check-in' })
        .populate('studentId', 'name domain')
        .sort({ date: -1 });
    const populatedRequests = requests.map(req => {
        if (req.studentId) {
            req = req.toObject();
            req.studentName = req.studentId.name;
        }
        return req;
    });
    res.json(populatedRequests);
});

// @desc    Get all PENDING leave requests for admin
// @route   GET /api/attendance/leave-requests
// @access  Private (Admin)
const getLeaveRequestsAdmin = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ status: 'Pending', type: 'Leave' })
        .populate('studentId', 'name domain')
        .sort({ date: -1 });
     const populatedRequests = requests.map(req => {
        if (req.studentId) {
            req = req.toObject();
            req.studentName = req.studentId.name;
        }
        return req;
    });
    res.json(populatedRequests);
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
    const populatedRequests = requests.map(req => {
        if (req.studentId) {
            req = req.toObject();
            req.studentName = req.studentId.name;
        }
        return req;
    });
    res.json(populatedRequests);
});


// @desc    Get today's processed attendance records (Present, Absent, Late Check-ins)
// @route   GET /api/attendance/today-history
// @access  Private (Admin)
const getTodaysHistory = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const requests = await Attendance.find({
        status: { $in: ['Present', 'Absent', 'Late'] },
        type: 'Check-in',
        date: { $gte: today, $lt: tomorrow }
    }).populate('studentId', 'name domain').sort({ updatedAt: -1 });
     const populatedRequests = requests.map(req => {
        if (req.studentId) {
            req = req.toObject();
            req.studentName = req.studentId.name;
        }
        return req;
    });
    res.json(populatedRequests);
});


// @desc    Get all LATE PENDING attendance requests for admin
// @route   GET /api/attendance/late-requests
// @access  Private (Admin)
const getLateRequests = asyncHandler(async (req, res) => {
    const requests = await Attendance.find({ status: 'Late', type: 'Check-in' })
        .populate('studentId', 'name domain').sort({ date: -1 });
    const populatedRequests = requests.map(req => {
        if (req.studentId) {
            req = req.toObject();
            req.studentName = req.studentId.name;
        }
        return req;
    });
    res.json(populatedRequests);
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
        type: 'Check-in',
        date: { $gte: today, $lt: tomorrow }
    }).populate('studentId', 'name domain').sort({ updatedAt: -1 });
     const populatedRequests = requests.map(req => {
        if (req.studentId) {
            req = req.toObject();
            req.studentName = req.studentId.name;
        }
        return req;
    });
    res.json(populatedRequests);
});


// @desc    Admin updates a check-in request status (Present/Absent)
// @route   PUT /api/attendance/requests/:id
// @access  Private (Admin)
const updateAttendanceStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (attendance && attendance.type === 'Check-in') {
        attendance.status = status || attendance.status;
        if (reason !== undefined) {
            attendance.reason = reason;
        }
        const updatedAttendance = await attendance.save();

        const populatedRequest = await Attendance.findById(updatedAttendance._id)
                                        .populate('studentId', 'name email domain');

        let finalRequest = populatedRequest.toObject();
        if(populatedRequest.studentId) {
            finalRequest.studentName = populatedRequest.studentId.name;
        }

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

        res.json(finalRequest);
    } else {
        res.status(404).json({ message: 'Check-in record not found.' });
    }
});


// @desc    Admin updates a leave request status (Approved/Declined)
// @route   PUT /api/attendance/leave-requests/:id
// @access  Private (Admin)
const updateLeaveRequestStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // Approved or Declined
    const leaveRequest = await Attendance.findById(req.params.id).populate('studentId', 'name email domain');

    if (!leaveRequest || leaveRequest.type !== 'Leave') {
         res.status(404).json({ message: 'Leave request not found.' });
         return; // Added return to stop execution
    }

    // Store the original status before changing it
    const originalStatus = leaveRequest.status;
    leaveRequest.status = status;

    // --- ⭐⭐ CORE FIX START ⭐⭐ ---
    const studentId = leaveRequest.studentId._id;
    const startDate = new Date(leaveRequest.date);
    const endDate = new Date(leaveRequest.leaveEndDate);

    if (status === 'Approved') {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const startOfDay = new Date(currentDate); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(currentDate); endOfDay.setHours(23, 59, 59, 999);

            // Try to find ANY non-leave record for this day for this student
            const existingCheckIn = await Attendance.findOne({
                studentId: studentId,
                type: 'Check-in', // Only look for check-ins
                date: { $gte: startOfDay, $lt: endOfDay }
            });

            if (existingCheckIn) {
                 // If a check-in exists, DELETE IT to avoid conflicts/errors
                 // This ensures the Approved Leave takes precedence and prevents DocumentNotFoundError later
                 console.log(`Deleting existing check-in record ID ${existingCheckIn._id} for ${startOfDay.toLocaleDateString()} due to approved leave.`);
                 await Attendance.deleteOne({ _id: existingCheckIn._id });
            }

            // Always create/upsert the 'Present' record for the approved leave day
            // Using findOneAndUpdate with upsert: true avoids potential race conditions and DocumentNotFoundError
            await Attendance.findOneAndUpdate(
                {
                    studentId: studentId,
                    type: 'Check-in',
                    reason: `Approved Leave: ${leaveRequest.reason}`, // Use a specific reason to identify these records
                    date: { $gte: startOfDay, $lt: endOfDay } // Find record within the day
                },
                {
                    $set: {
                        studentName: leaveRequest.studentName || leaveRequest.studentId.name,
                        status: 'Present',
                        wasLate: false,
                        date: startOfDay // Ensure date is set correctly for upsert
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found
            );


            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else if (status === 'Declined' && originalStatus === 'Approved') {
         // If declining a request that WAS previously approved, clean up the generated 'Present' records
         console.log(`Cleaning up 'Present' records for declined leave ID ${leaveRequest._id}`);
         const deleteResult = await Attendance.deleteMany({
             studentId: studentId,
             type: 'Check-in',
             status: 'Present', // Only delete the 'Present' records created by this leave
             reason: `Approved Leave: ${leaveRequest.reason}`, // Match the specific reason
             date: { $gte: startDate, $lte: endDate } // Match the date range
         });
         console.log(`Deleted ${deleteResult.deletedCount} 'Present' records associated with the declined leave.`);
    }
    // --- ⭐⭐ CORE FIX END ⭐⭐ ---

    const updatedRequest = await leaveRequest.save();

    // Add studentName directly for response
    let finalRequest = updatedRequest.toObject();
    if(updatedRequest.studentId) {
        finalRequest.studentName = updatedRequest.studentId.name;
    }

    // Send Email Notification
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

    res.json(finalRequest);

});


// @desc    Admin updates multiple attendance statuses at once (Present/Absent)
// @route   POST /api/attendance/requests/bulk-update
// @access  Private (Admin)
const bulkUpdateAttendanceStatus = asyncHandler(async (req, res) => {
    const { ids, status, reason } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('No record IDs provided.');
    }
    if (!['Present', 'Absent'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status provided.');
    }

    const requestsToUpdate = await Attendance.find({ _id: { $in: ids }, type: 'Check-in' }).populate('studentId', 'name email');

    if (requestsToUpdate.length !== ids.length) {
        console.warn("Some IDs provided for bulk update were not found or not check-in type.");
    }

    const foundIds = requestsToUpdate.map(req => req._id);

    await Attendance.updateMany(
        { _id: { $in: foundIds } },
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

    res.status(200).json({ message: `${foundIds.length} requests updated successfully.` });
});


// @desc    Get all attendance records (Check-in and Leave) for admin reports
// @route   GET /api/attendance/reports
// @access  Private (Admin)
const getAttendanceReports = asyncHandler(async (req, res) => {
    const reports = await Attendance.find({
        $or: [
            { type: 'Check-in', status: { $ne: 'Pending' } },
            { type: 'Leave' }
        ]
     })
    .populate('studentId', 'name domain').sort({ date: -1 });

    const formattedReports = reports
      .filter(report => report.studentId)
      .map(report => {
        return {
            _id: report._id,
            name: report.studentId.name,
            domain: report.studentId.domain || 'N/A',
            date: report.date,
            leaveEndDate: report.leaveEndDate || null,
            status: report.status,
            reason: report.reason || '-',
            wasLate: report.wasLate || false,
            type: report.type
        };
    });

    res.json(formattedReports);
});


// @desc    Get leave summary report (Absent/Late Check-ins only) for all students
// @route   GET /api/attendance/leave-summary
// @access  Private (Admin)
const getLeaveSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const matchStage = {
      type: 'Check-in',
      // Count based on wasLate or Absent status
      $or: [ { status: 'Absent' }, { wasLate: true } ]
    };

    if (startDate && endDate) {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        matchStage.date = { $gte: start, $lte: end };
    }

    const leaveSummary = await Attendance.aggregate([
        { $match: matchStage },
        { $group: {
                _id: '$studentId',
                noOfDaysLeave: { $sum: 1 },
                leaveDetails: { $push: { _id: '$_id', date: '$date', reason: '$reason', status: '$status', wasLate: '$wasLate' } }
            }
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'studentDetails' } },
        { $match: { studentDetails: { $ne: [] } } },
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
    // --- ⚠️ SAFETY CHECK: Ensure the ID is a valid ObjectId ---
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid record ID format.');
    }
    const attendanceRecord = await Attendance.findById(req.params.id);

    if (attendanceRecord) {
        // --- Added logic to cleanup related check-ins if deleting an Approved Leave ---
        if (attendanceRecord.type === 'Leave' && attendanceRecord.status === 'Approved') {
            console.log(`Cleaning up 'Present' records for deleted approved leave ID ${attendanceRecord._id}`);
            const deleteResult = await Attendance.deleteMany({
                studentId: attendanceRecord.studentId,
                type: 'Check-in',
                status: 'Present',
                reason: `Approved Leave: ${attendanceRecord.reason}`,
                date: { $gte: attendanceRecord.date, $lte: attendanceRecord.leaveEndDate }
            });
             console.log(`Deleted ${deleteResult.deletedCount} 'Present' records associated with the deleted leave.`);
        }
        await attendanceRecord.deleteOne();
        res.json({ message: 'Attendance record removed successfully' });
    } else {
        res.status(404);
        // Throwing the error will be handled by the error handling middleware
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

    // --- Validate all IDs ---
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if(validIds.length !== ids.length) {
         console.warn("Some invalid IDs were provided for bulk delete.");
         // Optionally, inform the user or just proceed with valid ones
         // res.status(400).json({ message: "Invalid record ID format found in selection." });
         // return;
    }
     if(validIds.length === 0) {
         res.status(400);
         throw new Error('No valid record IDs provided.');
     }

    // --- Added logic to cleanup related check-ins if deleting Approved Leaves ---
    const approvedLeavesToDelete = await Attendance.find({
        _id: { $in: validIds },
        type: 'Leave',
        status: 'Approved'
    });

    for(const leave of approvedLeavesToDelete) {
         console.log(`Cleaning up 'Present' records for bulk deleted approved leave ID ${leave._id}`);
         const deleteResult = await Attendance.deleteMany({
             studentId: leave.studentId,
             type: 'Check-in',
             status: 'Present',
             reason: `Approved Leave: ${leave.reason}`,
             date: { $gte: leave.date, $lte: leave.leaveEndDate }
         });
         console.log(`Deleted ${deleteResult.deletedCount} 'Present' records for leave ${leave._id}.`);
    }

    const result = await Attendance.deleteMany({ _id: { $in: validIds } });

    if (result.deletedCount > 0) {
        res.json({ message: `${result.deletedCount} records deleted successfully.` });
    } else {
        // Use 404 if no records matched the valid IDs
        res.status(404);
        throw new Error('No matching records found to delete.');
    }
});


// @desc Cron job to mark absent students
const markAbsentStudents = asyncHandler(async () => {
    console.log('Running markAbsentStudents job...');
    const settings = await Settings.findOne({ settingName: 'attendance' });
    if (!settings || !settings.value || !settings.value.lateTime) {
        console.log('Attendance settings or lateTime not found. Skipping absent marking.');
        return;
    }

    // --- UNCOMMENTED LOGIC ---
    // Logic to run only after lateTime
    const { lateTime } = settings.value;
    const now = new Date(); // Get current time WHEN THE JOB RUNS
    const [lateHour, lateMinute] = lateTime.split(':').map(Number);
    const lateCheckinTimeToday = new Date();
    lateCheckinTimeToday.setHours(lateHour, lateMinute, 0, 0); // Set time for today

    // Check if current time is BEFORE the lateTime cutoff for today
    if (now < lateCheckinTimeToday) {
        console.log(`Current time (${now.toLocaleTimeString()}) is before late time (${lateTime}). No action needed yet.`);
        return; // Exit the function, don't mark anyone absent yet
    }
    // --- END OF UNCOMMENTED LOGIC ---

    // If current time is AFTER lateTime, proceed to mark absent students

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeStudents = await User.find({ role: 'student', isActive: true }, '_id name');

    // Initial check: Find students who have submitted ANY non-declined request today
    const studentsWithRecordToday = await Attendance.distinct('studentId', {
        studentId: { $in: activeStudents.map(s => s._id) }, // Consider only active students
        date: { $gte: today, $lt: tomorrow },
        status: { $ne: 'Declined' } // Ignore declined requests
    });

    const studentIdsWithRecord = new Set(studentsWithRecordToday.map(id => id.toString()));

    let markedAbsentCount = 0;
    for (const student of activeStudents) {
        // Check if the student DOES NOT have any non-declined record today
        if (!studentIdsWithRecord.has(student._id.toString())) {

            // --- MODIFIED FINAL CHECK ---
            // Final check just before creating to handle potential race conditions
            // Check if ANY non-declined record exists for the student today NOW
            const existingNonDeclined = await Attendance.findOne({
                studentId: student._id,
                date: { $gte: today, $lt: tomorrow },
                status: { $ne: 'Declined' } // Does any non-declined record exist NOW?
            });

            // If no non-declined record exists *now*, it's safe to mark absent.
            // This covers both cases:
            // 1. Student had NO record at all.
            // 2. Student ONLY had a 'Declined' record (and still only has that or none).
            if (!existingNonDeclined) {
                await Attendance.create({
                    studentId: student._id,
                    studentName: student.name,
                    date: now, // Use current time when job runs AFTER lateTime
                    status: 'Absent',
                    reason: 'Auto-marked absent (No check-in/leave)',
                    type: 'Check-in',
                    wasLate: false // They didn't check-in at all
                });
                markedAbsentCount++;
                console.log(`Marked ${student.name} (${student._id}) as absent for ${today.toLocaleDateString()}.`);
            } else {
                 // This else means a non-declined record (Present/Pending/Late/Approved) was found
                 // either initially or created during the race condition window.
                 console.log(`Skipping ${student.name} (${student._id}), non-declined record found.`);
            }
            // --- END OF MODIFIED FINAL CHECK ---
        }
    }
    console.log(`Marked ${markedAbsentCount} students as absent.`);
});


module.exports = {
    createCheckIn,
    getMyAttendanceHistory,
    getMyLateHistory,
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


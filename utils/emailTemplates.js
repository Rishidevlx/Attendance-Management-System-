// This file contains HTML templates for different email notifications.

const getBaseEmailTemplate = (title, bodyContent, color) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background-color: ${color}; color: #ffffff; padding: 40px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; color: #333; line-height: 1.6; }
            .content p { margin: 0 0 15px; }
            .content ul { list-style-type: none; padding: 0; margin: 20px 0; }
            .content li { background-color: #f8f8f8; margin-bottom: 8px; padding: 12px; border-radius: 5px; }
            .content li strong { color: #555; }
            .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
            </div>
            <div class="content">
                ${bodyContent}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Skenetic Digital. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

exports.getPresentEmailHTML = (studentName, wasLate, checkInTime) => {
    const title = wasLate ? "Late Check-in Approved" : "Attendance Confirmed!";
    const color = wasLate ? '#FBBF24' : '#22C55E'; // Yellow for late, Green for present
    const bodyContent = `
        <p>Hello ${studentName},</p>
        ${wasLate 
            ? `<p>Your check-in for today at <strong>${checkInTime}</strong> has been marked as <strong>Present (Late)</strong>.</p>
               <p>While we appreciate you checking in, please try to be on time for future sessions. Punctuality is a key part of professional growth.</p>
               <p>Good luck with your tasks today!</p>`
            : `<p>This is to confirm that your attendance for today has been successfully marked as <strong>Present</strong>.</p>
               <p>Your check-in was recorded at <strong>${checkInTime}</strong>.</p>
               <p>Great job on being on time! Have a productive day.</p>`
        }
        <p>Best regards,<br>Skenetic Digital Team</p>
    `;
    return getBaseEmailTemplate(title, bodyContent, color);
};

exports.getAbsentEmailHTML = (studentName, reason, wasLate) => {
    const title = "Attendance Update: Absent";
    const color = '#EF4444'; // Red for absent
    const bodyContent = `
        <p>Hello ${studentName},</p>
        <p>We're writing to inform you that your attendance for today has been marked as <strong>Absent</strong>.</p>
        ${wasLate
            ? `<p>This action was taken because your late check-in request was declined.</p>`
            : `<p>This action was taken on your check-in request.</p>`
        }
        <p><strong>Reason provided by Admin:</strong> ${reason}</p>
        <p>If you believe this is a mistake, please contact your administrator immediately.</p>
        <p>Best regards,<br>Skenetic Digital Team</p>
    `;
    return getBaseEmailTemplate(title, bodyContent, color);
};

exports.getLeaveApprovedEmailHTML = (studentName, startDate, endDate) => {
    const title = "Leave Request Approved!";
    const color = '#22C55E'; // Green for approved
    const bodyContent = `
        <p>Hello ${studentName},</p>
        <p>We are pleased to inform you that your leave request has been <strong>Approved</strong>.</p>
        <p><strong>Leave Period:</strong> From ${startDate} to ${endDate}.</p>
        <p>Your attendance for these dates will be automatically marked as present. We hope you have a refreshing break!</p>
        <p>Best regards,<br>Skenetic Digital Team</p>
    `;
    return getBaseEmailTemplate(title, bodyContent, color);
};

exports.getLeaveDeclinedEmailHTML = (studentName, startDate, endDate) => {
    const title = "Leave Request Declined";
    const color = '#EF4444'; // Red for declined
    const bodyContent = `
        <p>Hello ${studentName},</p>
        <p>We regret to inform you that your leave request for the period from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <strong>Declined</strong>.</p>
        <p>Please connect with your administrator for further clarification if needed. You are expected to maintain your regular attendance.</p>
        <p>Best regards,<br>Skenetic Digital Team</p>
    `;
    return getBaseEmailTemplate(title, bodyContent, color);
};

// --- NEW FEATURE: Profile Update Email ---
// Admin student details ah maathuna, antha student ku indha email pogum
exports.getProfileUpdateEmailHTML = (studentName, updatedFields) => {
    const title = "Your Profile has been Updated!";
    const color = '#3B82F6'; // Blue for info
    
    // updatedFields object ah vechu, enna maathiruku nu oru list create panrom
    let fieldsList = '<ul>';
    for (const [key, value] of Object.entries(updatedFields)) {
        // "name" => "Name" nu maathurathuku
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
        fieldsList += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
    }
    fieldsList += '</ul>';

    const bodyContent = `
        <p>Hello ${studentName},</p>
        <p>This is a notification to inform you that an administrator has updated your profile details. The following information was changed:</p>
        ${fieldsList}
        <p>Please review these changes. If you believe this was a mistake, please contact your administrator immediately.</p>
        <p>Best regards,<br>Skenetic Digital Team</p>
    `;

    return getBaseEmailTemplate(title, bodyContent, color);
};


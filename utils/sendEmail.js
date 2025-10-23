const nodemailer = require('nodemailer');

/**
 * Sends an email using nodemailer.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML body of the email.
 */
const sendEmail = async (to, subject, html) => {
    try {
        // Create a transporter using your email service provider's details from .env
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // Your email address from .env
                pass: process.env.EMAIL_PASS, // Your email password or app password from .env
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Skenetic Digital" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);

    } catch (error) {
        // We log the error but don't throw it.
        // The main operation (like updating attendance) should not fail just because the email failed to send.
        console.error(`Error sending email to ${to}:`, error);
    }
};

module.exports = sendEmail;

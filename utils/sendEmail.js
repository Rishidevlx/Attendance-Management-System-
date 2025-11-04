const nodemailer = require('nodemailer');

/**
 * Sends an email using Brevo (Sendinblue) SMTP.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML body of the email.
 */
const sendEmail = async (to, subject, html) => {
    try {
        // --- CHANGE: Using Brevo SMTP credentials from .env ---
        const transporter = nodemailer.createTransport({
            host: process.env.BREVO_HOST,     // e.g., 'smtp-relay.brevo.com'
            port: process.env.BREVO_PORT,     // e.g., 587
            secure: false, // Brevo uses STARTTLS on port 587
            auth: {
                user: process.env.BREVO_USER, // Unga Brevo login email
                pass: process.env.BREVO_KEY,  // Unga Brevo SMTP Key
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // --- CHANGE: 'from' address MUST be your Brevo account email ---
        // Unga personal mail la irundhu mail pora madhiri kaatradhuku,
        // neenga Brevo la 'sender' ah verify pannanum.
        // Ippothaiku, Brevo account email ah ve use pannikonga.
        const mailOptions = {
            from: `"Skenetic Digital" <${process.env.BREVO_USER}>`,
            to: to,
            subject: subject,
            html: html,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to} via Brevo`);

    } catch (error) {
        // We log the error but don't throw it.
        console.error(`Error sending email via Brevo to ${to}:`, error);
    }
};

module.exports = sendEmail;

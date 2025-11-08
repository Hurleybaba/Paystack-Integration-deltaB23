// export const sendEmail = async (to, subject, message) => {
//   try {
//     console.log("--------------------------------------------------");
//     console.log("📨 Sending Email...");
//     console.log(`📤 To: ${to}`);
//     console.log(`📝 Subject: ${subject}`);
//     console.log(`💬 Message: ${message}`);
//     console.log("--------------------------------------------------");

//     // Simulate email sending delay
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     console.log(`✅ Email successfully 'sent' to ${to}\n`);
//   } catch (error) {
//     console.error(`❌ Failed to send email to ${to}:`, error.message);
//   }
// };

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'SendGrid', 'Mailgun', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any other email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Delta's App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};











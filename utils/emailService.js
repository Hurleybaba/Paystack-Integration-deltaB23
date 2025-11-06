export const sendEmail = async (to, subject, message) => {
  console.log(`📩 Sending email to ${to}: ${subject} - ${message}`);
  // Integrate real email service like SendGrid, Nodemailer, etc.
};

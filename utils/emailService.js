export const sendEmail = async (to, subject, message) => {
  try {
    console.log("--------------------------------------------------");
    console.log("📨 Sending Email...");
    console.log(`📤 To: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`💬 Message: ${message}`);
    console.log("--------------------------------------------------");

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`✅ Email successfully 'sent' to ${to}\n`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
};



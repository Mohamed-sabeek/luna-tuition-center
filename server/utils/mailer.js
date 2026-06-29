import nodemailer from 'nodemailer';

export const sendParentWelcomeEmail = async (parentEmail, parentName, password) => {
  try {
    // Generate test SMTP service account from ethereal.email if needed
    // In production, real SMTP credentials from env (e.g. GMAIL_USER, GMAIL_PASS) would be used
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'mock.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'mockpassword',
      },
    });

    const mailOptions = {
      from: `"Luna Tuition Center" <${process.env.SMTP_FROM || 'welcome@lunatuition.com'}>`,
      to: parentEmail,
      subject: 'Welcome to Luna Tuition Center - Parent Portal Access',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Luna Tuition Center</h2>
          <p>Dear <strong>${parentName}</strong>,</p>
          <p>Welcome! Your child has been enrolled at Luna Tuition Center.</p>
          <p>A Parent Account has been automatically created for you. You can use it to track your child's attendance, weekly test results, Luna rewards, study materials, and monthly fees.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px dashed #cbd5e1;">
            <h3 style="margin-top: 0; color: #1e3a8a;">Your Login Credentials</h3>
            <p style="margin: 5px 0;"><strong>Parent Email:</strong> ${parentEmail}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          
          <p>We advise you to log in to the portal, change your password for security, and view your child's profile page.</p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Best regards,<br/>
            <strong>Luna Tuition Center</strong><br/>
            Learn • Practice • Earn Lunas • Shine Bright
          </p>
        </div>
      `,
    };

    console.log(`[EMAIL SENDING] Parent: ${parentEmail} | Pass: ${password}`);
    // Attempt sending, catch any failure gracefully
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Welcome email successfully sent to ${parentEmail}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send welcome email to ${parentEmail}:`, error.message);
  }
};

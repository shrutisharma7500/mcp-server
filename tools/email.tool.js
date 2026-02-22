import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, body }, userConfig = {}) {
  const smtpUser = userConfig.smtpUser || process.env.SMTP_USER;
  const smtpPass = userConfig.smtpPass || process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error("❌ SMTP credentials missing");
    return { status: "error", message: "Email not configured. Please add SMTP settings." };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"AI Planner" <${smtpUser}>`,
      to: to || userConfig.email,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #4A90E2;">${subject}</h2>
              <p>${body.replace(/\n/g, "<br>")}</p>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #777;">Sent via IntelliSchedule AI</p>
            </div>`,
    });

    console.log("📧 Email sent: %s", info.messageId);
    return { status: "success", message: "Confirmation email sent" };
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    return { status: "error", message: "Failed to send email. Check SMTP settings." };
  }
}

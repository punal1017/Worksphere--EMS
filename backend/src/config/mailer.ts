import "dotenv/config";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST?.trim();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;
const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter =
  smtpHost && smtpUser && smtpPassword && Number.isInteger(smtpPort)
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })
    : null;

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  if (!transporter || !smtpFrom) {
    throw new Error(
      "SMTP configuration is missing. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in backend/.env.",
    );
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Reset your WorkSphere password",
    text: [
      "We received a request to reset your WorkSphere password.",
      "",
      `Open this link to choose a new password: ${resetLink}`,
      "",
      "This link expires in 15 minutes and can only be used once.",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <p>We received a request to reset your WorkSphere password.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 15 minutes and can only be used once.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
  replyTo,
}: {
  replyTo?: string;
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    return await resend.emails.send({
      from: process.env.ADMIN_EMAIL || "support@trusxchange.com",
      to,
      subject,
      html,
      replyTo, // ✅ correct for TypeScript + Resend SDK
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
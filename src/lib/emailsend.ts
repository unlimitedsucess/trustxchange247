import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  html,
  replyTo,
  text,
}: {
  replyTo?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    return await resend.emails.send({
      from: process.env.ADMIN_EMAIL || "support@trusxchange.com",
      to,
      subject,
      html,
      text,
      replyTo, // ✅ correct for TypeScript + Resend SDK
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to?: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  from,
  replyTo,
  text,
}: SendEmailParams) => {
  return await resend.emails.send({
    from: from || process.env.ADMIN_EMAIL || "support@trusxchange.com",
    to: to || process.env.ADMIN_EMAIL || "support@trusxchange.com",
    subject,
    html,
    text,
    reply_to: replyTo,
  });
};




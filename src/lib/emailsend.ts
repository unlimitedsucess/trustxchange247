
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);


export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  return await resend.emails.send({
    from:
      process.env.ADMIN_EMAIL ||
      "support@trusxchange.com",
    to,
    subject,
    html,
  });
};



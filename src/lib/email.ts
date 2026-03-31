import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.ZEPTOMAIL_USER || "email", // Use "email", "emailapikey" or your specific Zeptomail username
    pass: process.env.ZEPTOMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: `"Trust Xchange" <support@trustxchange247.com>`,
    to: email,
    subject: "Your Verification Code - TrustXchange247",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 40px 0; background-color: #f1f5f9; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          
          <!-- Hero Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 50px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
              Trust<span style="color: #818cf8;">X</span>change247
            </h1>
            <p style="color: #94a3b8; font-size: 16px; margin-top: 10px; margin-bottom: 0;">Premium Digital Asset Management</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px 30px 40px;">
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 15px;">Verify Your Identity</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0;">
              Welcome back! To ensure the highest level of security for your investment portfolio, please enter the strict authorization code below to verify your email.
            </p>

            <!-- The Code Block -->
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 35px; text-align: center; margin: 35px 0;">
              <span style="font-family: 'Courier New', monospace; font-size: 48px; font-weight: 800; color: #4f46e5; letter-spacing: 12px; display: block;">${code}</span>
            </div>

            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 10px;">
              <p style="color: #b45309; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>Security Notice:</strong> This code expires in exactly 15 minutes. Never share this code with anyone.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
              Need assistance? We're available 24/7 at <a href="mailto:support@trustxchange247.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">support@trustxchange247.com</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} TrustXchange247 Global. All rights reserved.<br/>
              Secure protocols automatically applied to this transmission.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendDepositApprovalEmail = async (email: string, amount: number, planName: string) => {
  await transporter.sendMail({
    from: `"Trust Xchange" <support@trustxchange247.com>`,
    to: email,
    subject: "Deposit Approved - TrustXchange247",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 40px 0; background-color: #f1f5f9; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          
          <!-- Hero Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #064e3b 100%); padding: 50px 20px; text-align: center;">
            <p style="color: #a7f3d0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;">TrustXchange247</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
              Deposit Approved
            </h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px 30px 40px;">
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 15px;">Great news! 🎉</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Your deposit has been successfully verified by our nodes and the funds have been credited to your active investment portfolio.
            </p>

            <!-- Success Block -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Amount Credited</span><br/>
                    <strong style="color: #0f172a; font-size: 24px;">$${amount}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <span style="color: #64748b; font-size: 14px;">Investment Plan</span><br/>
                    <strong style="color: #059669; font-size: 18px;">${planName}</strong>
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0; text-align: center;">
              You can now view your active investments and daily compound ROI directly on your dashboard.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
              Need assistance? We're available 24/7 at <a href="mailto:support@trustxchange247.com" style="color: #059669; text-decoration: none; font-weight: 600;">support@trustxchange247.com</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} TrustXchange247 Global. All rights reserved.<br/>
              Secure protocols automatically applied to this transmission.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendWithdrawalApprovalEmail = async (email: string, amount: number, wallet: string) => {
  await transporter.sendMail({
    from: `"Trust Xchange" <support@trustxchange247.com>`,
    to: email,
    subject: "Withdrawal Approved & Sent - TrustXchange247",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 40px 0; background-color: #f1f5f9; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          
          <!-- Hero Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%); padding: 50px 20px; text-align: center;">
            <p style="color: #d8b4fe; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;">TrustXchange247</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
              Withdrawal Sent
            </h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px 30px 40px;">
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 15px;">Transaction Complete 💸</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Your requested funds have been successfully verified and dispatched to your external wallet via the blockchain.
            </p>

            <!-- Success Block -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">Amount Dispatched</span><br/>
                    <strong style="color: #0f172a; font-size: 24px;">$${amount}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <span style="color: #64748b; font-size: 14px;">Destination Wallet</span><br/>
                    <span style="color: #7c3aed; font-size: 14px; font-family: 'Courier New', monospace; word-break: break-all;">${wallet}</span>
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0; text-align: center; background: #fffbeb; padding: 15px; border-radius: 8px; color: #b45309;">
              <strong>Note:</strong> Network confirmations on the blockchain typically take 5-15 minutes before reflecting in your receiving wallet.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
              Need assistance? We're available 24/7 at <a href="mailto:support@trustxchange247.com" style="color: #7c3aed; text-decoration: none; font-weight: 600;">support@trustxchange247.com</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} TrustXchange247 Global. All rights reserved.<br/>
              Secure protocols automatically applied to this transmission.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
export const sendBonusEmail = async (email: string, amount: number) => {
  await transporter.sendMail({
    from: `"Trust Xchange" <support@trustxchange247.com>`,
    to: email,
    subject: "Bonus Credited - TrustXchange247",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 40px 0; background-color: #f1f5f9; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          
          <!-- Hero Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); padding: 50px 20px; text-align: center;">
            <p style="color: #fef3c7; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;">TrustXchange247 REWARDS</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
              You've Received a Bonus!
            </h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px 30px 40px;">
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 15px;">Congratulations! 🎊</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Our administration has credited a special bonus to your account as a token of appreciation for your continued trust in our platform.
            </p>

            <!-- Success Block -->
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 25px; text-align: center; margin: 0 0 30px 0;">
              <span style="color: #92400e; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Bonus Amount</span><br/>
              <strong style="color: #b45309; font-size: 42px;">$${amount}</strong>
            </div>

            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0; text-align: center;">
              This amount has been added to your withdrawable balance. You can check your updated stats on your dashboard.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
              Need assistance? We're available 24/7 at <a href="mailto:support@trustxchange247.com" style="color: #b45309; text-decoration: none; font-weight: 600;">support@trustxchange247.com</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} TrustXchange247 Global. All rights reserved.<br/>
              Secure protocols automatically applied to this transmission.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
export const sendDailyReturnEmail = async (email: string, amount: number, day: string) => {
  await transporter.sendMail({
    from: `"Trust Xchange" <support@trustxchange247.com>`,
    to: email,
    subject: `Daily Return Processed - ${day} - TrustXchange247`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 40px 0; background-color: #f1f5f9; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          
          <!-- Hero Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 50px 20px; text-align: center;">
            <p style="color: #dbeafe; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0; font-weight: 600;">TrustXchange247 PERFORMANCE</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
              Investment Return Credited
            </h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px 30px 40px;">
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 15px;">Profit Distribution</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Your account has been credited with a daily return of <strong>$${amount}</strong> for <strong>${day}</strong> from your active investment pool.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 5px;">
                    <span style="color: #64748b; font-size: 14px;">Return Period</span><br/>
                    <strong style="color: #0f172a; font-size: 16px;">${day}</strong>
                  </td>
                  <td style="text-align: right; border-bottom: none;">
                    <span style="color: #64748b; font-size: 14px;">Credit Amount</span><br/>
                    <strong style="color: #3b82f6; font-size: 16px;">+$${amount}</strong>
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0; text-align: center;">
              This amount is now reflected in your total profit and available for growth or withdrawal.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
              Need assistance? We're available 24/7 at <a href="mailto:support@trustxchange247.com" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@trustxchange247.com</a>
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} TrustXchange247 Global. All rights reserved.<br/>
              Secure protocols automatically applied to this transmission.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

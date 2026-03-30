import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

/* ============================
   CORS CONFIG
============================ */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://trustxchange247.com",
  "https://www.trustxchange247.com",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }

  // ✅ MUST return an empty object with no undefined values
  return {};
}


/* ============================
   PRE-FLIGHT
============================ */
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

/* ============================
   REGISTER (POST)
============================ */
export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");

    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ message: "Not allowed by CORS policy" }, { status: 403 });
    }

    await connectDB();
    const { email, idDocument } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400, headers: getCorsHeaders(origin) });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    // Generate 6-digit code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (user) {
      if (user.isEmailVerified) {
        return NextResponse.json({ message: "Email is already registered and verified" }, { status: 400, headers: getCorsHeaders(origin) });
      } else {
        // Update unverified user with new code
        user.verificationToken = verificationToken;
        user.verificationExpires = verificationExpires;
        if (idDocument) user.idDocument = idDocument;
        await user.save();
      }
    } else {
      user = await User.create({
        email: email.toLowerCase().trim(),
        idDocument,
        isEmailVerified: false,
        verificationToken,
        verificationExpires,
      });
    }

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TrustXchange247" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Security Alert: Your Verification Code",
      text: `Your TrustXchange247 verification code is: ${verificationToken}`,
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
                Welcome aboard! To ensure the highest level of security for your investment portfolio, please enter the strict authorization code below to verify your email.
              </p>

              <!-- The Code Block -->
              <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 35px; text-align: center; margin: 35px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 48px; font-weight: 800; color: #4f46e5; letter-spacing: 12px; display: block;">${verificationToken}</span>
              </div>

              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 10px;">
                <p style="color: #b45309; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>Security Notice:</strong> This code expires in exactly 15 minutes. Never share this code with anyone, including our support staff.
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

    return NextResponse.json(
      { message: "Verification code sent to email", userId: user._id },
      { status: 201, headers: getCorsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

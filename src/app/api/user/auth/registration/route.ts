import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

/* ============================
   CORS CONFIG
============================ */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://trusxchange.com",
  "https://www.trusxchange.com",
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

    // Send verification email via Unified SMTP Router
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "Verification code sent to email", userId: user._id },
      { status: 201, headers: getCorsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

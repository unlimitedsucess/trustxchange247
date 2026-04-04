import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://trusxchange.com",
  "https://www.trusxchange.com"
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  return {};
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ message: "Not allowed by CORS policy" }, { status: 403 });
    }

    await connectDB();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400, headers: getCorsHeaders(origin) });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404, headers: getCorsHeaders(origin) });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: "Email is already verified", userId: user._id }, { status: 200, headers: getCorsHeaders(origin) });
    }

    if (user.verificationToken !== code) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400, headers: getCorsHeaders(origin) });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json({ message: "Verification code expired" }, { status: 400, headers: getCorsHeaders(origin) });
    }

    // Success!
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully", userId: user._id },
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("Verify API error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

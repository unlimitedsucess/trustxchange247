import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://yourdomain.com",
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
    const { email, fullName, password, country } = await req.json();

    if (!email || !fullName || !password || !country) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400, headers: getCorsHeaders(origin) });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404, headers: getCorsHeaders(origin) });
    }

    if (!user.isEmailVerified) {
      return NextResponse.json({ message: "Email is not verified yet" }, { status: 400, headers: getCorsHeaders(origin) });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.fullName = fullName.trim();
    user.password = hashedPassword;
    user.country = country;
    await user.save();

    return NextResponse.json(
      { message: "Registration completed successfully", userId: user._id },
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("Complete Profile API error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

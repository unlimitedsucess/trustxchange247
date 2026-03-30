import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://trustxchange247.vercel.app",
  "https://www.yourdomain.com",
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

  // ✅ must be an empty object, not undefined values
  return {};
}

/* ============================
   PREFLIGHT
============================ */
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/* ============================
   LOGIN
============================ */
export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");

    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { message: "Not allowed by CORS policy" },
        { status: 403 }
      );
    }

    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401, headers: getCorsHeaders(origin) }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        userId: user._id,
        fullName: user.fullName,
      },
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

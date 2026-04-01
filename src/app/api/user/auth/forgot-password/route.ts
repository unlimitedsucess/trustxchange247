import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, don't reveal if user exists. Just say "If account exists, email sent"
      return NextResponse.json({ message: "If an account exists with this email, a reset link has been sent." }, { status: 200 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://trustxchange247.com"}/reset-password?token=${token}&email=${user.email}`;

    await sendPasswordResetEmail(user.email, resetLink);

    return NextResponse.json({ message: "If an account exists with this email, a reset link has been sent." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

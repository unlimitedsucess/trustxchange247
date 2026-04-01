import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.userId || decoded.id;

    await connectDB();
    const { type, currentPassword, newPassword, newPin } = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (type === "password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: "Old and new password required" }, { status: 400 });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return NextResponse.json({ message: "Current password incorrect" }, { status: 400 });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    if (type === "pin") {
      if (!newPin || newPin.length < 4) {
        return NextResponse.json({ message: "Valid 4-6 digit PIN required" }, { status: 400 });
      }
      
      user.transactionPin = newPin;
      await user.save();
      return NextResponse.json({ success: true, message: "Transaction PIN updated successfully" });
    }

    return NextResponse.json({ message: "Invalid update type" }, { status: 400 });
  } catch (error: any) {
    console.error("Security update error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

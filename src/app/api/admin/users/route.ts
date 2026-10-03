import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import BonusWalletTransaction from "@/models/bonusWalletTransaction";
import { sendBonusWalletEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { fullName, email, password, country, createdAt, bonusBalance = 0 } = await req.json();
    const initialBonus = Number(bonusBalance);

    if (!email || !password || !fullName || !country || !Number.isFinite(initialBonus) || initialBonus < 0) {
      return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const session = await mongoose.startSession();
    let newUser;
    try {
      newUser = await session.withTransaction(async () => {
        const [createdUser] = await User.create([{
          fullName,
          email: email.toLowerCase(),
          password: hashedPassword,
          country,
          bonusBalance: initialBonus,
          isEmailVerified: true,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          status: "active"
        }], { session });

        if (initialBonus > 0) {
          await BonusWalletTransaction.create([{
            user: createdUser._id,
            type: "credit",
            amount: initialBonus,
            balanceAfter: initialBonus,
            reason: "Initial bonus wallet funding",
          }], { session });
        }
        return createdUser;
      });
    } finally {
      await session.endSession();
    }

    if (!newUser) {
      return NextResponse.json({ success: false, message: "User creation failed" }, { status: 500 });
    }

    let bonusEmailSent = true;
    if (initialBonus > 0) {
      try {
        await sendBonusWalletEmail(newUser.email, initialBonus, initialBonus, "credit", "Initial bonus wallet funding");
      } catch (emailError) {
        bonusEmailSent = false;
        console.error("Failed to send initial bonus wallet email:", emailError);
      }
    }

    const userToReturn = newUser.toObject();
    delete userToReturn.password;
    return NextResponse.json({ success: true, data: userToReturn, bonusEmailSent }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

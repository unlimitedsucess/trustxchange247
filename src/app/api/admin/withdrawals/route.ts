import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Withdrawal from "@/models/withdrawal";
import User from "@/models/user";

export async function GET(req: Request) {
  try {
    await connectDB();
    const withdrawals = await Withdrawal.find().populate("user", "fullName email country").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: withdrawals }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, amount, walletAddress, status, createdAt } = body;
    
    const customDate = createdAt ? new Date(createdAt) : new Date();

    const newWithdrawal = await Withdrawal.create({
      user: userId,
      amount,
      walletAddress: walletAddress || "Admin Initiated",
      status: status || "approved",
      createdAt: customDate
    });
    
    return NextResponse.json({ success: true, data: newWithdrawal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

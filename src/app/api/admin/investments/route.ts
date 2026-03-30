import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";

export async function GET(req: Request) {
  try {
    await connectDB();
    // In this system, an "Investment" is a Deposit that is out of the "pending" state.
    // It is either "active" or "completed".
    const investments = await Deposit.find({ status: { $in: ["active", "completed"] } })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: investments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

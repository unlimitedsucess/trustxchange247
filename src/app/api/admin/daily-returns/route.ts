import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DailyReturn from "@/models/dailyReturn";
import User from "@/models/user";
import { sendDailyReturnEmail } from "@/lib/email";

export async function GET() {
  try {
    await connectDB();
    const dailyReturns = await DailyReturn.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: dailyReturns }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, amount, day } = body;
    if (!userId || !amount || !day) {
        return NextResponse.json({ success: false, message: "UserId, amount and day are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const newDailyReturn = await DailyReturn.create({ user: userId, amount, day });

    // Send notification email
    try {
        await sendDailyReturnEmail(user.email, amount, day);
    } catch (emailErr) {
        console.error("Daily return email failed:", emailErr);
    }

    return NextResponse.json({ success: true, data: newDailyReturn }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

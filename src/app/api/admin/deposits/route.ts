import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import InvestmentPlan from "@/models/investmentPlan";

export async function GET(req: Request) {
  try {
    await connectDB();
    const deposits = await Deposit.find().populate("user", "fullName email country").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: deposits }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, amount, plan, createdAt, status, wallet } = body;
    
    const customDate = createdAt ? new Date(createdAt) : new Date();
    
    let endDate;
    if (status === "active") {
      const planObj = await InvestmentPlan.findOne({ name: plan });
      if (planObj && planObj.durationDays) {
        endDate = new Date(customDate);
        endDate.setDate(endDate.getDate() + planObj.durationDays);
      }
    }

    const newDeposit = await Deposit.create({
      user: userId,
      amount,
      plan: plan || "Admin Plan",
      wallet: wallet || "Admin Vault",
      status: status || "active",
      startDate: status === "active" ? customDate : undefined,
      endDate: endDate,
      createdAt: customDate
    });

    return NextResponse.json({ success: true, data: newDeposit }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

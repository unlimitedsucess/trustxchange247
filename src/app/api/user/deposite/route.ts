import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

import InvestmentPlan from "@/models/investmentPlan";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);

    const { plan, wallet, amount } = await req.json();
    const numericAmount = Number(amount);

    // Validate inputs
    if (!plan) return NextResponse.json({ message: "Plan is required." }, { status: 400 });
    if (!wallet) return NextResponse.json({ message: "Wallet is required." }, { status: 400 });
    if (!amount || numericAmount <= 0) return NextResponse.json({ message: "Amount must be greater than 0." }, { status: 400 });

    const planDetails = await InvestmentPlan.findOne({ name: plan, isActive: true });
    if (!planDetails) {
      return NextResponse.json({ message: "Invalid or inactive plan selected." }, { status: 400 });
    }

    // Check minAmount dynamically from database
    if (numericAmount < planDetails.minInvestment) {
      return NextResponse.json(
        { message: `Amount is below the minimum for ${plan}: $${planDetails.minInvestment}` },
        { status: 400 }
      );
    }

    // Check maxAmount dynamically from database
    if (planDetails.maxInvestment && numericAmount > planDetails.maxInvestment) {
      return NextResponse.json(
        { message: `Amount exceeds the limit for ${plan}. Maximum allowed: $${planDetails.maxInvestment}` },
        { status: 400 }
      );
    }

    // Create deposit
    const deposit = await Deposit.create({
      user: new mongoose.Types.ObjectId(user.userId),
      plan,
      wallet,
      amount: numericAmount,
      roi: planDetails.dailyRoi || planDetails.monthlyRoi,
      currentBalance: numericAmount,
      status: "pending",
      startDate: null,
      endDate: null,
    });

    return NextResponse.json(
      { message: "Deposit request created", deposit },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Deposit API error:", err.message);

    if (err.message === "No token provided" || err.message === "Invalid token") {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Internal server error", errors: [err.message] },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);

    const deposits = await Deposit.find({ user: user.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ deposits }, { status: 200 });
  } catch (err: any) {
    console.error("Fetch Deposits API error:", err.message);

    if (err.message === "No token provided" || err.message === "Invalid token") {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import DailyReturn from "@/models/dailyReturn";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";
import InvestmentPlan from "@/models/investmentPlan";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);

    // Suspension Check
    const userDoc = await User.findById(user.userId).select("status");
    if (userDoc?.status === "suspended") {
      return NextResponse.json({ message: "Your account has been suspended for violation of platform terms. Deposits are restricted." }, { status: 403 });
    }

    const { plan, wallet, amount } = await req.json();
    const numericAmount = Number(amount);

    if (!plan) return NextResponse.json({ message: "Plan is required." }, { status: 400 });
    if (!wallet) return NextResponse.json({ message: "Wallet is required." }, { status: 400 });
    if (!amount || numericAmount <= 0) return NextResponse.json({ message: "Amount must be greater than 0." }, { status: 400 });

    const planDetails = await InvestmentPlan.findOne({ name: plan, isActive: true });
    if (!planDetails) {
      return NextResponse.json({ message: "Invalid or inactive plan selected." }, { status: 400 });
    }

    if (numericAmount < planDetails.minInvestment) {
      return NextResponse.json(
        { message: `Amount is below the minimum for ${plan}: $${planDetails.minInvestment}` },
        { status: 400 }
      );
    }

    if (planDetails.maxInvestment && numericAmount > planDetails.maxInvestment) {
      return NextResponse.json(
        { message: `Amount exceeds the limit for ${plan}. Maximum allowed: $${planDetails.maxInvestment}` },
        { status: 400 }
      );
    }

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
    if (err.message === "No token provided" || err.message === "Invalid token") {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error", errors: [err.message] }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);

    const [deposits, manualReturns, plans] = await Promise.all([
      Deposit.find({ user: user.userId }).sort({ createdAt: -1 }),
      DailyReturn.find({ user: user.userId }),
      InvestmentPlan.find()
    ]);

    const planMap = new Map(plans.map(p => [p.name, p.dailyRoi]));
    const now = new Date();

    const transformedDeposits = deposits.map(dep => {
      let growth = 0;
      
      // Auto ROI calculation removed. System now uses Vercel Cron for daily ROI generation!
      const currentRoi = planMap.get(dep.plan) ?? dep.roi ?? 0;

      // Manual ROI logs
      const manualForThis = manualReturns
        .filter(mr => mr.investment?.toString() === dep._id.toString() && mr.type !== 'bonus')
        .reduce((sum, mr) => sum + mr.amount, 0);

      growth += manualForThis;

      const obj = dep.toObject();
      return {
        ...obj,
        roi: currentRoi,
        currentBalance: dep.amount + growth // Dynamically update balance for UI
      };
    });

    return NextResponse.json({ deposits: transformedDeposits }, { status: 200 });
  } catch (err: any) {
    if (err.message === "No token provided" || err.message === "Invalid token") {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

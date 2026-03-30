import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// ROI configuration with min & max amounts
const planConfig = {
  "Basic Plan": { roi: 5, interval: "daily", duration: 7, minAmount: 100, maxAmount: 500 },
  "Silver Plan": { roi: 7, interval: "daily", duration: 14, minAmount: 500, maxAmount: 1000 },
  "Gold Plan": { roi: 10, interval: "daily", duration: 21, minAmount: 1000, maxAmount: 5000 },
  "Long Term Plan": { roi: 12, interval: "weekly", duration: 8, minAmount: 5000 }, // no maxAmount
} as const;

type PlanName = keyof typeof planConfig;
type PlanDetails = { roi: number; interval: string; duration: number; minAmount?: number; maxAmount?: number };

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

    const planDetailsRaw = planConfig[plan as PlanName];
    if (!planDetailsRaw) return NextResponse.json({ message: "Invalid plan selected." }, { status: 400 });

    const planDetails: PlanDetails = {
      roi: planDetailsRaw.roi,
      interval: planDetailsRaw.interval,
      duration: planDetailsRaw.duration,
      minAmount: planDetailsRaw.minAmount,
      maxAmount: (planDetailsRaw as { maxAmount?: number }).maxAmount,
    };

    // Check minAmount
    if (planDetails.minAmount && numericAmount < planDetails.minAmount) {
      return NextResponse.json(
        { message: `Amount is below the minimum for ${plan}: ${planDetails.minAmount}` },
        { status: 400 }
      );
    }

    // Check maxAmount
    if (planDetails.maxAmount && numericAmount > planDetails.maxAmount) {
      const planNames = Object.keys(planConfig) as PlanName[];
      const currentIndex = planNames.indexOf(plan as PlanName);
      const nextPlan = planNames[currentIndex + 1];

      const nextPlanMsg = nextPlan
        ? `Amount exceeds ${plan}. Try the next plan: ${nextPlan}`
        : `Amount exceeds the limit for ${plan}. Maximum allowed: ${planDetails.maxAmount}`;

      return NextResponse.json(
        { message: nextPlanMsg },
        { status: 400 }
      );
    }

    // Create deposit
    const deposit = await Deposit.create({
      user: new mongoose.Types.ObjectId(user.userId),
      plan,
      wallet,
      amount: numericAmount,
      roi: planDetails.roi,
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

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import { verifyToken } from "@/lib/auth";

import InvestmentPlan from "@/models/investmentPlan";

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = verifyToken(req);

    // Fetch deposits for the logged-in user
    const deposits = await Deposit.find({ user: user.userId }).sort({ createdAt: -1 });

    // Fetch all active plans to use for ROI calculation
    const activePlans = await InvestmentPlan.find({ isActive: true });
    const plansMap = new Map();
    activePlans.forEach(p => plansMap.set(p.name, p));

    // Calculate current balance & end date for active deposits
    const enrichedDeposits = deposits.map(deposit => {
      const dbPlan = plansMap.get(deposit.plan);

      let endDate = deposit.endDate;
      let currentBalance = deposit.currentBalance;

      if (deposit.status === "active" && dbPlan) {
        const start = deposit.startDate ?? deposit.createdAt;
        if (!deposit.endDate) {
          // Calculate endDate based on plan duration
          const duration = dbPlan.durationDays;
          let end = new Date(start);
          end.setDate(end.getDate() + duration);
          endDate = end;
        }

        // Calculate ROI dynamically
        const now = new Date();
        const startTime = new Date(start);
        const endTime = endDate ? new Date(endDate) : now;
        
        // Days difference
        const diffTime = Math.max(0, now.getTime() - startTime.getTime());
        const periods = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const roiAmount = (deposit.amount * dbPlan.dailyRoi * periods) / 100;
        currentBalance = deposit.amount + roiAmount;

        // If endDate has passed, mark as completed (but keep balance)
        if (endDate && now >= endDate) {
          deposit.status = "completed";
          // Final balance at end date
          const totalDays = Math.floor((endDate.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
          currentBalance = deposit.amount + (deposit.amount * dbPlan.dailyRoi * totalDays) / 100;
        }
      }

      return {
        ...deposit.toObject(),
        currentBalance,
        endDate,
      };
    });

    return NextResponse.json({ deposits: enrichedDeposits }, { status: 200 });
  } catch (err: any) {
    console.error("Deposit History API error:", err);
    return NextResponse.json({ message: err.message || "Something went wrong" }, { status: 500 });
  }
}

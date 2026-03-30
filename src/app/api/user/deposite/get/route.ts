import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import { verifyToken } from "@/lib/auth";

// ROI configuration with min & max amounts
const planConfig = {
  "Basic Plan": { roi: 5, interval: "daily", duration: 7 },
  "Silver Plan": { roi: 7, interval: "daily", duration: 14 },
  "Gold Plan": { roi: 10, interval: "daily", duration: 21 },
  "Long Term Plan": { roi: 12, interval: "weekly", duration: 8 },
} as const;

type PlanName = keyof typeof planConfig;

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = verifyToken(req);

    // Fetch deposits for the logged-in user
    const deposits = await Deposit.find({ user: user.userId }).sort({ createdAt: -1 });

    // Calculate current balance & end date for active deposits
    const enrichedDeposits = deposits.map(deposit => {
      const planDetails = planConfig[deposit.plan as PlanName];

      let endDate = deposit.endDate;
      let currentBalance = deposit.currentBalance;

      if (deposit.status === "active" && planDetails) {
        const start = deposit.startDate ?? deposit.createdAt;
        if (!deposit.endDate) {
          // Calculate endDate based on plan duration
          const duration = planDetails.duration;
          const interval = planDetails.interval;
          let end = new Date(start);

          if (interval === "daily") {
            end.setDate(end.getDate() + duration);
          } else if (interval === "weekly") {
            end.setDate(end.getDate() + duration * 7);
          } else if (interval === "monthly") {
            end.setMonth(end.getMonth() + duration);
          }

          endDate = end;
        }

        // Calculate ROI
        const now = new Date();
        const startTime = new Date(start);
        const endTime = endDate ? new Date(endDate) : now;
        let periods = 0;

        if (planDetails.interval === "daily") {
          periods = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
        } else if (planDetails.interval === "weekly") {
          periods = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24 * 7));
        }

        const roiAmount = (deposit.amount * planDetails.roi * periods) / 100;
        currentBalance = deposit.amount + roiAmount;

        // If endDate has passed, mark as completed
        if (endDate && now >= endDate) {
          deposit.status = "completed";
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

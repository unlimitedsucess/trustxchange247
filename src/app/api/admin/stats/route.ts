import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Auth Check could be added here if standard admin token parsing is refactored
    
    // Total Users
    const totalUsers = await User.countDocuments();
    
    // Total Deposits (Approved)
    const deposits = await Deposit.find({ status: { $in: ["approved", "active", "completed"] } });
    const totalDepositsAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Total Withdrawals (Approved/Processed)
    const withdrawals = await Withdrawal.find({ status: { $in: ["approved", "processed", "completed"] } });
    const totalWithdrawalsAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    // Active Investments (Deposits that are "active")
    const activeInvestmentsCount = await Deposit.countDocuments({ status: "active" });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalDepositsAmount,
        totalWithdrawalsAmount,
        activeInvestmentsCount
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import User from "@/models/user";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get("authorization")?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const userId = decoded.id; // Assuming user ID is signed as 'id'

    await connectDB();

    const [deposits, withdrawals, userObj] = await Promise.all([
      Deposit.find({ user: userId }),
      Withdrawal.find({ user: userId }),
      User.findById(userId).select("fullName email transactionPin")
    ]);

    let totalInvested = 0;
    let totalProfit = 0;
    let activeInvestments = 0;

    deposits.forEach((dep) => {
      if (dep.status === "active" || dep.status === "pending" || dep.status === "completed") {
        totalInvested += dep.amount;
      }
      if (dep.status === "active") activeInvestments += 1;
      
      // simplistic profit calculation assuming currentBalance - amount is profit
      if (dep.currentBalance > dep.amount) {
        totalProfit += (dep.currentBalance - dep.amount);
      }
    });

    let totalWithdrawn = 0;
    let pendingWithdrawals = 0;
    
    withdrawals.forEach((w) => {
      if (w.status === "approved") totalWithdrawn += w.amount;
      if (w.status === "pending") pendingWithdrawals += w.amount;
    });

    // withdrawableBalance could be total profit + completed investments minus total withdrawn minus pending.
    // For now, simpler: user gets profit + completed. (depends on actual biz logic)
    const withdrawableBalance = totalProfit + deposits.filter(d => d.status === "completed").reduce((sum, d) => sum + d.amount, 0) - totalWithdrawn - pendingWithdrawals;

    // Format deposits for the investment table
    const recentInvestments = deposits.map(dep => ({
      id: dep._id.toString(),
      plan: dep.planName || "Investment Plan",
      amount: `$${dep.amount.toFixed(2)}`,
      startDate: new Date(dep.createdAt).toLocaleDateString(),
      endDate: dep.status === "completed" ? new Date(dep.updatedAt).toLocaleDateString() : "Ongoing",
      roi: `${dep.roi ? dep.roi : "0"}%`,
      growth: dep.currentBalance ? (dep.currentBalance - dep.amount).toFixed(2) : "0.00"
    }));

    // Format withdrawals for the withdrawal table
    const recentWithdrawals = withdrawals.map(w => ({
      id: w._id.toString(),
      amount: `$${w.amount.toFixed(2)}`,
      status: w.status,
      date: new Date(w.createdAt).toLocaleDateString(),
      walletAddress: w.walletAddress ? w.walletAddress.substring(0, 10) + "..." : "---",
      currency: w.currency || "USD"
    }));

    const stats = {
      totalInvested,
      totalProfit,
      activeInvestments,
      withdrawableBalance: Math.max(0, withdrawableBalance), // prevent negative UI display
      recentInvestments,
      recentWithdrawals,
      user: {
        name: userObj?.fullName || "Investor",
        email: userObj?.email || "...",
        hasTransactionPin: !!userObj?.transactionPin
      }
    };

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

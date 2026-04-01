import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import User from "@/models/user";
import DailyReturn from "@/models/dailyReturn";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const headersList = headers();
    const authHeader = (await headersList).get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const userId = decoded.userId; // FIXED: using 'userId' from JWT payload
    
    if (!userId) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    await connectDB();

    const [deposits, withdrawals, userObj, dailyReturnsData] = await Promise.all([
      Deposit.find({ user: userId }),
      Withdrawal.find({ user: userId }),
      User.findById(userId).select("fullName email transactionPin totalBonus"),
      DailyReturn.find({ user: userId }).sort({ date: -1, createdAt: -1 }).limit(50)
    ]);

    let totalInvested = 0;
    let activeInvestments = 0;
    let totalDepositBonus = 0;
    let autoGrowthProfit = 0;

    const now = new Date();

    deposits.forEach((dep) => {
      // totalInvested includes all active, pending and completed
      if (dep.status === "active" || dep.status === "pending" || dep.status === "completed") {
        totalInvested += dep.amount;
      }
      
      if (dep.status === "active") {
        activeInvestments += 1;
        
        // Automatic ROI calculation based on days elapsed
        if (dep.startDate && dep.roi) {
          const start = new Date(dep.startDate);
          const diffTime = Math.max(0, now.getTime() - start.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0) {
            // Profit = capital * (daily_roi_rate/100) * days
            autoGrowthProfit += (dep.amount * (dep.roi / 100) * diffDays);
          }
        }
      }
      
      if (dep.bonus) totalDepositBonus += dep.bonus;
    });

    let totalWithdrawn = 0;
    let pendingWithdrawals = 0;
    withdrawals.forEach((w) => {
      if (w.status === "approved") totalWithdrawn += w.amount;
      if (w.status === "pending") pendingWithdrawals += w.amount;
    });

    let manualInterests = 0;
    let manualBonuses = 0;
    dailyReturnsData.forEach((dr) => {
        if (dr.type === "bonus") manualBonuses += dr.amount;
        else manualInterests += dr.amount;
    });

    // Total Profit = Auto-calculated ROI + Manual admin history entries
    const totalProfit = autoGrowthProfit + manualInterests; 
    const totalBonus = (userObj?.totalBonus || 0) + totalDepositBonus + manualBonuses;

    const totalWithdrawnValue = totalWithdrawn + pendingWithdrawals;
    const completedInvestmentsValue = deposits.filter(d => d.status === "completed").reduce((sum, d) => sum + d.amount, 0);
    
    // withdrawableBalance = Total Profit + Bonuses + Completed Principal - Active Withdrawals
    const withdrawableBalance = totalProfit + totalBonus + completedInvestmentsValue - totalWithdrawnValue;

    const recentInvestments = deposits.map(dep => ({
      id: dep._id.toString(),
      plan: dep.planName || "Investment Plan",
      amount: `$${dep.amount.toFixed(2)}`,
      startDate: dep.startDate ? new Date(dep.startDate).toLocaleDateString() : "Pending",
      endDate: dep.endDate ? new Date(dep.endDate).toLocaleDateString() : (dep.status === "active" ? "Ongoing" : "N/A"),
      roi: `${dep.roi ? dep.roi : "0"}%`,
      growth: dep.currentBalance ? (dep.currentBalance - dep.amount).toFixed(2) : "0.00"
    }));

    const recentWithdrawals = withdrawals.map(w => ({
      id: w._id.toString(),
      amount: `$${w.amount.toFixed(2)}`,
      status: w.status,
      date: new Date(w.createdAt).toLocaleDateString(),
      walletAddress: w.walletAddress ? w.walletAddress.substring(0, 10) + "..." : "---",
      currency: w.currency || "USD"
    }));

    const dailyReturns = dailyReturnsData.map(dr => ({
        id: dr._id.toString(),
        amount: `$${dr.amount.toFixed(2)}`,
        day: dr.day,
        type: dr.type || "interest",
        date: new Date(dr.date || dr.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }));

    const stats = {
      totalInvested,
      totalProfit,
      totalBonus,
      activeInvestments,
      withdrawableBalance: Math.max(0, withdrawableBalance), 
      recentInvestments,
      recentWithdrawals,
      dailyReturns,
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

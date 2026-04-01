import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import User from "@/models/user";
import DailyReturn from "@/models/dailyReturn";
import InvestmentPlan from "@/models/investmentPlan";
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
    const userId = decoded.userId; 
    
    if (!userId) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    await connectDB();

    const [deposits, withdrawals, userObj, allManualReturns, allPlans] = await Promise.all([
      Deposit.find({ user: userId }),
      Withdrawal.find({ user: userId }),
      User.findById(userId).select("fullName email transactionPin totalBonus status suspensionReason kycStatus idDocument selfieDocument"),
      DailyReturn.find({ user: userId }).sort({ date: -1, createdAt: -1 }),
      InvestmentPlan.find({ isActive: true })
    ]);

    let globalAutoRoi = 0;
    let globalTotalInvested = 0;
    let globalActiveInvestmentsCount = 0;
    let totalDepositBonus = 0;
    let totalApprovedDeposits = 0;
    let totalPendingDeposits = 0;
    let totalRejectedDeposits = 0;

    const now = new Date();
    const planMap = new Map(allPlans.map(p => [p.name, p.dailyRoi]));

    const recentInvestments = deposits.map(dep => {
      // Update totals
      if (dep.status === "active") totalApprovedDeposits += dep.amount;
      if (dep.status === "pending") totalPendingDeposits += dep.amount;
      if (dep.status === "rejected") totalRejectedDeposits += dep.amount;

      // Use live plan ROI if available, otherwise fallback to saved ROI
      const currentRoi = planMap.get(dep.plan) ?? dep.roi ?? 0;

      // 1. Automatic Daily Yield Growth (Mon-Fri only)
      let autoInvestmentGrowth = 0;
      if (dep.status === "active" && dep.startDate && currentRoi) {
        const start = new Date(dep.startDate);
        const end = new Date(now);
        
        let count = 0;
        let current = new Date(start);
        
        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
                if (current.toDateString() !== start.toDateString()) {
                    count++;
                }
            }
            current.setDate(current.getDate() + 1);
        }

        if (count > 0) {
          autoInvestmentGrowth = (dep.amount * (currentRoi / 100) * count);
        }
      }

      // 2. Performance Ledger Items tied to this investment
      const manualForThis = allManualReturns
        .filter(mr => mr.investment?.toString() === dep._id.toString())
        .reduce((sum, dr) => (dr.type !== 'bonus' ? sum + dr.amount : sum), 0); 

      const totalGrowth = autoInvestmentGrowth + manualForThis;

      // Update globals
      if (dep.status === "active" || dep.status === "completed" || dep.status === "pending") {
        globalTotalInvested += dep.amount;
      }
      if (dep.status === "active") {
        globalActiveInvestmentsCount += 1;
        globalAutoRoi += autoInvestmentGrowth;
      }
      if (dep.bonus) totalDepositBonus += dep.bonus;

      return {
        id: dep._id.toString(),
        plan: dep.plan || "Investment Plan", 
        amount: `$${dep.amount.toFixed(2)}`,
        startDate: dep.startDate ? new Date(dep.startDate).toLocaleDateString() : "Pending",
        endDate: dep.endDate ? new Date(dep.endDate).toLocaleDateString() : (dep.status === "active" ? "Ongoing" : "N/A"),
        roi: `${currentRoi}%`,
        status: dep.status,
        growth: totalGrowth.toFixed(2)
      };
    });

    // Sum all manual INTERESTS 
    let manualInterestsTotal = 0;
    let manualBonusesTotal = 0;
    allManualReturns.forEach((mr) => {
        if (mr.type === "bonus") manualBonusesTotal += mr.amount;
        else manualInterestsTotal += mr.amount;
    });

    const totalProfit = globalAutoRoi + manualInterestsTotal; 
    const totalBonus = (userObj?.totalBonus || 0) + totalDepositBonus + manualBonusesTotal;

    let totalWithdrawn = 0;
    let pendingWithdrawals = 0;
    withdrawals.forEach((w) => {
      if (w.status === "approved") totalWithdrawn += w.amount;
      if (w.status === "pending") pendingWithdrawals += w.amount;
    });

    const completedInvestmentsValue = deposits.filter(d => d.status === "completed").reduce((sum, d) => sum + d.amount, 0);
    const withdrawableBalance = totalProfit + totalBonus + completedInvestmentsValue - totalWithdrawn - pendingWithdrawals;

    const recentWithdrawals = withdrawals.map(w => ({
      id: w._id.toString(),
      amount: `$${w.amount.toFixed(2)}`,
      status: w.status,
      date: new Date(w.createdAt).toLocaleDateString(),
      walletAddress: w.walletAddress ? w.walletAddress.substring(0, 10) + "..." : "---",
      currency: w.currency || "USD"
    }));

    const dailyReturns = allManualReturns.map(mr => ({
        id: mr._id.toString(),
        amount: `$${mr.amount.toFixed(2)}`,
        day: mr.day,
        type: mr.type || "interest",
        date: new Date(mr.date || mr.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }));

    const stats = {
      totalInvested: globalTotalInvested,
      totalProfit,
      totalBonus,
      totalWithdrawn,
      totalApprovedDeposits,
      totalPendingDeposits,
      totalRejectedDeposits,
      activeInvestments: globalActiveInvestmentsCount,
      withdrawableBalance: Math.max(0, withdrawableBalance), 
      recentInvestments,
      recentWithdrawals,
      dailyReturns,
      user: {
        name: userObj?.fullName || "Investor",
        email: userObj?.email || "...",
        hasTransactionPin: !!userObj?.transactionPin,
        status: userObj?.status || "active",
        suspensionReason: userObj?.suspensionReason || "",
        kycStatus: userObj?.kycStatus || "unverified"
      }
    };

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

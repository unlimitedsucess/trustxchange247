import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import User from "@/models/user";
import DailyReturn from "@/models/dailyReturn";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const headersList = headers();
    const authHeader = (await headersList).get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const userId = decoded.id; 

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
    let totalGrowth = 0;

    deposits.forEach((dep) => {
      if (dep.status === "active" || dep.status === "pending" || dep.status === "completed") {
        totalInvested += dep.amount;
      }
      if (dep.status === "active") activeInvestments += 1;
      if (dep.bonus) totalDepositBonus += dep.bonus;
      
      const currentVal = dep.currentBalance || dep.amount;
      if (currentVal > dep.amount) {
        totalGrowth += (currentVal - dep.amount);
      }
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

    const totalProfit = totalGrowth + manualInterests; 
    const totalBonus = (userObj?.totalBonus || 0) + totalDepositBonus + manualBonuses;

    const totalWithdrawnValue = totalWithdrawn + pendingWithdrawals;
    const completedInvestmentsValue = deposits.filter(d => d.status === "completed").reduce((sum, d) => sum + d.amount, 0);
    const withdrawableBalance = totalProfit + totalBonus + completedInvestmentsValue - totalWithdrawnValue;

    const recentInvestments = deposits.map(dep => ({
      id: dep._id.toString(),
      plan: dep.planName || "Investment Plan",
      amount: `$${dep.amount.toFixed(2)}`,
      startDate: new Date(dep.createdAt).toLocaleDateString(),
      endDate: dep.status === "completed" ? new Date(dep.updatedAt).toLocaleDateString() : "Ongoing",
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

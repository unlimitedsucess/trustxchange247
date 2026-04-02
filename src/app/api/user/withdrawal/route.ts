import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import DailyReturn from "@/models/dailyReturn";
import InvestmentPlan from "@/models/investmentPlan";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = decoded.userId || decoded.id; // Support different JWT payload mappings

    await connectDB();

    const body = await req.json();
    const { amount, walletAddress, transactionPin, currency = "USDT (TRC20)" } = body;

    if (!amount || amount <= 0 || !walletAddress || !transactionPin) {
      return NextResponse.json(
        { message: "Amount, wallet address, and Transaction PIN are all required." },
        { status: 400 }
      );
    }

    // 1. Authenticate the User
    const user = await User.findById(userId).select("transactionPin totalBonus status kycStatus");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Suspension check
    if (user.status === "suspended") {
      return NextResponse.json({ message: "Your account is currently suspended and withdrawals are disabled. Please contact support." }, { status: 403 });
    }

    // KYC check
    if (user.kycStatus !== "verified") {
      return NextResponse.json({ message: "Identity verification (KYC) is required before withdrawing funds." }, { status: 403 });
    }

    // 2. Validate or Register Transaction PIN
    if (!user.transactionPin) {
      // First time withdrawal -> Set the PIN
      user.transactionPin = transactionPin;
      await user.save();
    } else {
      // Returning withdrawal -> Verify the PIN strictly matches
      if (user.transactionPin !== transactionPin) {
        return NextResponse.json(
          { message: "Invalid Transaction PIN." },
          { status: 403 }
        );
      }
    }

    // 3. Reconcile Network Ledger Balance
    const [deposits, withdrawalsArray, allManualReturns, allPlans] = await Promise.all([
      Deposit.find({ user: userId }),
      Withdrawal.find({ user: userId }),
      DailyReturn.find({ user: userId }),
      InvestmentPlan.find({ isActive: true })
    ]);

    let globalAutoRoi = 0;
    let totalDepositBonus = 0;
    const now = new Date();
    const planMap = new Map(allPlans.map(p => [p.name, p.dailyRoi]));

    deposits.forEach((dep) => {
      const currentRoi = planMap.get(dep.plan) ?? dep.roi ?? 0;
      let autoInvestmentGrowth = 0;
      
      if ((dep.status === "active" || dep.status === "completed") && dep.startDate && currentRoi) {
        const start = new Date(dep.startDate);
        const end = (dep.status === "completed" && dep.endDate) ? new Date(dep.endDate) : new Date(now);
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
      
      if (dep.status === "active" || dep.status === "completed") {
        globalAutoRoi += autoInvestmentGrowth;
      }
      if (dep.bonus) totalDepositBonus += dep.bonus;
    });

    let manualInterestsTotal = 0;
    let manualBonusesTotal = 0;
    allManualReturns.forEach((mr) => {
        if (mr.type === "bonus") manualBonusesTotal += mr.amount;
        else manualInterestsTotal += mr.amount;
    });

    const totalProfit = globalAutoRoi + manualInterestsTotal;
    const totalBonus = (user.totalBonus || 0) + totalDepositBonus + manualBonusesTotal;

    const completedInvestments = deposits
      .filter(d => d.status === "completed")
      .reduce((sum, d) => sum + d.amount, 0);

    const activeInvestments = deposits
      .filter(d => d.status === "active")
      .reduce((sum, d) => sum + d.amount, 0);

    let totalWithdrawnAndPending = 0;
    withdrawalsArray.forEach((w) => {
      if (w.status === "approved" || w.status === "pending" || w.status === "processed" || w.status === "Completed" || w.status === "completed") {
        totalWithdrawnAndPending += w.amount;
      }
    });

    // Compute hard balance including bonus and active investments
    const withdrawableBalance = totalProfit + completedInvestments + activeInvestments + totalBonus - totalWithdrawnAndPending;

    if (amount > withdrawableBalance) {
      return NextResponse.json(
        { message: "Insufficient available balance for this withdrawal." },
        { status: 400 }
      );
    }

    // 4. Dispatch the Event
    const newWithdrawal = await Withdrawal.create({
      user: userId,
      amount,
      walletAddress,
      currency,
      status: "pending",
    });

    return NextResponse.json(
      { 
        message: "Withdrawal request submitted successfully.",
        data: newWithdrawal
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("User Withdrawal Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

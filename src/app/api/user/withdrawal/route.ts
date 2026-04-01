import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
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
    const user = await User.findById(userId).select("transactionPin totalBonus status");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Suspension check
    if (user.status === "suspended") {
      return NextResponse.json({ message: "Your account is currently suspended and withdrawals are disabled. Please contact support." }, { status: 403 });
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
    const [deposits, withdrawals] = await Promise.all([
      Deposit.find({ user: userId }),
      Withdrawal.find({ user: userId })
    ]);

    let totalProfit = 0;
    deposits.forEach((dep) => {
      // Compound realistic profit derived from currentBalance minus base
      if (dep.currentBalance && dep.currentBalance > dep.amount) {
        totalProfit += (dep.currentBalance - dep.amount);
      }
    });

    const completedInvestments = deposits
      .filter(d => d.status === "completed")
      .reduce((sum, d) => sum + d.amount, 0);

    let totalWithdrawnAndPending = 0;
    withdrawals.forEach((w) => {
      if (w.status === "approved" || w.status === "pending" || w.status === "Completed") {
        totalWithdrawnAndPending += w.amount;
      }
    });

    const totalBonus = user.totalBonus || 0;

    // Compute hard balance including bonus
    const withdrawableBalance = totalProfit + completedInvestments + totalBonus - totalWithdrawnAndPending;

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

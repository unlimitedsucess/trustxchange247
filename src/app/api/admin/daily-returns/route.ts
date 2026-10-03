import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DailyReturn from "@/models/dailyReturn";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import { sendDailyReturnEmail, sendBonusEmail } from "@/lib/email";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    await connectDB();
    const dailyReturns = await DailyReturn.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: dailyReturns }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (typeof decoded !== "object" || decoded === null || decoded.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { userId, returns } = body; 
    // 'returns' is an array of objects: { amount, day, date, type, investmentId }

    if (!userId || !Array.isArray(returns) || returns.length === 0) {
        return NextResponse.json({ success: false, message: "UserId and an array of returns are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const hasBonusWalletReturn = returns.some((item) => item.source === "bonus-wallet");
    if (hasBonusWalletReturn && (returns.length !== 1 || Number(user.bonusBalance || 0) <= 0)) {
      return NextResponse.json({ success: false, message: "A bonus wallet return requires one entry for a user with a funded bonus wallet" }, { status: 400 });
    }

    for (const item of returns) {
      const amount = Number(item.amount);
      if (!Number.isFinite(amount) || amount <= 0 || typeof item.day !== "string" || !item.day.trim()) {
        return NextResponse.json({ success: false, message: "Each return needs a positive amount and a label" }, { status: 400 });
      }
      if (item.source === "bonus-wallet" && (item.type !== "bonus" || item.investmentId)) {
        return NextResponse.json({ success: false, message: "Bonus wallet returns must be fixed bonus entries without an investment" }, { status: 400 });
      }
      if (item.date && Number.isNaN(new Date(item.date).getTime())) {
        return NextResponse.json({ success: false, message: "Invalid return date" }, { status: 400 });
      }
    }

    if (hasBonusWalletReturn) {
      const returnDate = returns[0].date ? new Date(returns[0].date) : new Date();
      const dateKey = returnDate.toISOString().slice(0, 10);
      const alreadyRecorded = await DailyReturn.exists({
        user: userId,
        source: "bonus-wallet",
        dateKey,
      });
      if (alreadyRecorded) {
        return NextResponse.json({ success: false, message: "A bonus wallet return is already recorded for this user and date" }, { status: 409 });
      }
    }

    const createdReturns = [];
    let totalInterests = 0;
    let totalBonuses = 0;

    for (const item of returns) {
        const nr = await DailyReturn.create({ 
            user: userId, 
            investment: item.investmentId || null,
            amount: Number(item.amount), 
            day: item.day, 
            date: item.date ? new Date(item.date) : new Date(),
            type: item.type || "interest",
            source: item.source || "investment",
            dateKey: item.source === "bonus-wallet"
              ? new Date(item.date || new Date()).toISOString().slice(0, 10)
              : undefined,
        });
        
        // Also update the physical Deposit.currentBalance so the DB stays perfectly aligned 
        // with the API's sum computation.
        if (item.investmentId && item.type !== "bonus") {
            const deposit = await Deposit.findById(item.investmentId);
            if (deposit) {
                deposit.currentBalance += Number(item.amount);
                await deposit.save();
            }
        }
        if (item.source === "bonus-wallet" && user.totalBalance !== undefined && user.totalBalance !== null) {
            await User.updateOne({ _id: userId }, { $inc: { totalBalance: Number(item.amount) } });
        }
        
        createdReturns.push(nr);
        if (item.type === "bonus") totalBonuses += Number(item.amount);
        else totalInterests += Number(item.amount);
    }

    // Send notification emails (Aggregated summary)
    try {
        if (totalInterests > 0) {
            await sendDailyReturnEmail(user.email, totalInterests, "Distributed Earnings");
        }
        if (totalBonuses > 0) {
            await sendBonusEmail(user.email, totalBonuses);
        }
    } catch (err) {
        console.error("Email notification failed", err);
    }

    return NextResponse.json({ success: true, data: createdReturns }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "A bonus wallet return is already recorded for this user and date" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

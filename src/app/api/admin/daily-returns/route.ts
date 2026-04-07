import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DailyReturn from "@/models/dailyReturn";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import { sendDailyReturnEmail, sendBonusEmail } from "@/lib/email";

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
            type: item.type || "interest"
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
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

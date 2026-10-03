import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import BonusWalletTransaction from "@/models/bonusWalletTransaction";
import { sendBonusWalletEmail } from "@/lib/email";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
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
    const { id } = await props.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const type = body.type;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!Number.isFinite(amount) || amount <= 0 || (type !== "credit" && type !== "debit")) {
      return NextResponse.json({ success: false, message: "A positive amount and valid adjustment type are required" }, { status: 400 });
    }

    await connectDB();
    const session = await mongoose.startSession();
    let updatedBalance: number | null = null;
    let updatedEmail = "";

    try {
      await session.withTransaction(async () => {
        const delta = type === "credit" ? amount : -amount;
        const updatedUser = await User.findOneAndUpdate(
          type === "debit" ? { _id: id, bonusBalance: { $gte: amount } } : { _id: id },
          { $inc: { bonusBalance: delta } },
          { new: true, session },
        );

        if (!updatedUser) {
          const exists = await User.exists({ _id: id }).session(session);
          throw new Error(exists ? "Insufficient bonus wallet balance" : "User not found");
        }
        updatedBalance = updatedUser.bonusBalance;
        updatedEmail = updatedUser.email;

        await BonusWalletTransaction.create(
          [{
            user: id,
            type,
            amount,
            balanceAfter: updatedBalance,
            reason: reason || undefined,
          }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    if (updatedBalance === null) {
      return NextResponse.json({ success: false, message: "Bonus wallet update failed" }, { status: 500 });
    }

    try {
      await sendBonusWalletEmail(updatedEmail, amount, updatedBalance, type, reason);
    } catch (emailError) {
      console.error("Failed to send bonus wallet adjustment email:", emailError);
      return NextResponse.json({
        success: true,
        data: { bonusBalance: updatedBalance },
        emailSent: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: { bonusBalance: updatedBalance },
      emailSent: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bonus wallet adjustment failed";
    if (message === "Insufficient bonus wallet balance") {
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
    if (message === "User not found") {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }
    console.error("Bonus wallet adjustment failed:", error);
    return NextResponse.json({ success: false, message: "Bonus wallet adjustment failed" }, { status: 500 });
  }
}

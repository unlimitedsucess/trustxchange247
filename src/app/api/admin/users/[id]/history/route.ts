import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import DailyReturn from "@/models/dailyReturn";
import User from "@/models/user";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const [deposits, withdrawals, returns] = await Promise.all([
      Deposit.find({ user: id }).sort({ createdAt: -1 }),
      Withdrawal.find({ user: id }).sort({ createdAt: -1 }),
      DailyReturn.find({ user: id }).sort({ createdAt: -1 })
    ]);

    const history = [
      ...deposits.map(d => ({ ...d.toObject(), typeCategory: 'deposit', displayDate: d.createdAt })),
      ...withdrawals.map(w => ({ ...w.toObject(), typeCategory: 'withdrawal', displayDate: w.createdAt })),
      ...returns.map(r => ({ ...r.toObject(), typeCategory: 'return', displayDate: r.createdAt }))
    ].sort((a: any, b: any) => new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime());

    return NextResponse.json({ success: true, data: history }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const typeCategory = url.searchParams.get("typeCategory");
    const recordId = url.searchParams.get("recordId");

    if (!typeCategory || !recordId) {
       return NextResponse.json({ success: false, message: "Missing query parameters" }, { status: 400 });
    }

    if (typeCategory === 'deposit') await Deposit.findByIdAndDelete(recordId);
    else if (typeCategory === 'withdrawal') await Withdrawal.findByIdAndDelete(recordId);
    else if (typeCategory === 'return') await DailyReturn.findByIdAndDelete(recordId);

    return NextResponse.json({ success: true, message: "Record deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await req.json();
    const { typeCategory, recordId, amount, currentBalance, status } = body;

    if (!typeCategory || !recordId) {
      return NextResponse.json({ success: false, message: "Missing record info" }, { status: 400 });
    }

    if (typeCategory === 'deposit') {
        const updateData: any = {};
        if (amount !== undefined) updateData.amount = Number(amount);
        if (currentBalance !== undefined) updateData.currentBalance = Number(currentBalance);
        if (status !== undefined) updateData.status = status;
        await Deposit.findByIdAndUpdate(recordId, updateData);
    }
    else if (typeCategory === 'withdrawal') {
        const updateData: any = {};
        if (amount !== undefined) updateData.amount = Number(amount);
        if (status !== undefined) updateData.status = status;
        await Withdrawal.findByIdAndUpdate(recordId, updateData);
    }
    else if (typeCategory === 'return') {
        const updateData: any = {};
        if (amount !== undefined) updateData.amount = Number(amount);
        await DailyReturn.findByIdAndUpdate(recordId, updateData);
    }

    return NextResponse.json({ success: true, message: "Record updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Withdrawal from "@/models/withdrawal";
import User from "@/models/user";
import { sendWithdrawalApprovalEmail } from "@/lib/email";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const { status } = await req.json(); // status can be "approved", "rejected"
    
    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).populate("user");
    
    if (!updatedWithdrawal) {
      return NextResponse.json({ success: false, message: "Withdrawal not found" }, { status: 404 });
    }

    if (status === "approved" && updatedWithdrawal.user?.email) {
      try {
        await sendWithdrawalApprovalEmail(
          updatedWithdrawal.user.email,
          updatedWithdrawal.amount,
          updatedWithdrawal.walletAddress
        );
      } catch (err) {
        console.error("Failed to send withdrawal approval email:", err);
      }
    }

    return NextResponse.json({ success: true, data: updatedWithdrawal }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    
    const deletedWithdrawal = await Withdrawal.findByIdAndDelete(id);
    if (!deletedWithdrawal) {
      return NextResponse.json({ success: false, message: "Withdrawal not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Withdrawal deleted safely" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

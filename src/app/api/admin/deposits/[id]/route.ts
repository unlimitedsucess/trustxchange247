import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import User from "@/models/user";
import InvestmentPlan from "@/models/investmentPlan";
import { sendDepositApprovalEmail, sendBonusEmail } from "@/lib/email";

// PUT /api/admin/deposits/[id]/approve  or just general status update
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const body = await req.json();
    const { status, roi, bonus } = body; // status can be "active", "completed", "rejected"
    
    const depositToUpdate = await Deposit.findById(id).populate("user");
    if (!depositToUpdate) {
      return NextResponse.json({ success: false, message: "Deposit not found" }, { status: 404 });
    }

    let updates: any = {};
    if (status) updates.status = status;
    if (roi !== undefined) updates.roi = Number(roi);
    if (bonus !== undefined) updates.bonus = Number(bonus);
    
    // Only calculate start and end dates if we are freshly moving to 'active'
    if (status === "active" && depositToUpdate.status !== "active") {
      updates.startDate = new Date();
      
      const planObj = await InvestmentPlan.findOne({ name: depositToUpdate.plan });
      if (planObj && planObj.durationDays) {
        const endDate = new Date(updates.startDate);
        endDate.setDate(endDate.getDate() + planObj.durationDays);
        updates.endDate = endDate;
      }
    }

    // Check if bonus was added
    const oldBonus = depositToUpdate.bonus || 0;
    const isBonusAdded = bonus !== undefined && Number(bonus) > oldBonus;
    const addedAmount = isBonusAdded ? (Number(bonus) - oldBonus) : 0;

    const updatedDeposit = await Deposit.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).populate("user");
    
    if (!updatedDeposit) {
      return NextResponse.json({ success: false, message: "Deposit not found" }, { status: 404 });
    }

    const isNewlyActive = status === "active" && depositToUpdate.status !== "active";

    if (isNewlyActive && updatedDeposit.user?.email) {
      try {
        await sendDepositApprovalEmail(updatedDeposit.user.email, updatedDeposit.amount, updatedDeposit.plan);
      } catch (err) {
        console.error("Failed to send approval email:", err);
      }
    }

    return NextResponse.json({ success: true, data: updatedDeposit }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    
    const deletedDeposit = await Deposit.findByIdAndDelete(id);
    if (!deletedDeposit) {
      return NextResponse.json({ success: false, message: "Deposit not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Deposit deleted safely" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

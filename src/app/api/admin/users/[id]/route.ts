import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";
import DailyReturn from "@/models/dailyReturn";
import bcrypt from "bcrypt";
import { sendBonusEmail } from "@/lib/email";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const body = await req.json();
    
    // Fetch old user to compare bonus
    const oldUser = await User.findById(id);
    if (!oldUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // If the admin is updating the password, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password; // Do not overwrite if no password is provided
    }

    // Check if totalBonus is increased
    const isBonusAdded = body.totalBonus !== undefined && Number(body.totalBonus) > (oldUser.totalBonus || 0);
    const addedAmount = isBonusAdded ? (Number(body.totalBonus) - (oldUser.totalBonus || 0)) : 0;

    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Internal update error" }, { status: 500 });
    }

    // Send email if bonus was added
    if (isBonusAdded) {
      try {
        await sendBonusEmail(updatedUser.email, addedAmount);
      } catch (emailErr) {
        console.error("Failed to send bonus email:", emailErr);
        // We don't fail the whole request if email fails, but we log it
      }
    }
    
    // Do not return password hash
    const userToReturn = updatedUser.toObject();
    delete userToReturn.password;

    return NextResponse.json({ success: true, data: userToReturn }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    // Delete related records
    await Promise.all([
      Deposit.deleteMany({ user: id }),
      Withdrawal.deleteMany({ user: id }),
      DailyReturn.deleteMany({ user: id })
    ]);

    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "User and all related data deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

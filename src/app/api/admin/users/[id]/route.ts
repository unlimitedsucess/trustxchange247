import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcrypt";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const body = await req.json();
    
    // If the admin is updating the password, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password; // Do not overwrite if no password is provided
    }

    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
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
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

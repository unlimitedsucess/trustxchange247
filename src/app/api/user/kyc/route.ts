import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(req);

    const { idDocument, selfieDocument } = await req.json();

    if (!idDocument || !selfieDocument) {
      return NextResponse.json({ message: "Both ID Document and Selfie are required" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        idDocument,
        selfieDocument,
        kycStatus: "pending"
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the updated kycStatus along with the response
    return NextResponse.json({ 
      success: true, 
      message: "KYC documents submitted successfully. Please wait for admin approval.",
      kycStatus: updatedUser.kycStatus
    }, { status: 200 });

  } catch (err: any) {
    if (err.message === "No token provided" || err.message === "Invalid token") {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

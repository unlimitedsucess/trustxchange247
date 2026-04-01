import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { sendSuspensionEmail } from "@/lib/email";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const body = await req.json();
    const { reason, status } = body; // status can be "suspended" or "active"

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    user.status = status;
    if (status === "suspended") {
      user.suspensionReason = reason || "Unspecified violation of platform terms.";
      
      // Notify the user via email
      try {
        await sendSuspensionEmail(user.email, user.suspensionReason);
      } catch (err) {
        console.error("Failed to send suspension email:", err);
      }
    } else {
      user.suspensionReason = undefined; 
    }

    await user.save();

    return NextResponse.json({ success: true, message: `User account has been ${status}.` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

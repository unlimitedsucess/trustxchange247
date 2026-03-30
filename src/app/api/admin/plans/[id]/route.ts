import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InvestmentPlan from "@/models/investmentPlan";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const body = await req.json();
    const updatedPlan = await InvestmentPlan.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedPlan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedPlan }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;
    const deletedPlan = await InvestmentPlan.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Plan deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

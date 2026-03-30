import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import InvestmentPlan from "@/models/investmentPlan";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectDB();
    const plans = await InvestmentPlan.find();
    return NextResponse.json({ success: true, data: plans }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newPlan = await InvestmentPlan.create(body);
    return NextResponse.json({ success: true, data: newPlan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

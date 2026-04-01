import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import InvestmentPlan from "@/models/investmentPlan";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const [investments, plans] = await Promise.all([
      Deposit.find({ status: { $in: ["active", "completed"] } })
        .populate("user", "fullName email")
        .sort({ createdAt: -1 }),
      InvestmentPlan.find()
    ]);

    const planMap = new Map(plans.map(p => [p.name, p.dailyRoi]));

    const transformed = investments.map(inv => {
      const obj = inv.toObject();
      // Ensure "reflected everywhere" by checking the latest plan ROI
      return {
        ...obj,
        roi: planMap.get(inv.plan) ?? inv.roi ?? 0
      };
    });

    return NextResponse.json({ success: true, data: transformed }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

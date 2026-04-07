import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Deposit from "@/models/deposit";
import DailyReturn from "@/models/dailyReturn";
import InvestmentPlan from "@/models/investmentPlan";

// GET /api/cron/roi
// Expected to be triggered by Vercel Cron every weekday at 2:00 AM
export async function GET(req: Request) {
  try {
    // Optionally check for Vercel Cron Secret here:
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    await connectDB();

    // Verify it's a weekday (M-F)
    // Even though cron schedule `0 2 * * 1-5` handles this, it's safe to double-check
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({ success: true, message: "Skipping weekend ROI calculation" });
    }

    const plans = await InvestmentPlan.find();
    const planMap = new Map(plans.map(p => [p.name, p.dailyRoi]));

    // Find all active deposits
    const activeDeposits = await Deposit.find({ status: "active" });

    let processedCount = 0;

    for (const deposit of activeDeposits) {
      // Find current ROI
      let currentRoi = planMap.get(deposit.plan);
      if (currentRoi === undefined) {
          currentRoi = deposit.roi;
      }
      
      if (!currentRoi || currentRoi <= 0) continue;

      // Calculate daily amount
      const dailyEarned = deposit.amount * (currentRoi / 100);

      // We update the currentBalance directly
      deposit.currentBalance += dailyEarned;

      // Create a DailyReturn record
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      await DailyReturn.create({
        user: deposit.user,
        investment: deposit._id,
        amount: dailyEarned,
        day: `${dayNames[dayOfWeek]} ROI`,
        type: "interest",
      });

      await deposit.save();
      processedCount++;
    }

    return NextResponse.json({ success: true, message: `Processed ROI for ${processedCount} active deposits` });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

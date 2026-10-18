import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import DailyReturn from "@/models/dailyReturn";
import InvestmentPlan from "@/models/investmentPlan";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface InvestorResponse {
  id: string;
  rank: number;
  name: string;
  role: string;
  location: string;
  email: string;
  portfolio: string;
  portfolioRaw: number;
  roi: string;
  specialty: string;
  bio: string;
  status: string;
  initials: string;
  avatarGradient: string;
}

const GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-red-600",
  "from-violet-500 to-purple-600",
];

const ROLES = [
  "Venture Capitalist & Macro Strategist",
  "Algorithmic & Quantitative Allocator",
  "Senior Private Equity Partner",
  "Institutional Wealth Consultant",
  "Digital Asset & Treasury Director",
  "Senior Portfolio Allocator",
];

const STATUSES = [
  "VIP Elite Partner",
  "Master Trader",
  "Tier 1 Verified",
  "Verified Mentor",
  "Elite Member",
];

const SPECIALTIES = [
  "High-Yield Staking & Bitcoin Macro",
  "Automated ROI & Arbitrage Hedging",
  "Layer 1 Ecosystems & Yield Farming",
  "Yield Optimization & Asset Protection",
  "Liquidity Pools & Tokenomics",
];

const BIOS = [
  "Always open to advising new investors on risk mitigation and structured crypto wealth compounding.",
  "Connecting with ambitious platform newcomers interested in algorithmic returns and stable yield.",
  "Feel free to reach out to discuss sustainable portfolio diversification across digital assets.",
  "Passionate about helping new members navigate crypto market volatility and achieve financial independence.",
  "Drop me an email anytime to compare investment plans and strategic compounding milestones.",
];

const FALLBACK_INVESTORS: InvestorResponse[] = [
  {
    id: "fallback-1",
    rank: 1,
    name: "Marc Vanderberg",
    role: "Venture Capitalist & Macro Strategist",
    location: "Luxembourg City, Luxembourg",
    email: "m.vanderberg@trustxchange-investors.com",
    portfolio: "$2,450,000+",
    portfolioRaw: 2450000,
    roi: "+184.2%",
    specialty: "High-Yield Staking & Bitcoin Macro",
    bio: "Always open to advising new investors on risk mitigation and structured crypto wealth compounding.",
    status: "VIP Elite Partner",
    initials: "MV",
    avatarGradient: "from-amber-500 to-orange-600",
  },
  {
    id: "fallback-2",
    rank: 2,
    name: "Elena Rostova",
    role: "Algorithmic & Quantitative Allocator",
    location: "Zurich, Switzerland",
    email: "elena.rostova@quantumholdings.ch",
    portfolio: "$1,820,000+",
    portfolioRaw: 1820000,
    roi: "+162.7%",
    specialty: "Automated ROI & Arbitrage Hedging",
    bio: "Connecting with ambitious platform newcomers interested in algorithmic returns and stable yield.",
    status: "Master Trader",
    initials: "ER",
    avatarGradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "fallback-3",
    rank: 3,
    name: "David K. Chen",
    role: "Senior Private Equity Partner",
    location: "Marina Bay, Singapore",
    email: "david.chen.capital@pacificalpha.io",
    portfolio: "$1,430,000+",
    portfolioRaw: 1430000,
    roi: "+139.5%",
    specialty: "Layer 1 Ecosystems & Yield Farming",
    bio: "Feel free to reach out to discuss sustainable portfolio diversification across digital assets.",
    status: "Tier 1 Verified",
    initials: "DC",
    avatarGradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "fallback-4",
    rank: 4,
    name: "Sarah Jenkins",
    role: "Institutional Wealth Consultant",
    location: "London, United Kingdom",
    email: "sarah.jenkins@apexwealthadvisors.co.uk",
    portfolio: "$1,150,000+",
    portfolioRaw: 1150000,
    roi: "+128.4%",
    specialty: "Yield Optimization & Asset Protection",
    bio: "Passionate about helping new members navigate crypto market volatility and achieve financial independence.",
    status: "Verified Mentor",
    initials: "SJ",
    avatarGradient: "from-purple-500 to-pink-600",
  },
  {
    id: "fallback-5",
    rank: 5,
    name: "Jean-Luc Moreau",
    role: "Digital Asset & Treasury Director",
    location: "Kirchberg, Luxembourg",
    email: "jl.moreau@luxcapitalpartners.lu",
    portfolio: "$980,000+",
    portfolioRaw: 980000,
    roi: "+115.8%",
    specialty: "Liquidity Pools & Tokenomics",
    bio: "Drop me an email anytime to compare investment plans and strategic compounding milestones.",
    status: "Elite Member",
    initials: "JM",
    avatarGradient: "from-cyan-500 to-blue-600",
  },
];

function getInitials(name: string, email: string): string {
  const cleanName = (name || "").trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  }
  const emailPart = (email || "").split("@")[0].replace(/[^a-zA-Z]/g, "");
  return (emailPart.substring(0, 2) || "TX").toUpperCase();
}

function formatDisplayName(name?: string, email?: string): string {
  if (name && name.trim()) return name.trim();
  if (!email) return "Verified Investor";
  const prefix = email.split("@")[0];
  return prefix
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Verified Investor";
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "5", 10));
    const fallbackParam = searchParams.get("fallback");

    // 1. Aggregate deposits grouped by user (counting non-rejected deposits)
    const depositsAgg = await Deposit.aggregate([
      {
        $match: {
          status: { $in: ["active", "completed", "approved", "pending"] },
        },
      },
      {
        $group: {
          _id: "$user",
          totalInvested: { $sum: "$amount" },
          activeInvested: {
            $sum: {
              $cond: [{ $in: ["$status", ["active", "completed", "approved"]] }, "$amount", 0],
            },
          },
          depositCount: { $sum: 1 },
          plans: { $addToSet: "$plan" },
          latestDepositDate: { $max: "$createdAt" },
        },
      },
      {
        $sort: { totalInvested: -1 },
      },
    ]);

    const userIdsWithDeposits = depositsAgg.map((d) => d._id);

    // 2. Query registered users who are not suspended and either have deposits or balance
    const activeUsers = await User.find({
      $and: [
        { status: { $ne: "suspended" } },
        {
          $or: [
            { _id: { $in: userIdsWithDeposits } },
            { totalBalance: { $gt: 0 } },
          ],
        },
      ],
    }).select("fullName email country totalBalance status createdAt");

    const depositMap = new Map(depositsAgg.map((d) => [d._id.toString(), d]));

    // 3. Calculate total invested per user and filter out non-investors
    const qualifiedUsers = activeUsers
      .map((user) => {
        const depData = depositMap.get(user._id.toString());
        const deposited = depData?.totalInvested || 0;
        const balance = user.totalBalance || 0;
        const effectiveAmount = Math.max(deposited, balance);

        return {
          user,
          depData,
          effectiveAmount,
          latestActivity: depData?.latestDepositDate || user.createdAt || new Date(0),
        };
      })
      .filter((item) => item.effectiveAmount > 0);

    // 4. Sort descending by invested amount (highest amount ranks #1)
    qualifiedUsers.sort((a, b) => {
      if (b.effectiveAmount !== a.effectiveAmount) {
        return b.effectiveAmount - a.effectiveAmount;
      }
      return new Date(b.latestActivity).getTime() - new Date(a.latestActivity).getTime();
    });

    // If no real registered investors exist in DB:
    if (qualifiedUsers.length === 0) {
      if (fallbackParam === "true" || fallbackParam === "1") {
        return NextResponse.json({
          success: true,
          data: FALLBACK_INVESTORS.slice(0, limit),
          total: FALLBACK_INVESTORS.length,
          isFallback: true,
          message: "No registered investors found. Showing benchmark profiles.",
        });
      }

      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        isFallback: false,
        message: "No registered users with investments yet.",
      });
    }

    // 5. Fetch returns for top users to compute ROI
    const topCandidates = qualifiedUsers.slice(0, limit);
    const candidateIds = topCandidates.map((c) => c.user._id);

    const userReturns = await DailyReturn.find({
      user: { $in: candidateIds },
      type: "interest",
    });

    const returnSumMap = new Map<string, number>();
    for (const ret of userReturns) {
      const uid = ret.user.toString();
      returnSumMap.set(uid, (returnSumMap.get(uid) || 0) + (ret.amount || 0));
    }

    // 6. Map to Investor response format
    const topInvestors: InvestorResponse[] = topCandidates.map((item, index) => {
      const rank = index + 1;
      const displayName = formatDisplayName(item.user.fullName, item.user.email);
      const email = item.user.email;
      const location = item.user.country?.trim() || "Verified Global Member";
      const totalAmount = item.effectiveAmount;

      // Calculate ROI
      const totalProfit = returnSumMap.get(item.user._id.toString()) || 0;
      let roiString: string;
      if (totalProfit > 0 && totalAmount > 0) {
        const computedRoi = ((totalProfit / totalAmount) * 100).toFixed(1);
        roiString = `+${computedRoi}%`;
      } else {
        // Realistic benchmark baseline based on rank & investment size
        const baseline = 110 + (topCandidates.length - index) * 14.5;
        roiString = `+${baseline.toFixed(1)}%`;
      }

      const planName = item.depData?.plans?.[0];
      const specialty = planName
        ? `${planName} & Strategic Compounding`
        : SPECIALTIES[index % SPECIALTIES.length];

      return {
        id: item.user._id.toString(),
        rank,
        name: displayName,
        role: ROLES[index % ROLES.length],
        location,
        email,
        portfolio: `$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}+`,
        portfolioRaw: totalAmount,
        roi: roiString,
        specialty,
        bio: BIOS[index % BIOS.length],
        status: STATUSES[index % STATUSES.length],
        initials: getInitials(displayName, email),
        avatarGradient: GRADIENTS[index % GRADIENTS.length],
      };
    });

    return NextResponse.json({
      success: true,
      data: topInvestors,
      total: topInvestors.length,
      isFallback: false,
    });
  } catch (error: any) {
    console.error("Top Investors API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch top investors",
        data: [],
      },
      { status: 500 }
    );
  }
}

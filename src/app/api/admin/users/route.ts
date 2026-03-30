import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Deposit from "@/models/deposit";
import Withdrawal from "@/models/withdrawal";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Ensure models are registered for safe relations
    Deposit.init();
    Withdrawal.init();
    
    const users = await User.aggregate([
      {
        $lookup: {
          from: "deposits",
          localField: "_id",
          foreignField: "user",
          as: "deposits"
        }
      },
      {
        $lookup: {
          from: "withdrawals",
          localField: "_id",
          foreignField: "user",
          as: "withdrawals"
        }
      },
      {
        $addFields: {
          totalDeposits: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$deposits",
                    as: "dep",
                    cond: { $eq: ["$$dep.status", "active"] }
                  }
                },
                as: "activeDep",
                in: "$$activeDep.amount"
              }
            }
          },
          totalWithdrawals: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$withdrawals",
                    as: "withd",
                    cond: { $eq: ["$$withd.status", "approved"] }
                  }
                },
                as: "appWithd",
                in: "$$appWithd.amount"
              }
            }
          }
        }
      },
      {
        $project: {
          deposits: 0,
          withdrawals: 0,
          password: 0,
          __v: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

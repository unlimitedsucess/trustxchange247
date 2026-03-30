import mongoose, { Schema, model, models } from "mongoose";

export interface IWithdrawal {
  user: mongoose.Types.ObjectId;
  amount: number;
  walletAddress: string;
  currency: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    walletAddress: { type: String, required: true },
    currency: { type: String, required: true, default: "USDT" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const Withdrawal = models.Withdrawal || model<IWithdrawal>("Withdrawal", withdrawalSchema);
export default Withdrawal;

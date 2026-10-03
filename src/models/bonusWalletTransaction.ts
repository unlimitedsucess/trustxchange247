import mongoose, { Schema, model, models } from "mongoose";

export interface IBonusWalletTransaction {
  user: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  reason?: string;
  createdAt?: Date;
}

const bonusWalletTransactionSchema = new Schema<IBonusWalletTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

const BonusWalletTransaction =
  models.BonusWalletTransaction ||
  model<IBonusWalletTransaction>("BonusWalletTransaction", bonusWalletTransactionSchema);

export default BonusWalletTransaction;

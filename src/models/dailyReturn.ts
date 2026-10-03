import mongoose, { Schema, model, models } from "mongoose";

export interface IDailyReturn {
  user: mongoose.Types.ObjectId;
  investment?: mongoose.Types.ObjectId; // tied to specific deposit/investment
  amount: number;
  day: string; // label like "Monday ROI" or "Welcome Bonus"
  date: Date;
  type: "interest" | "bonus";
  source?: "investment" | "bonus-wallet";
  dateKey?: string;
  createdAt?: Date;
}

const dailyReturnSchema = new Schema<IDailyReturn>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    investment: { type: Schema.Types.ObjectId, ref: "Deposit" },
    amount: { type: Number, required: true },
    day: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["interest", "bonus"], default: "interest" },
    source: { type: String, enum: ["investment", "bonus-wallet"], default: "investment" },
    dateKey: { type: String },
  },
  { timestamps: true }
);

dailyReturnSchema.index(
  { user: 1, source: 1, dateKey: 1 },
  { unique: true, partialFilterExpression: { source: "bonus-wallet", dateKey: { $type: "string" } } }
);

const DailyReturn = models.DailyReturn || model<IDailyReturn>("DailyReturn", dailyReturnSchema);
export default DailyReturn;

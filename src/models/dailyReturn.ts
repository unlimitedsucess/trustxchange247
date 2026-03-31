import mongoose, { Schema, model, models } from "mongoose";

export interface IDailyReturn {
  user: mongoose.Types.ObjectId;
  amount: number;
  day: string; // label like "Monday" or "Bonus Reward"
  date: Date;   // actual calendar date
  createdAt?: Date;
}

const dailyReturnSchema = new Schema<IDailyReturn>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    day: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DailyReturn = models.DailyReturn || model<IDailyReturn>("DailyReturn", dailyReturnSchema);
export default DailyReturn;

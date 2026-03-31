import mongoose, { Schema, model, models } from "mongoose";

export interface IDailyReturn {
  user: mongoose.Types.ObjectId;
  amount: number;
  day: string; // e.g. "Monday", "2024-03-31" or just "Day 1"
  createdAt?: Date;
}

const dailyReturnSchema = new Schema<IDailyReturn>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    day: { type: String, required: true },
  },
  { timestamps: true }
);

const DailyReturn = models.DailyReturn || model<IDailyReturn>("DailyReturn", dailyReturnSchema);
export default DailyReturn;

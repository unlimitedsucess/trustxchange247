import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, required: true },
  wallet: { type: String, required: true },
  amount: { type: Number, required: true },
  roi: { type: Number, default: 0 }, // % ROI per interval (daily/weekly)
  currentBalance: { type: Number, default: 0 }, // invested + accrued ROI
  status: { type: String, enum: ["pending", "active", "paused", "completed", "rejected"], default: "pending" },
  bonus: { type: Number, default: 0 },
  startDate: { type: Date }, // when admin approves
  endDate: { type: Date },   // empty until approved
}, { timestamps: true });

export default mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);

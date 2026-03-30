import mongoose, { Schema, model, models } from "mongoose";

export interface IInvestmentPlan {
  name: string;             // e.g. "Basic Plan"
  minInvestment: number;    // e.g. 100
  maxInvestment: number;    // e.g. 5000
  dailyRoi: number;         // e.g. 0.5 (percent)
  monthlyRoi: number;       // e.g. 12 (percent)
  durationDays: number;     // e.g. 30 (days)
  isActive: boolean;        // allow admin to disable plans
  createdAt?: Date;
  updatedAt?: Date;
}

const investmentPlanSchema = new Schema<IInvestmentPlan>(
  {
    name: { type: String, required: true },
    minInvestment: { type: Number, required: true },
    maxInvestment: { type: Number, required: true },
    dailyRoi: { type: Number, required: true },
    monthlyRoi: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const InvestmentPlan = models.InvestmentPlan || model<IInvestmentPlan>("InvestmentPlan", investmentPlanSchema);
export default InvestmentPlan;

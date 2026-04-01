import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  fullName?: string;
  email: string;
  password?: string;
  country?: string;
  idDocument?: string;
  selfieDocument?: string;
  kycStatus: "unverified" | "pending" | "verified" | "rejected";
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  transactionPin?: string;
  totalBonus: number;
  status: "active" | "suspended";
  suspensionReason?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  country: { type: String },
  idDocument: { type: String },
  selfieDocument: { type: String },
  kycStatus: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified" },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  transactionPin: { type: String },
  totalBonus: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  suspensionReason: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = models.User || model<IUser>("User", userSchema);
export default User;

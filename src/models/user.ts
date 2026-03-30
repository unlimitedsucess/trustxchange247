import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  fullName?: string;
  email: string;
  password?: string;
  country?: string;
  idDocument?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  transactionPin?: string;
  createdAt?: Date;
}

const userSchema = new Schema<IUser>({
  // fullName, password, and country are now optional at creation to allow multi-step registration
  fullName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  country: { type: String },
  idDocument: { type: String }, // e.g., National ID or Passport Number
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  transactionPin: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model<IUser>("User", userSchema);
export default User;

import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

/* ===========================
   Admin Document Interface
=========================== */
export interface AdminDocument extends mongoose.Document {
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* ===========================
   Admin Schema
=========================== */
const adminSchema = new Schema<AdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: true, // keep selectable for login
    },
  },
  { timestamps: true }
);

/* ===========================
   Pre-save Hook (Password Hash)
   ✔ Mongoose v7 safe
   ✔ TypeScript safe
=========================== */
adminSchema.pre("save", async function () {
  const admin = this as AdminDocument;

  if (!admin.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
});

/* ===========================
   Compare Password Method
=========================== */
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ===========================
   Model Export (Hot Reload Safe)
=========================== */
const Admin: Model<AdminDocument> =
  mongoose.models.Admin || mongoose.model<AdminDocument>("Admin", adminSchema);

export default Admin;

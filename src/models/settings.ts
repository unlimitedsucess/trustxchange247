import mongoose, { Schema, model, models } from "mongoose";

export interface ISettings {
  btcWallet: string;
  ethWallet: string;
  usdtWalletTRC20: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    btcWallet: { type: String, default: "bc1qmcyk7ak9f4dcvc9ynkhdqawkmazu4fqzmk0rma" },
    ethWallet: { type: String, default: "0x4c5eecE2966A60DCd79B3182cDe82b5C9420B48E" },
    usdtWalletTRC20: { type: String, default: "TEBYYX38FSLK39QwnccgR9tUcHU2bupHuY" },
  },
  { timestamps: true }
);

const Settings = models.Settings || model<ISettings>("Settings", settingsSchema);
export default Settings;

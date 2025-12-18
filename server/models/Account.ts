import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    balance: { type: Number, default: 0 },
    monthlyContribution: { type: Number, default: 0 },
    currency: { type: String, default: "KES" },
    type: { type: String, default: "Savings" },
    status: { type: String, enum: ["active", "inactive", "closed"], default: "active" },
    lastTransaction: { type: String },
  },
  { timestamps: true }
);

export const Account = mongoose.model("Account", accountSchema);

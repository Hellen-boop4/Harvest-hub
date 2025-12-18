import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    period: { type: String, required: true }, // e.g. "2025-11"
    totalMilkQuantity: { type: Number, default: 0 },
    totalMilkAmount: { type: Number, default: 0 },
    totalLoanDeductions: { type: Number, default: 0 },
    totalContributions: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    lines: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const Payout = mongoose.model("Payout", payoutSchema);

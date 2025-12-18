import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    loanNo: { type: String, unique: true, sparse: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    loanType: { type: String, enum: ["Emergency", "Term", "Seasonal", "Agricultural", "General"], required: true, default: "Term" },
    repaymentMode: { type: String, required: false, default: "" },
    repaymentStartDate: { type: Date, required: false },
    repaymentAmountOverride: { type: Number, required: false },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: false, default: 0 },
    termMonths: { type: Number, required: false, default: 0 },
    charges: [
      {
        chargeCode: String,
        description: String,
        chargeType: { type: String, enum: ["Fixed", "Percentage"], default: "Fixed" },
        amount: { type: Number, default: 0 },
      }
    ],
    totalCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    netDisbursed: { type: Number, default: 0 },
    status: { type: String, enum: ["applied", "disbursed", "repaid", "overdue"], default: "applied" },
    disbursedAt: { type: Date, default: Date.now },
    repaidAmount: { type: Number, default: 0 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: { type: Date },
  },
  { timestamps: true }
);

export const Loan = mongoose.model("Loan", loanSchema);

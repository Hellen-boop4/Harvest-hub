import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    productType: { type: String, enum: ["Savings", "Credit"], required: true },
    productClass: { type: String },
    productCategory: { type: String },
    accountSuffix: { type: String },
    defaultBankAccount: { type: String },
    priority: { type: Number, default: 0 },
    expectedContribution: { type: Number, default: 0 },
    monthlyContribution: { type: Number, default: 0 },
    minimumContribution: { type: Number, default: 0 },
    productPostingGroup: { type: String },
    productCategoryName: { type: String },
    autoOpenAccount: { type: Boolean, default: false },
    // Loan-specific fields
    minLoanAmount: { type: Number, default: 0 },
    maxLoanAmount: { type: Number, default: 0 },
    defaultInterestRate: { type: Number, default: 0 },
    defaultTermMonths: { type: Number, default: 12 },
    loanCharges: [
      {
        chargeCode: { type: String, required: true },
        description: { type: String, required: true },
        chargeType: { type: String, enum: ["Fixed", "Percentage"], default: "Fixed" },
        amount: { type: Number, default: 0 },
      }
    ],
    settings: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

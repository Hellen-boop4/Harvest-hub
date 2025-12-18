import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    type: { type: String, enum: ["welcome", "milk_collected", "payout_processed", "loan_issued", "info"], default: "info" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} }, // store extra data like payout amount, milk quantity, etc.
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);

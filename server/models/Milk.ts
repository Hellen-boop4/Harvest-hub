import mongoose from "mongoose";

const milkSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    quantity: { type: Number, required: true }, // liters
    amount: { type: Number, required: false, default: 0 }, // monetary collection
    fat: { type: Number, required: false, default: 0 },
    snf: { type: Number, required: false, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Milk = mongoose.model("Milk", milkSchema);

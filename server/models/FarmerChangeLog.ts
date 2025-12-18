import mongoose from "mongoose";

const farmerChangeLogSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    field: { type: String, required: true }, // e.g., "firstName", "phone", "status"
    oldValue: { type: mongoose.Schema.Types.Mixed }, // Can be string, number, etc.
    newValue: { type: mongoose.Schema.Types.Mixed },
    description: { type: String }, // Human-readable description of the change
    metadata: { type: Object, default: {} }, // Additional context
  },
  { timestamps: true }
);

farmerChangeLogSchema.index({ farmer: 1, createdAt: -1 });
farmerChangeLogSchema.index({ changedBy: 1 });

export const FarmerChangeLog = mongoose.model("FarmerChangeLog", farmerChangeLogSchema);

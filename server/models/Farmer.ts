import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    farmerCode: {
      type: String,
      unique: true,
      sparse: true, // prevents duplicate null errors
    },

    memberNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      default: "",
    },
    surname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    idNumber: {
      type: String,
      required: true,
      unique: true,
    },
    idType: {
      type: String,
      default: "National ID",
    },
    city: {
      type: String,
    },
    county: {
      type: String,
    },
    address: {
      type: String,
    },
    dob: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    maritalStatus: {
      type: String,
    },
    kraPIN: {
      type: String,
    },
    // Next-of-kin fields
    nokName: { type: String },
    nokRelationship: { type: String },
    nokPhone: { type: String },
    nokEmail: { type: String },
    // Photo and signature file paths
    photoPath: { type: String },
    signaturePath: { type: String },
    employerName: {
      type: String,
    },
    employerCode: {
      type: String,
    },
    payrollStaffNo: {
      type: String,
    },
    memberCategory: {
      type: String,
      default: "Member",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    capturedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    capturedAt: { type: Date },
  },
  { timestamps: true }
);

// 🔥 AUTO-GENERATE FARMER CODE 
farmerSchema.pre("save", async function (next) {
  if (this.farmerCode) return next();

  const lastFarmer = await mongoose
    .model("Farmer")
    .findOne({ farmerCode: { $ne: null } })
    .sort({ _id: -1 });

  let newCode = 1;

  if (lastFarmer?.farmerCode) {
    const num = parseInt(lastFarmer.farmerCode.replace("F", ""));
    newCode = num + 1;
  }

  this.farmerCode = "F" + newCode.toString().padStart(4, "0");

  next();
});

export const Farmer = mongoose.model("Farmer", farmerSchema);

import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export const Farmer = mongoose.model("Farmer", farmerSchema);

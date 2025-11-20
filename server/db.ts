import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/milkmanager";

export async function connectDB() {
  try {
    console.log(`Attempting to connect to MongoDB: ${MONGODB_URI.split('@')[0]}***`);
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✓ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error: any) {
    console.error("✗ MongoDB connection failed:", error.message || error);
    throw error;
  }
}

export default mongoose;

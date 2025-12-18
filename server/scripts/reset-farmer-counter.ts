import { connectDB } from "../db";
import { Counter } from "../models/Counter";

async function run() {
  try {
    await connectDB();
    console.log('Resetting farmer_memberNo counter to 0...');
    const doc = await Counter.findOneAndUpdate(
      { _id: 'farmer_memberNo' },
      { $set: { seq: 0 } },
      { new: true, upsert: true }
    );
    console.log('Counter updated:', doc);
    process.exit(0);
  } catch (err: any) {
    console.error('Failed to reset counter:', err);
    process.exit(2);
  }
}

run();

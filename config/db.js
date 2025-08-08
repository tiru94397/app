import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not set in .env");
    }
    await mongoose.connect(process.env.MONGO_URI, {
      // mongoose 7+ doesn't need useNewUrlParser/useUnifiedTopology
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err.message);
    // Do not exit automatically in dev — comment out to allow frontend tweaks
    // process.exit(1);
  }
};

export default connectDB;

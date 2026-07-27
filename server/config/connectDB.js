import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log("Database Connected");
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
};

export default connectDB;

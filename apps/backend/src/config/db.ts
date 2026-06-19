import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI variable is undefined");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`🚀 MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error trying to connect MongoDB: ${(error as Error).message}`);
    process.exit(1); // Stop the app if the connection fails
  }
};

export default connectDB;

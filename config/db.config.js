import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    // console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;

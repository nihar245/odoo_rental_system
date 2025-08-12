import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`);
    console.log(`\n MongoDB connected !! DB Host ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1);
  }
}

export default connectDB
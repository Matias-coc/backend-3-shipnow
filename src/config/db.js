import mongoose from "mongoose";
import { config } from "./env.config.js";

const connectDB = async () => {
  
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB conectado");
};

export default connectDB;

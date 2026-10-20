import logger from "../config/logger.js";
import mongoose from "mongoose";
import { config } from "./env.config.js";

const connectDB = async () => {
  
  await mongoose.connect(config.mongoUri);
  logger.info("MongoDB conectado");
};

export default connectDB;

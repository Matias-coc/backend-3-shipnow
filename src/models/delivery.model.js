import mongoose from "mongoose";
import { DRIVER_STATUS, PRIORITY_LEVELS } from "../constants/index.js";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DRIVER_STATUS),
      default: DRIVER_STATUS.ASSIGNED,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY_LEVELS),
      default: PRIORITY_LEVELS.NORMAL,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const DeliveryModel = mongoose.model("Delivery", deliverySchema);

export default DeliveryModel;

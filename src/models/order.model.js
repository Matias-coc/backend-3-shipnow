import mongoose from "mongoose";
import { ORDER_STATUS, PRIORITY_LEVELS } from "../constants/index.js";

const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY_LEVELS),
      default: PRIORITY_LEVELS.NORMAL
    },
    proof: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;

import mongoose from "mongoose";
import { USER_ROLES, USER_DOCUMENT_TYPES } from "../constants/index.js";

// Metadatos de cada archivo asociado al usuario (el archivo vive en el servidor, no en MongoDB)
const documentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, enum: [...USER_DOCUMENT_TYPES], required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER
    },
    documents: {
      type: [documentSchema],
      default: []
    },
    isAvailable: {
    type: Boolean,
    default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;

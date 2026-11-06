import mongoose from "mongoose";
const { Schema, model } = mongoose;
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name, required: true });
const user = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    city: { type: String, maxlength: 80, default: "" },
    phone: { type: String, maxlength: 20, default: "" },
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    otpSent: Date,
  },
  { timestamps: true },
);
export const User = model("User", user);
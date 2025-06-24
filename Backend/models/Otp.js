import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  purpose: String, // 'register' or 'login'
  expiresAt: Date,
});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;

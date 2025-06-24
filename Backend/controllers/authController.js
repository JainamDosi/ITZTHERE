import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Otp from "../models/Otp.js";
import Company from "../models/Company.model.js";
import { sendOtpEmail } from "../utils/sendOtp.js";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";

export const requestRegisterOtp = async (req, res) => {
  const { email } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  await Otp.deleteMany({ email, purpose: "register" });

  await new Otp({
    email,
    otp,
    purpose: "register",
    expiresAt: Date.now() + 5 * 60 * 1000,
  }).save();
  await sendOtpEmail(email, otp, "register");
  console.log(`OTP for ${email}: ${otp}`);

  res.json({ message: "OTP sent to email" });
};

export const verifyRegisterAndCreateUser = async (req, res) => {
  const {
    username,
    email,
    password,
    otp,
    userType,
    companyName,
    gstin,
    phone,
  } = req.body;

  const existingOtp = await Otp.findOne({ email, otp, purpose: "register" });
  if (!existingOtp || existingOtp.expiresAt < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;

  if (userType === "company") {
    const companyDoc = req.files?.companyDoc?.[0];
    if (!companyName || !gstin || !companyDoc)
      return res.status(400).json({ error: "Missing company info" });

    user = await User.create({
      name: username,
      email,
      passwordHash,
      role: "company-admin",
      phone,
      isVerified: true,
    });

    const company = await Company.create({
      name: companyName,
      gstin,
      admin: user._id,
      verificationDocs: [companyDoc.path],
    });

    user.companyId = company._id;
    await user.save();
  } else {
    const identityDoc = req.files?.identityDoc?.[0];
    if (!identityDoc)
      return res.status(400).json({ error: "Missing identity document" });

    user = await User.create({
      name: username,
      email,
      passwordHash,
      role: "Individual",
      identityDocUrl: identityDoc.path,
      isVerified: true,
    });
  }

  await Otp.deleteMany({ email, purpose: "register" });
  res.json({ message: "User registered successfully" });
};

// 2FA Login
export const loginPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const otp = otpGenerator.generate(6, { digits: true });
  await Otp.deleteMany({ email, purpose: "login" });
  await new Otp({
    email,
    otp,
    purpose: "login",
    expiresAt: Date.now() + 5 * 60 * 1000,
  }).save();
  await sendOtpEmail(email, otp, "login");

  res.json({ message: "OTP sent to email for 2FA" });
};

export const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;
  const found = await Otp.findOne({ email, otp, purpose: "login" });
  if (!found || found.expiresAt < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  await Otp.deleteMany({ email, purpose: "login" });
  const user = await User.findOne({ email });

  const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1d" });
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
};

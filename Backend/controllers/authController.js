import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Otp from "../models/Otp.js";
import Company from "../models/Company.model.js";
import { sendOtpEmail } from "../utils/sendOtp.js";
import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";

export const requestRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await Otp.findOneAndUpdate(
      { email, purpose: "register" },
      {
        email,
        otp,
        purpose: "register",
        expiresAt: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp, "register");
    console.log(`[OTP] Sent to ${email}: ${otp}`);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("[ERROR] OTP request failed:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyRegisterAndCreateUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      otp,
      userType,
      companyName,
      gstin,
      phone,
      plan,
    } = req.body;

    console.log("[VERIFY] Verifying OTP for:", email);

    const existingOtp = await Otp.findOne({ email, otp, purpose: "register" });
    if (!existingOtp || existingOtp.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let user;

    if (userType === "company") {
      const companyDoc = req.files?.companyDoc?.[0];
      if (!companyName || !gstin || !companyDoc) {
        return res
          .status(400)
          .json({ error: "Missing company information or document" });
      }
      console.log("[UPLOAD] Uploading company doc...");
      const { publicUrl } = await uploadToSupabase(companyDoc);

      console.log("[COMPANY] Creating company...");
      const company = await Company.create({
        name: companyName,
        gstin,
        verificationDocs: [publicUrl],
        storagePlan: plan,
      });

      console.log("[USER] Creating company-admin user...");
      user = await User.create({
        name: username,
        email,
        passwordHash,
        role: "company-admin",
        phone,
        isVerified: true,
        plan,
        companyId: company._id, // ✅ add it during creation
      });

      // ✅ Set company.admin after user is created (optional)
      company.admin = user._id;
      await company.save();
    } else {
      const identityDoc = req.files?.identityDoc?.[0];
      if (!identityDoc) {
        return res.status(400).json({ error: "Missing identity document" });
      }

      console.log("[UPLOAD] Uploading identity doc...");
      const { publicUrl: docUrl } = await uploadToSupabase(identityDoc);
      console.log(docUrl);

      console.log("[USER] Creating individual user...");
      user = await User.create({
        name: username,
        email,
        passwordHash,
        role: "Individual",
        verificationDoc: docUrl,
        plan,
      });
    }

    await Otp.deleteMany({ email, purpose: "register" });
    console.log("[SUCCESS] User registered:", email);
    res.json({ data: user, message: "User registered successfully" });
  } catch (err) {
    console.error("[ERROR] Registration failed:", err);
    res.status(500).json({ error: "Something went wrong during registration" });
  }
};

export const loginPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    await Otp.findOneAndUpdate(
      { email, purpose: "login" },
      {
        email,
        otp,
        purpose: "login",
        expiresAt: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp, "login");
    res.json({ message: "OTP sent to email for 2FA" });
  } catch (err) {
    console.error("[ERROR] Login failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const found = await Otp.findOne({ email, otp, purpose: "login" });
    if (!found || found.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({ email, purpose: "login" });
    const user = await User.findOne({ email });

    const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "lax", // or 'strict'
      // Adjust this if needed
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.companyId ? user.companyId.toString() : null,
      },
    });
  } catch (err) {
    console.error("[ERROR] OTP verification failed:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

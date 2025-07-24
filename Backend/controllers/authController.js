import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Otp from "../models/Otp.js";
import Company from "../models/Company.model.js";
import { sendOtpEmail } from "../utils/sendOtp.js";
import otpGenerator from "otp-generator";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";
import jwt from "jsonwebtoken";
import File from "../models/File.model.js";

export const requestRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({
        error: "Email already exists",
        allowedRole: existing.allowedRoles,
        Id: existing._id, // only this
      });

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
      billingCycle, // ✅ added here
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
      if (!companyName || !gstin || !companyDoc || !billingCycle) {
        return res.status(400).json({
          error: "Missing company information, document, or billing cycle",
        });
      }

      console.log("[UPLOAD] Uploading company doc...");
      const { path: docPath } = await uploadToSupabase(companyDoc);

      console.log("[COMPANY] Creating company...");
      const company = await Company.create({
        name: companyName,
        gstin,
        verificationDocs: [docPath],
        storagePlan: plan,
        billingCycle, // ✅ store in company
      });

      console.log("[USER] Creating company-admin user...");
      user = await User.create({
        name: username,
        email,
        passwordHash,
        phone,
        isVerified: true,
        plan,
        billingCycle, // ✅ store in user
        companyId: company._id,
        role: "company-admin",
        allowedRoles: ["company-admin"],
      });

      company.admin = user._id;
      await company.save();
    } else {
      const identityDoc = req.files?.identityDoc?.[0];
      if (!identityDoc || !billingCycle) {
        return res
          .status(400)
          .json({ error: "Missing identity document or billing cycle" });
      }

      console.log("[UPLOAD] Uploading identity doc...");
      const { path: docPath } = await uploadToSupabase(identityDoc);

      console.log("[USER] Creating individual user...");
      user = await User.create({
        name: username,
        email,
        passwordHash,
        plan,
        billingCycle, // ✅ store in user
        role: "individual",
        allowedRoles: ["individual"],
        verificationDoc: docPath,
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

    // Find user and populate company if applicable
    const user = await User.findOne({ email }).populate("companyId"); // <-- Make sure the field is "companyId"

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ Status-based checks before sending OTP
    if (user.role === "individual") {
      if (user.status === "pending") {
        return res
          .status(403)
          .json({ error: "Your request is pending approval." });
      } else if (user.status === "rejected") {
        return res
          .status(403)
          .json({ error: "Your request has been rejected." });
      }
    } else if (user.role !== "super-admin") {
      const companyStatus = user.companyId?.status;
      if (companyStatus === "pending") {
        return res
          .status(403)
          .json({ error: "Your company is pending approval." });
      } else if (companyStatus === "rejected") {
        return res
          .status(403)
          .json({ error: "Your company has been rejected." });
      }
    }

    // ✅ Generate and store OTP
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
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
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
        allowedRoles: user.allowedRoles,
        company: user.companyId ? user.companyId.toString() : null,
      },
    });
  } catch (err) {
    console.error("[ERROR] OTP verification failed:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

export const Userinfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("Token from cookie:", token);
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, "secret");
    // You may want to move this logic to a controller or middleware
    const { default: User } = await import("../models/User.model.js");
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ user });
  } catch (error) {
    console.error("Update profile failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const TransferAdminOwnership = async (req, res) => {
  try {
    const currentAdmin = req.user;
    const { newOwnerId } = req.body;

    if (currentAdmin.role !== "company-admin") {
      return res
        .status(403)
        .json({ message: "Only company admins can transfer ownership" });
    }

    const newOwner = await User.findById(newOwnerId);
    if (
      !newOwner ||
      newOwner.role !== "employee" ||
      newOwner.companyId.toString() !== currentAdmin.companyId.toString()
    ) {
      return res.status(400).json({ message: "Invalid employee selected" });
    }

    // Demote current admin to employee
    currentAdmin.role = "employee";
    await currentAdmin.save();

    // Promote selected employee to admin
    newOwner.role = "company-admin";
    await newOwner.save();

    res.json({ message: "Ownership transferred successfully" });
  } catch (error) {
    console.error("Ownership transfer failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/authController.js

export const setUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role)
      return res.status(400).json({ message: "userId and role are required" });

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: "This role is not allowed for this user." });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({ message: "Role updated successfully", role });
  } catch (error) {
    console.error("Error setting role:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const upgradeUserAndPlan = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { selectedPlan, billingCycle, companyName, gstin } = req.body;

    if (!selectedPlan || !billingCycle) {
      return res
        .status(400)
        .json({ error: "Missing selected plan or billing cycle" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let newRole = "";
    if (selectedPlan === "individual") {
      newRole = "individual";
    } else if (["business", "business-plus"].includes(selectedPlan)) {
      newRole = "company-admin";
    } else {
      return res.status(400).json({ error: "Invalid selected plan" });
    }

    const fileKey =
      newRole === "company-admin" ? "verificationDoc" : "verificationDoc";
    const uploadedFile = req.files?.[fileKey]?.[0];

    if (!uploadedFile) {
      return res
        .status(400)
        .json({ error: "Verification document is required" });
    }

    const { path: docPath } = await uploadToSupabase(uploadedFile);

    // Update user allowed roles
    if (!user.allowedRoles.includes(newRole)) {
      user.allowedRoles.push(newRole);
    }

    // Update plan
    user.plan = selectedPlan;

    if (newRole === "individual") {
      user.verificationDoc = docPath;
      user.billingCycle = billingCycle;
      user.status = "pending"; // default to pending for review
    }

    if (newRole === "company-admin") {
      if (!companyName || !gstin) {
        return res
          .status(400)
          .json({ error: "Company name and GSTIN are required" });
      }

      // Prevent duplicate companies
      const existingCompany = await Company.findOne({ gstin });
      if (existingCompany) {
        return res
          .status(400)
          .json({ error: "Company with this GSTIN already exists" });
      }

      const newCompany = await Company.create({
        name: companyName,
        gstin,
        storagePlan: selectedPlan,
        billingCycle,
        verificationDocs: [docPath],
        admin: user._id,
      });

      user.companyId = newCompany._id;
    }

    await user.save();

    res.json({
      success: true,
      message: "Plan upgraded successfully. Awaiting verification.",
      data: {
        id: user._id,
        role: newRole,
        allowedRoles: user.allowedRoles,
        companyId: user.companyId || null,
      },
    });
  } catch (err) {
    console.error("[UPGRADE ERROR]", err);
    res.status(500).json({ error: "Server error during plan upgrade" });
  }
};

function calculateMembershipLeft(billingCycle, approvedAt) {
  const now = new Date();
  const approvedDate = new Date(approvedAt);
  let expiryDate;

  if (billingCycle === "yearly") {
    expiryDate = new Date(
      approvedDate.setFullYear(approvedDate.getFullYear() + 1)
    );
  } else {
    expiryDate = new Date(approvedDate.setMonth(approvedDate.getMonth() + 1));
  }

  const daysLeft = Math.max(
    Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)),
    0
  );
  return {
    membershipLeft:
      billingCycle === "yearly"
        ? `${Math.floor(daysLeft / 30)} months of membership left`
        : `${daysLeft} days of membership left`,
    membershipDays: daysLeft,
  };
}

// routes/auth.js or similar
export const PlanExpiry = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("companyId");
    if (!user) return res.status(404).json({ message: "User not found" });

    let billingCycle, approvedAt;

    if (user.role === "company-admin" && user.companyId) {
      billingCycle = user.companyId.billingCycle;
      approvedAt = user.companyId.approvedAt;
    } else if (user.role === "individual") {
      billingCycle = user.billingCycle;
      approvedAt = user.approvedAt;
    } else {
      return res.status(400).json({ message: "Unsupported role" });
    }

    const { membershipLeft, membershipDays } = calculateMembershipLeft(
      billingCycle,
      approvedAt
    );
    console.log(
      `[PLAN EXPIRY] User ${user._id} has ${membershipLeft} (${membershipDays} days left)`
    );
    return res.json({
      membershipDays,
    });
  } catch (err) {
    console.error("[MEMBERSHIP ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

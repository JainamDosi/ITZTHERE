import express from "express";
import {
  requestRegisterOtp,
  verifyRegisterAndCreateUser,
  loginPassword,
  verifyLoginOtp,
} from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import File from "../models/File.model.js";
import multer from "multer";
import { protect } from "../middleware/protect.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/register/send-otp", requestRegisterOtp);
router.post(
  "/register/verify",
  upload.fields([
    { name: "companyDoc", maxCount: 1 },
    { name: "identityDoc", maxCount: 1 },
  ]),
  verifyRegisterAndCreateUser
);

router.post("/login/password", loginPassword); // step 1
router.post("/login/verify", verifyLoginOtp); // step 2

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("Token from cookie:", token);
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, "secret");
    // You may want to move this logic to a controller or middleware
    const { default: User } = await import("../models/User.model.js");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
});

router.patch("/update-profile", protect, async (req, res) => {
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
});

router.post("/transfer-ownership", protect, async (req, res) => {
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
});

router.get("/stats", protect, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const [totalFiles, totalUsers] = await Promise.all([
      File.countDocuments({ companyId: companyId }),
      User.countDocuments({ companyId }),
    ]);

    // Replace with real storage calculation
    const usedStorageMB = await File.aggregate([
      { $match: { companyId: companyId } },
      { $group: { _id: null, totalSize: { $sum: "$size" } } },
    ]);

    const totalStorageMB = 1024; // Replace if you're tracking this per company
    const usedMB = usedStorageMB[0]?.totalSize / (1024 * 1024) || 0;

    res.json({
      totalFiles,
      totalUsers,
      usedStorageMB: usedMB,
      totalStorageMB,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

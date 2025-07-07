import express from "express";
import {
  requestRegisterOtp,
  verifyRegisterAndCreateUser,
  loginPassword,
  verifyLoginOtp,
  Userinfo,
  UpdateProfile,
  TransferAdminOwnership,
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

router.get("/me", Userinfo);

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
});

router.patch("/update-profile", protect, UpdateProfile);

router.post("/transfer-ownership", protect, TransferAdminOwnership);

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

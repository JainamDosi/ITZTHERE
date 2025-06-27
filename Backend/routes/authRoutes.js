import express from "express";
import {
  requestRegisterOtp,
  verifyRegisterAndCreateUser,
  loginPassword,
  verifyLoginOtp,
} from "../controllers/authController.js";

import multer from "multer";
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
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, "secret");
    // You may want to move this logic to a controller or middleware
    const { default: User } = await import("../models/User.js");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
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

export default router;

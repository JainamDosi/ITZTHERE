import express from "express";
import {
  requestRegisterOtp,
  verifyRegisterAndCreateUser,
  loginPassword,
  verifyLoginOtp,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/send-otp", requestRegisterOtp);
router.post("/register/verify", verifyRegisterAndCreateUser);

router.post("/login/password", loginPassword); // step 1
router.post("/login/verify", verifyLoginOtp); // step 2

export default router;

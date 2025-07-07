import express from "express";
import {
  createUserByCompanyAdmin,
  getUsersByCompanyAdmin,
} from "../controllers/userController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/", protect, createUserByCompanyAdmin);

router.get("/myusers", protect, getUsersByCompanyAdmin);

export default router;

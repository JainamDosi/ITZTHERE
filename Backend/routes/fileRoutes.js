import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadFile,
  getFileUrl,
  getSignedUrl,
} from "../controllers/fileController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);
router.get("/public/:filename", getFileUrl);
router.get("/signed/:filename", getSignedUrl);

export default router;

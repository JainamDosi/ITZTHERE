import express from "express";

import { protect } from "../middleware/protect.js"; // must attach req.user

import {
  CreateFolder,
  VisibleFolders,
  Folderpermissions,
  RequestableFolders,
  GetFilesInFolder,
} from "../controllers/folderController.js";
const router = express.Router();

router.get("/visible", protect, VisibleFolders);

router.post("/create", protect, CreateFolder);

router.put("/:folderId/permissions", protect, Folderpermissions);

router.get("/requestable", protect, RequestableFolders);

router.get("/:folderId/files", protect, GetFilesInFolder);

export default router;

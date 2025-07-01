import express from "express";
import Folder from "../models/Folder.model.js";
import { protect } from "../middleware/protect.js"; // must attach req.user
import AccessRequest from "../models/AccessRequest.js"; // for requestable folders
import File from "../models/File.model.js"; // for fetching files in a folder
const router = express.Router();

router.get("/visible", protect, async (req, res) => {
  const { id: userId, role, companyId } = req.user;

  try {
    let folders = [];

    if (role === "company-admin") {
      folders = await Folder.find({ companyId });
    } else if (role === "employee") {
      folders = await Folder.find({
        companyId,
        allowedUsers: userId,
      });
    } else if (role === "client") {
      folders = []; // clients don’t see folder structure
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.json({ folders });
  } catch (err) {
    console.error("Error fetching folders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/create", protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const folder = new Folder({
      name,
      companyId: req.user.companyId, // automatically injected from auth middleware
    });

    await folder.save();

    res.status(201).json({ message: "Folder created", folder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// 🔒 PUT: Set allowed users for a folder
// 🔒 PUT: Set allowed users for a folder
router.put("/:folderId/permissions", protect, async (req, res) => {
  const { folderId } = req.params;
  const { allowedUserIds } = req.body;

  if (!Array.isArray(allowedUserIds)) {
    return res.status(400).json({ message: "allowedUserIds must be an array" });
  }

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    if (folder.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const previousUserIds = folder.allowedUsers.map((id) => id.toString());
    const newUserIds = allowedUserIds.map((id) => id.toString());

    const removedUserIds = previousUserIds.filter(
      (prevId) => !newUserIds.includes(prevId)
    );
    const newlyAddedUserIds = newUserIds.filter(
      (newId) => !previousUserIds.includes(newId)
    );

    // 🧹 Clean-up for removed users
    if (removedUserIds.length > 0) {
      // Delete "Approved" or "Pending" requests
      await AccessRequest.deleteMany({
        folderId,
        userId: { $in: removedUserIds },
        status: { $in: ["Approved", "Pending"] },
      });
    }

    // 🧹 Clean-up for newly added users
    if (newlyAddedUserIds.length > 0) {
      // Delete "Rejected" or "Pending" requests
      await AccessRequest.deleteMany({
        folderId,
        userId: { $in: newlyAddedUserIds },
        status: { $in: ["Rejected", "Pending"] },
      });
    }

    // ✅ Update allowed users
    folder.allowedUsers = allowedUserIds;
    await folder.save();

    return res
      .status(200)
      .json({ message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating folder permissions:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/requestable", protect, async (req, res) => {
  const { id: userId, role, companyId } = req.user;

  if (role !== "employee") {
    return res
      .status(403)
      .json({ message: "Only employees can request access." });
  }

  try {
    // Step 1: Get all folders in the company the user doesn't already have access to
    const allFolders = await Folder.find({
      companyId,
      allowedUsers: { $ne: userId },
    });

    // Step 2: Extract folder IDs
    const allFolderIds = allFolders.map((f) => f._id.toString());

    // Step 3: Get access requests by user with Pending or Approved status
    const requests = await AccessRequest.find({
      userId,
      folderId: { $in: allFolderIds },
      status: { $in: ["Pending", "Approved"] },
    }).select("folderId");

    const requestedIds = requests.map((r) => r.folderId.toString());

    // Step 4: Only include folders not already requested or approved
    const requestableFolders = allFolders.filter(
      (folder) => !requestedIds.includes(folder._id.toString())
    );

    res.json({ folders: requestableFolders });
  } catch (err) {
    console.error("Error fetching requestable folders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:folderId/files", protect, async (req, res) => {
  const { folderId } = req.params;
  const user = req.user; // assuming you're using a middleware like passport/jwt to attach user

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    // 🔒 Check access based on role
    if (user.role === "company-admin") {
      if (String(folder.companyId) !== String(user.companyId)) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (user.role === "employee") {
      if (!folder.allowedUsers.includes(user._id)) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    const files = await File.find({ folder: folderId });
    return res.json({ files });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

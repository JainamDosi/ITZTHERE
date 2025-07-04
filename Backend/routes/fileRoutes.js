import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadFile,
  deleteFile,
  getSignedUrl,
  getFilesSharedWithMe,
  UnassignFileFromClient,
} from "../controllers/fileController.js";
import { protect } from "../middleware/protect.js";
import { fileAccessLimiter } from "../utils/rateLimiter.js";
import {
  getCompanyClients,
  shareFilesWithClients,
} from "../controllers/fileController.js";
const router = express.Router();
import File from "../models/File.model.js";
import Folder from "../models/Folder.model.js";

router.post("/upload", protect, upload.array("files"), uploadFile);
router.get("/signed-url/:fileId", protect, fileAccessLimiter, getSignedUrl);
router.get("/clients", protect, getCompanyClients);
router.put("/share", protect, shareFilesWithClients);
router.delete("/:fileId", protect, deleteFile);
router.get("/shared-with-me", protect, getFilesSharedWithMe);

router.delete("/:fileId/unassign/:clientId", protect, UnassignFileFromClient);

router.post("/:fileId/pin", protect, async (req, res) => {
  const { fileId } = req.params;
  console.log("Pinning file:", fileId);
  const userId = req.user._id;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (!file.pinnedBy.includes(userId)) {
      file.pinnedBy.push(userId);
      await file.save();
    }

    res.json({ message: "File pinned" });
  } catch (err) {
    console.log("[PIN FILE ERROR]:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:fileId/unpin", protect, async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user._id;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    file.pinnedBy = file.pinnedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    await file.save();

    res.json({ message: "File unpinned" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/pinned", protect, async (req, res) => {
  const user = req.user;
  const userId = req.user._id;

  try {
    if (user.role === "employee") {
      // Step 1: Get folder IDs where this employee is allowed
      const allowedFolders = await Folder.find({
        allowedUsers: userId,
      }).select("_id");

      const allowedFolderIds = allowedFolders.map((folder) => folder._id);

      // Step 2: Fetch pinned files only if in allowed folders
      const files = await File.find({
        pinnedBy: userId,
        folder: { $in: allowedFolderIds },
      })
        .populate("folder", "name")
        .sort({ createdAt: -1 });

      return res.json({ files });
    } else {
      // For clients or admins
      const files = await File.find({
        pinnedBy: userId,
        assignedClients: userId,
      })
        .populate("folder", "name")
        .sort({ createdAt: -1 });

      res.json({ files });
    }
  } catch (err) {
    console.error("Error fetching pinned files:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/fileRoutes.js

router.get("/section-wise-storage", protect, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const usage = await File.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: "$folder",
          totalSize: { $sum: "$size" },
        },
      },
      {
        $lookup: {
          from: "folders",
          localField: "_id",
          foreignField: "_id",
          as: "folderInfo",
        },
      },
      {
        $unwind: "$folderInfo",
      },
      {
        $project: {
          folderName: "$folderInfo.name",
          totalSizeMB: { $divide: ["$totalSize", 1024 * 1024] },
        },
      },
    ]);

    res.json({ usage });
  } catch (err) {
    console.error("Section-wise storage error:", err);
    res.status(500).json({ message: "Failed to fetch section storage" });
  }
});
router.get("/daily-uploads", protect, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const skipDays = (page - 1) * limit;

  try {
    const result = await File.aggregate([
      {
        $match: {
          companyId: req.user.companyId, // 🔒 Only this user's company files
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $skip: skipDays },
      { $limit: limit },
    ]);
    console.log("Daily uploads result:", result);

    const formatted = result.map((entry) => ({
      date: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}-${String(entry._id.day).padStart(2, "0")}`,
      uploads: entry.count,
    }));

    res.json({ data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

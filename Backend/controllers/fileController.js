import supabase from "../config/supabaseClient.js";
import File from "../models/File.model.js";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";
import User from "../models/User.model.js";
import Folder from "../models/Folder.model.js";
import { fileAccessLimiter } from "../utils/rateLimiter.js";

export const uploadFile = async (req, res) => {
  try {
    const { folderId } = req.body;
    const user = req.user;

    if (!folderId || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Missing folder or files" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const { path } = await uploadToSupabase(file);

      const dbFile = await File.create({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        uploader: user._id,
        folder: folderId,
        companyId: user.companyId,
        url: path,
        assignedClients: [],
      });

      uploadedFiles.push(dbFile);
    }

    res.status(201).json({ message: "Files uploaded", files: uploadedFiles });
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const getSignedUrl = async (req, res) => {
  const { fileId } = req.params;
  const mode = req.query.mode || "view"; // 'view' or 'download'

  try {
    const file = await File.findById(fileId)
      .populate("folder", "allowedUsers companyId")
      .populate("uploader", "_id");

    if (!file) return res.status(404).json({ error: "File not found" });

    const user = req.user;
    const isAllowed =
      user.role === "super-admin" ||
      file.uploader._id.equals(user._id) ||
      (user.role === "company-admin" &&
        String(file.companyId) === String(user.companyId)) ||
      (user.role === "employee" &&
        file.folder.allowedUsers.includes(user._id)) ||
      file.assignedClients.includes(user._id);

    if (!isAllowed) return res.status(403).json({ error: "Access denied" });

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .createSignedUrl(file.url, 60 * 5, {
        download: mode === "download",
      });

    if (error || !data?.signedUrl)
      return res.status(500).json({ error: "Failed to generate signed URL" });

    res.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error("[Signed URL Error]", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCompanyClients = async (req, res) => {
  try {
    const user = req.user;
    console.log("[GET CLIENTS] User:", user.role);

    if (user.role !== "company-admin" && user.role !== "employee") {
      return res.status(403).json({ error: "Access denied" });
    }

    const clients = await User.find({
      companyId: user.companyId,
      role: "client",
    }).select("_id name email");

    res.json({ clients });
  } catch (err) {
    console.error("[GET CLIENTS ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const shareFilesWithClients = async (req, res) => {
  const { fileIds, clientIds } = req.body;
  const user = req.user;

  if (!Array.isArray(fileIds) || !Array.isArray(clientIds)) {
    return res
      .status(400)
      .json({ error: "fileIds and clientIds must be arrays" });
  }

  try {
    const updated = await File.updateMany(
      {
        _id: { $in: fileIds },
        companyId: user.companyId,
      },
      { $addToSet: { assignedClients: { $each: clientIds } } }
    );

    res.json({ message: "Files shared successfully", updated });
  } catch (err) {
    console.error("[SHARE FILES ERROR]:", err);
    res.status(500).json({ error: "Failed to share files" });
  }
};

export const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  const user = req.user;

  try {
    const file = await File.findById(fileId).populate("folder");

    if (!file) return res.status(404).json({ error: "File not found" });

    const isOwner = file.uploader.equals(user._id);
    const isCompanyAdmin =
      user.role === "company-admin" &&
      String(user.companyId) === String(file.companyId);
    const isSuperAdmin = user.role === "super-admin";

    if (!isOwner && !isCompanyAdmin && !isSuperAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🧹 Delete from Supabase
    await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([file.url]);

    // 🗑️ Delete from DB
    await File.findByIdAndDelete(fileId);

    res.json({ message: "File deleted" });
  } catch (err) {
    console.error("[DELETE FILE ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFilesSharedWithMe = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "client") {
      return res.status(403).json({ error: "Only clients can access this" });
    }

    const files = await File.find({ assignedClients: user._id })
      .populate("folder", "name")
      .populate("companyId", "name")
      .select("_id name folder companyId");

    const grouped = {};

    files.forEach((file) => {
      const companyId = file.companyId._id.toString();
      const folderId = file.folder._id.toString();

      if (!grouped[companyId]) {
        grouped[companyId] = {
          companyId,
          companyName: file.companyId.name,
          folders: {},
        };
      }

      if (!grouped[companyId].folders[folderId]) {
        grouped[companyId].folders[folderId] = {
          folderId,
          folderName: file.folder.name,
          files: [],
        };
      }

      grouped[companyId].folders[folderId].files.push({
        fileId: file._id,
        fileName: file.name,
      });
    });

    // Convert folders object to array
    const result = Object.values(grouped).map((company) => ({
      ...company,
      folders: Object.values(company.folders),
    }));

    res.json({ shared: result });
  } catch (err) {
    console.error("[GET FILES SHARED ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const UnassignFileFromClient = async (req, res) => {
  const { fileId, clientId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Only uploader or company-admin/super-admin can unassign
    const user = req.user;
    const isOwner = file.uploader.equals(user._id);
    const isAdmin =
      user.role === "company-admin" &&
      String(user.companyId) === String(file.companyId);

    const isEmployee = user.role === "employee";

    if (!isOwner && !isAdmin && !isEmployee) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    file.assignedClients = file.assignedClients.filter(
      (id) => id.toString() !== clientId
    );
    await file.save();

    res.json({ message: "Client unassigned successfully" });
  } catch (err) {
    console.error("[UNASSIGN ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const PinFile = async (req, res) => {
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
};

export const UnpinFile = async (req, res) => {
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
};

export const GetPinnedFiles = async (req, res) => {
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
};

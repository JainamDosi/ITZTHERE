import Folder from "../models/Folder.js";
import AccessRequest from "../models/AccessRequest.js"; // for requestable folders
import File from "../models/File.model.js"; // for fetching files in a folder

export const VisibleFolders = async (req, res) => {
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
};

export const CreateFolder = async (req, res) => {
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
};

export const Folderpermissions = async (req, res) => {
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
};

export const RequestableFolders = async (req, res) => {
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
};

export const GetFilesInFolder = async (req, res) => {
  const { folderId } = req.params;
  const { page = 1, limit = 100 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const user = req.user;

    const isCompanyAdmin =
      user.role === "company-admin" &&
      String(folder.companyId) === String(user.companyId);

    const isEmployee =
      user.role === "employee" &&
      folder.allowedUsers.some((id) => String(id) === String(user._id));

    const isClient = user.role === "client";

    // 🔐 Strict check for client — deny if no assigned file in this folder
    if (isClient) {
      const hasAccess = await File.exists({
        folder: folderId,
        assignedClients: user._id,
      });

      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    // ❌ Block access if no valid role match
    if (!isCompanyAdmin && !isEmployee && !isClient) {
      return res.status(403).json({ error: "Access denied" });
    }

    // ✅ Build filtered file query
    const fileFilter = { folder: folderId };
    if (isClient) {
      fileFilter.assignedClients = user._id;
    }

    const total = await File.countDocuments(fileFilter);

    const files = await File.find(fileFilter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("assignedClients", "name email") // ✅ So frontend sees client names
      .select("_id name size type createdAt assignedClients"); // ✅ Must include assignedClients

    res.json({
      files,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[FOLDER FILES ERROR]:", err);
    res.status(500).json({ error: "Server error" });
  }
};

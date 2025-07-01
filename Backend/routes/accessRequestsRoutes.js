import express from "express";
import AccessRequest from "../models/AccessRequest.js";
import Folder from "../models/Folder.model.js";
import { protect } from "../middleware/protect.js";
import mongoose from "mongoose"; // for ObjectId conversion

const router = express.Router();

// 📩 Submit new access request

router.post("/", protect, async (req, res) => {
  const { folderId } = req.body;
  const { id: userId } = req.user;

  if (!folderId) {
    return res.status(400).json({ message: "Folder ID is required." });
  }

  try {
    // Check for existing request
    const existing = await AccessRequest.findOne({ userId, folderId });

    if (existing) {
      if (existing.status === "Rejected") {
        // Optionally: Delete the old rejected one (or keep for audit)
        await existing.deleteOne();
      } else {
        return res.status(400).json({ message: "Request already sent." });
      }
    }

    const newRequest = new AccessRequest({ userId, folderId });
    await newRequest.save();

    res.status(201).json({ message: "Access request submitted." });
  } catch (err) {
    console.error("Error submitting request:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// 📄 Fetch access requests made by the user
router.get("/my", protect, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const requests = await AccessRequest.find({ userId }).populate(
      "folderId",
      "name"
    );
    res.json({ requests });
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/all", protect, async (req, res) => {
  const { role, companyId } = req.user;

  if (role !== "company-admin") {
    return res.status(403).json({ message: "Only company admins allowed." });
  }

  try {
    const requests = await AccessRequest.find({ status: "Pending" })
      .populate("userId", "name email")
      .populate("folderId", "name companyId");

    // Log just in case
    console.log("Fetched requests:", requests);

    // Convert companyId to ObjectId for accurate comparison
    const adminCompanyId = new mongoose.Types.ObjectId(companyId);

    // Filter requests belonging to the admin's company
    const filtered = requests.filter((r) => {
      return (
        r.folderId &&
        r.folderId.companyId &&
        r.folderId.companyId.toString() === adminCompanyId.toString()
      );
    });

    res.json({ requests: filtered });
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", protect, async (req, res) => {
  const { id: requestId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  const { role } = req.user;

  if (role !== "company-admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const request =
      await AccessRequest.findById(requestId).populate("folderId");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (action === "approve") {
      // ✅ Add user to folder
      const folder = await Folder.findById(request.folderId._id);
      if (!folder.allowedUsers.includes(request.userId)) {
        folder.allowedUsers.push(request.userId);
        await folder.save();
      }
      request.status = "Approved";
    } else {
      request.status = "Rejected";
    }

    await request.save();
    res.json({ message: `Request ${action}d.` });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

import express from "express";
import { protect } from "../middleware/protect.js";
import File from "../models/File.model.js";
import Company from "../models/Company.model.js";
import User from "../models/User.model.js"; // ⬅️ Import User model
import supabase from "../config/supabaseClient.js";

const router = express.Router();

router.get("/companies", protect, async (req, res) => {
  const user = req.user;

  if (user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const companies = await Company.find({ status: "approved" }).populate(
      "admin",
      "name email"
    );

    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        // 📦 File aggregation
        const aggregation = await File.aggregate([
          { $match: { companyId: company._id } },
          {
            $group: {
              _id: null,
              totalSize: { $sum: "$size" },
              totalFiles: { $sum: 1 },
            },
          },
        ]);
        const fileStats = aggregation[0] || { totalSize: 0, totalFiles: 0 };

        // 👨‍💼 Employee count: role === 'employee' and companyId === company._id
        const employeeCount = await User.countDocuments({
          role: "employee",
          companyId: company._id,
        });

        // 🤝 Client count: role === 'client' and affiliatedWith includes company._id
        const clientCount = await User.countDocuments({
          role: "client",
          affiliatedWith: company._id,
        });

        return {
          id: company._id,
          name: company.name,
          admin: company.admin?.name || "Unknown",
          plan: company.plan,
          createdAt: company.createdAt,
          docsUploaded: fileStats.totalFiles,
          storageUsed: `${(fileStats.totalSize / 1024 ** 3).toFixed(2)} GB`,
          storagePlan: company.storagePlan,
          employeeCount,
          clientCount,
        };
      })
    );

    res.status(200).json(enrichedCompanies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/company-requests", protect, async (req, res) => {
  const user = req.user;
  console.log(user.role);

  if (user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // ✅ 1. Get all pending companies
    const pendingCompanies = await Company.find({ status: "pending" })
      .populate("admin", "name email")
      .lean();

    const companyRequests = pendingCompanies.map((company) => ({
      id: company._id,
      name: company.name,
      gstin: company.gstin,
      plan: company.storagePlan,
      type: "company",
      admin: {
        name: company.admin?.name || "Unknown",
        email: company.admin?.email || "Unknown",
      },
      verificationDocs: company.verificationDocs,
      createdAt: company.createdAt,
    }));

    // ✅ 2. Get all pending individual users
    const pendingIndividuals = await User.find({
      role: "Individual",
      status: "pending",
    }).lean();

    const individualRequests = pendingIndividuals.map((user) => ({
      id: user._id,
      name: user.name,
      gstin: user.phone || "N/A", // GSTIN not applicable, using phone for display
      plan: "individual",
      type: "individual",
      admin: {
        name: user.name,
        email: user.email,
      },
      verificationDocs: user.verificationDoc ? [user.verificationDoc] : [],
      createdAt: user.createdAt,
    }));

    // ✅ Combine and sort both requests by creation time
    const allRequests = [...companyRequests, ...individualRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(allRequests);
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/signed-url/:fileId", protect, async (req, res) => {
  try {
    const { fileId } = req.params; // e.g., "verification/1751959950867-Baklava.png"
    const { mode } = req.query || "view"; // default to 'view'

    if (!fileId) {
      return res.status(400).json({ message: "Missing fileId" });
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .createSignedUrl(fileId, 60 * 5, {
        download: mode === "download",
      });

    if (error || !data?.signedUrl) {
      console.error("Supabase URL error:", error);
      return res.status(500).json({ message: "Failed to generate signed URL" });
    }

    res.json({ url: data.signedUrl });
  } catch (err) {
    console.error("Superadmin signed URL error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/company-requests/:id", protect, async (req, res) => {
  const { id } = req.params;
  const { status, type } = req.body; // optional: 'type' can be 'individual' or 'company'

  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const validStatuses = ["approved", "rejected", "pending"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    console.log("Updating request:", { id, status, type });
    // 🔍 1. If type is 'individual', update the User model
    if (type === "individual") {
      const user = await User.findById(id);
      if (!user || user.role !== "Individual") {
        return res.status(404).json({ message: "Individual user not found" });
      }
      user.status = status;
      await user.save();
      return res
        .status(200)
        .json({ message: `Individual user status updated to '${status}'` });
    }

    // 🏢 2. Otherwise update Company model
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    company.status = status;
    await company.save();

    res.status(200).json({ message: `Company status updated to '${status}'` });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/plan-summary", protect, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get company plan counts
    const companyCounts = await Company.aggregate([
      { $group: { _id: "$storagePlan", count: { $sum: 1 } } },
    ]);

    // Convert to flat object
    const companyPlanStats = {
      business: 0,
      "business-plus": 0,
    };

    companyCounts.forEach((entry) => {
      companyPlanStats[entry._id] = entry.count;
    });

    // Count individual users
    const individualCount = await User.countDocuments({ role: "Individual" });

    res.status(200).json({
      individual: individualCount,
      business: companyPlanStats["business"] || 0,
      businessPlus: companyPlanStats["business-plus"] || 0,
    });
  } catch (err) {
    console.error("Error fetching plan stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/enrollments", protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Count approved companies
    const companiesCount = await Company.countDocuments({ status: "approved" });

    // Count users by role
    const clientsCount = await User.countDocuments({ role: "client" });
    const individualsCount = await User.countDocuments({ role: "Individual" });
    const otherUsersCount = await User.countDocuments({
      role: { $nin: ["client", "Individual", "superadmin"] },
    });

    // Count total docs uploaded across all companies/users
    const docsUploadedCount = await File.countDocuments();

    return res.status(200).json({
      companies: companiesCount,
      clients: clientsCount,
      individuals: individualsCount,
      users: otherUsersCount,
      docsUploaded: docsUploadedCount, // ✅ new field
    });
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

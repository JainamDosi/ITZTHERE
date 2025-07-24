import express from "express";
import { protect } from "../middleware/protect.js";
import File from "../models/File.model.js";
import Company from "../models/Company.model.js";
import User from "../models/User.model.js"; // ⬅️ Import User model
import supabase from "../config/supabaseClient.js";

const router = express.Router();

router.get("/companies", protect, async (req, res) => {
  const user = req.user;

  if (user.role !== "super-admin") {
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

  if (user.role !== "super-admin") {
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
      role: "individual",
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

  if (req.user?.role !== "super-admin") {
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
      if (!user || user.role !== "individual") {
        return res.status(404).json({ message: "Individual user not found" });
      }

      user.status = status;

      if (status === "approved") {
        user.approvedAt = new Date(); // ⏰ Set approvedAt only when approved
      } else {
        user.approvedAt = undefined; // ❌ Clear it if not approved (optional)
      }

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
    if (status === "approved") {
      company.approvedAt = new Date(); // ⏰ Set approvedAt only when approved
    } else {
      company.approvedAt = undefined; // ❌ Clear it if not approved (optional)
    }

    await company.save();

    res.status(200).json({ message: `Company status updated to '${status}'` });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/plan-summary", protect, async (req, res) => {
  try {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const now = new Date();
    const plans = {
      individual: { total: 0, active: 0 },
      business: { total: 0, active: 0 },
      "business-plus": { total: 0, active: 0 },
    };

    // 1. INDIVIDUAL USERS (based on allowedRoles)
    const individualUsers = await User.find({
      allowedRoles: "individual",
    });

    plans.individual.total = individualUsers.length;

    individualUsers.forEach((user) => {
      if (user.status === "approved" && user.approvedAt) {
        const approvedAt = new Date(user.approvedAt);
        const expiryDate =
          user.billingCycle === "yearly"
            ? new Date(approvedAt.setFullYear(approvedAt.getFullYear() + 1))
            : new Date(approvedAt.setMonth(approvedAt.getMonth() + 1));

        if (expiryDate > now) {
          plans.individual.active += 1;
        }
      }
    });

    // 2. COMPANIES (business, business-plus)
    const companies = await Company.find({});

    companies.forEach((company) => {
      const plan = company.storagePlan; // "business" or "business-plus"
      if (!plans[plan]) return; // skip unknown plans

      plans[plan].total += 1;

      if (company.status === "approved" && company.approvedAt) {
        const approvedAt = new Date(company.approvedAt);
        const expiryDate =
          company.billingCycle === "yearly"
            ? new Date(approvedAt.setFullYear(approvedAt.getFullYear() + 1))
            : new Date(approvedAt.setMonth(approvedAt.getMonth() + 1));

        if (expiryDate > now) {
          plans[plan].active += 1;
        }
      }
    });

    res.status(200).json({ plans });
  } catch (err) {
    console.error("Error fetching plan stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/enrollments", protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "super-admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Count approved companies
    const companiesCount = await Company.countDocuments({ status: "approved" });

    // Count users with allowedRoles including 'client'
    const clientsCount = await User.countDocuments({ allowedRoles: "client" });

    // Count users with allowedRoles including 'individual'
    const individualsCount = await User.countDocuments({
      allowedRoles: "individual",
    });

    // Count users who are neither client nor individual nor super-admin
    const otherUsersCount = await User.countDocuments({
      allowedRoles: { $in: ["employee", "company-admin"] },
    });

    // Count total uploaded docs (across all users and companies)
    const docsUploadedCount = await File.countDocuments();

    return res.status(200).json({
      companies: companiesCount,
      clients: clientsCount,
      individuals: individualsCount,
      users: otherUsersCount,
      docsUploaded: docsUploadedCount,
    });
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/storage", protect, async (req, res) => {
  try {
    const [stats] = await File.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: "$size" },
          totalFiles: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalSize: stats?.totalSize || 0,
      totalFiles: stats?.totalFiles || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch storage data" });
  }
});

router.get("/clients-grouped-by-company", protect, async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $match: {
          allowedRoles: "client",
        },
      },
      {
        $unwind: "$affiliatedWith",
      },
      {
        $lookup: {
          from: "companies",
          localField: "affiliatedWith",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      {
        $unwind: "$companyInfo",
      },
      {
        $group: {
          _id: "$companyInfo._id",
          companyName: { $first: "$companyInfo.name" },
          clients: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              phone: "$phone",
            },
          },
        },
      },
      {
        $sort: { companyName: 1 },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error fetching clients grouped by company:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users-summary", protect, async (req, res) => {
  try {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all users who are either individual or company-admin
    const users = await User.find({
      allowedRoles: { $in: ["individual", "company-admin"] },
    }).populate("companyId");

    const results = [];

    for (const user of users) {
      const roles = user.allowedRoles;

      // INDIVIDUAL Role summary
      if (roles.includes("individual") && user.status === "approved") {
        const { membershipLeft, membershipDays } = calculateMembershipLeft(
          user.billingCycle,
          user.approvedAt
        );

        results.push({
          name: user.name,
          email: user.email,
          role: "individual",
          plan: user.billingCycle,
          membershipLeft,
          membershipDays,
        });
      }

      // COMPANY-ADMIN Role summary
      if (
        roles.includes("company-admin") &&
        user.companyId &&
        user.companyId.status === "approved"
      ) {
        const { membershipLeft, membershipDays } = calculateMembershipLeft(
          user.companyId.billingCycle,
          user.companyId.approvedAt || user.approvedAt
        );

        results.push({
          name: user.name,
          email: user.email,
          role: "company-admin",
          plan: user.companyId.billingCycle,
          membershipLeft,
          membershipDays,
        });
      }
    }

    res.json({ users: results });
  } catch (err) {
    console.error("[ERROR] SuperAdmin Summary Fetch:", err);
    res.status(500).json({ error: "Failed to fetch user summary." });
  }
});

function calculateMembershipLeft(billingCycle, approvedAt) {
  const now = new Date();
  const approvedDate = new Date(approvedAt);
  let expiryDate;

  if (billingCycle === "yearly") {
    expiryDate = new Date(
      approvedDate.setFullYear(approvedDate.getFullYear() + 1)
    );
  } else {
    expiryDate = new Date(approvedDate.setMonth(approvedDate.getMonth() + 1));
  }

  const daysLeft = Math.max(
    Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)),
    0
  );
  return {
    membershipLeft:
      billingCycle === "yearly"
        ? `${Math.floor(daysLeft / 30)} months of membership left`
        : `${daysLeft} days of membership left`,
    membershipDays: daysLeft,
  };
}

export default router;

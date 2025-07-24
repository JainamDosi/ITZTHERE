import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../utils/sendCredentialsEmail.js";

export const createUserByCompanyAdmin = async (req, res) => {
  try {
    const adminUser = req.user;

    if (adminUser.role !== "company-admin") {
      return res
        .status(403)
        .json({ message: "Only company-admins can create users." });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!["employee", "client"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Only 'employee' or 'client' allowed.",
      });
    }

    const existingUser = await User.findOne({ email });

    // 🔁 CASE 1: User already exists
    if (existingUser) {
      if (["super-admin"].includes(existingUser.role)) {
        return res
          .status(400)
          .json({ message: "User is an admin and cannot be modified." });
      }

      // Prevent duplicate role assignment
      if (existingUser.allowedRoles.includes(role)) {
        if (
          role === "client" &&
          existingUser.affiliatedWith.includes(adminUser.companyId)
        ) {
          return res
            .status(400)
            .json({ message: "User is already a client of your company." });
        }

        if (
          role === "employee" &&
          existingUser.companyId?.toString() === adminUser.companyId.toString()
        ) {
          return res.status(400).json({
            message: "User is already an employee of your company.",
          });
        }
      }

      // ✅ NEW: Prevent adding client as employee of same company
      if (
        role === "employee" &&
        existingUser.allowedRoles.includes("client") &&
        existingUser.affiliatedWith.includes(adminUser.companyId)
      ) {
        return res.status(400).json({
          message:
            "User is already a client of your company and cannot be added as an employee.",
        });
      }

      if (
        role === "client" &&
        existingUser.allowedRoles.includes("employee") &&
        existingUser.companyId?.toString() === adminUser.companyId.toString()
      ) {
        return res.status(400).json({
          message:
            "User is already a employee of your company and cannot be added as an client.",
        });
      }

      // ✅ Add as client
      if (role === "client") {
        if (!existingUser.allowedRoles.includes("client")) {
          existingUser.allowedRoles.push("client");
        }
        if (!existingUser.affiliatedWith.includes(adminUser.companyId)) {
          existingUser.affiliatedWith.push(adminUser.companyId);
        }

        await existingUser.save();
        return res
          .status(200)
          .json({ message: "User added as a client to your company." });
      }

      // ✅ Add as employee
      if (role === "employee") {
        if (existingUser.companyId) {
          return res.status(400).json({
            message: "User is already an employee of another company.",
          });
        }

        existingUser.companyId = adminUser.companyId;

        if (!existingUser.allowedRoles.includes("employee")) {
          existingUser.allowedRoles.push("employee");
        }

        await existingUser.save();
        return res
          .status(200)
          .json({ message: "User added as an employee to your company." });
      }
    }

    // ✅ CASE 2: Create new user
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role, // default role
      allowedRoles: [role],
      companyId: role === "employee" ? adminUser.companyId : null,
      affiliatedWith: role === "client" ? [adminUser.companyId] : [],
    });

    await newUser.save();

    await sendCredentialsEmail(email, name, email, password, role);

    return res.status(201).json({ message: `${role} created successfully.` });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersByCompanyAdmin = async (req, res) => {
  try {
    const adminUser = req.user;

    if (adminUser.role !== "company-admin") {
      return res.status(403).json({
        message: "Only company-admins can view their users.",
      });
    }

    const companyId = adminUser.companyId;

    const users = await User.find({
      $or: [
        {
          allowedRoles: "employee",
          companyId: companyId,
        },
        {
          allowedRoles: "client",
          affiliatedWith: { $in: [companyId] },
        },
      ],
    }).select("-passwordHash");
    console.log(users);
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

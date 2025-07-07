import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../utils/sendCredentialsEmail.js";

export const createUserByCompanyAdmin = async (req, res) => {
  try {
    const adminUser = req.user;
    // From auth middleware

    if (adminUser.role !== "company-admin") {
      return res
        .status(403)
        .json({ message: "Only company-admins can create users." });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required." });

    if (!["employee", "client"].includes(role))
      return res
        .status(400)
        .json({ message: "Invalid role. Only employee or client allowed." });

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ message: "User with this email already exists." });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      companyId: adminUser.companyId,
      affiliatedWith: role === "client" ? [adminUser.companyId] : [],
    });

    await newUser.save();
    await sendCredentialsEmail(
      newUser.email,
      newUser.name,
      newUser.email,
      password,
      newUser.role
    );

    return res.status(201).json({ message: `${role} created successfully.` });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersByCompanyAdmin = async (req, res) => {
  try {
    const adminUser = req.user; // From auth middleware

    if (adminUser.role !== "company-admin") {
      return res
        .status(403)
        .json({ message: "Only company-admins can view their users." });
    }

    const companyId = adminUser.companyId;

    const users = await User.find({
      $or: [
        { role: "employee", companyId },
        { role: "client", affiliatedWith: companyId },
      ],
    }).select("-passwordHash"); // Don't expose hashed passwords

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

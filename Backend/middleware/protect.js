import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, "secret"); // use env in production
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    // inject user into req
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

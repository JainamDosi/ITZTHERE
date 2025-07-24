import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";
import cookieParser from "cookie-parser";
import UserManagement from "./routes/usermanageRoutes.js";
import folderRoutes from "./routes/folderRoute.js";
import accessRequestRoutes from "./routes/accessRequestsRoutes.js";
import SuperAdminRoute from "./routes/SuperAdminRoute.js";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/create-user", UserManagement);
app.use("/api/folders", folderRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/super-admin", SuperAdminRoute);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
  );
});

import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
  );
});

// import express from "express";
// import { Resend } from "resend";

// const app = express();
// const resend = new Resend("re_ADfhRmLM_GiV9LCpKHWa9SMqvH3NsBmMn");

// app.get("/", async (req, res) => {
//   const { data, error } = await resend.emails.send({
//     from: "PKA <onboarding@resend.dev>",
//     to: ["aiuserxyz@gmail.com"],
//     subject: "OTP Verification",
//     html: "<strong>it works!</strong>",
//   });

//   if (error) {
//     return res.status(400).json({ error });
//   }

//   res.status(200).json({ data });
// });

// app.listen(3000, () => {
//   console.log("Listening on http://localhost:3000");
// });

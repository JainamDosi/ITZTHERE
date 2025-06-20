import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/DB.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});

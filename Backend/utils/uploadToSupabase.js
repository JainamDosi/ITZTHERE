import fs from "fs";
import path from "path";
import supabase from "../config/supabaseClient.js";

export const uploadToSupabase = async (file) => {
  const bucket = process.env.SUPABASE_BUCKET;
  if (!file) throw new Error("No file provided");

  // Generate a unique filename
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext);
  const uniqueName = `${Date.now()}-${base}${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, fs.createReadStream(file.path), {
      contentType: file.mimetype,
      duplex: "half",
    });

  // Delete temp file
  fs.unlinkSync(file.path);

  if (error) throw new Error(error.message);

  return { path: data.path }; // ✅ only return path
};

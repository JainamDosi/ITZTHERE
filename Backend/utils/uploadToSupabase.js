import fs from "fs";
import path from "path";
import supabase from "../config/supabaseClient.js";

export const uploadToSupabase = async (file) => {
  const bucket = process.env.SUPABASE_BUCKET;
  if (!file) throw new Error("No file provided");

  // Generate a unique filename using timestamp and original name
  const ext = path.extname(file.originalname); // e.g., ".pdf"
  const base = path.basename(file.originalname, ext); // e.g., "aadhaar"
  const uniqueName = `${Date.now()}-${base}${ext}`; // e.g., "1719462234-aadhaar.pdf"

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, fs.createReadStream(file.path), {
      contentType: file.mimetype,
      duplex: "half", // Required for streams in Node
    });

  // Delete temp file
  fs.unlinkSync(file.path);

  if (error) throw new Error(error.message);

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  return { path: data.path, publicUrl };
};

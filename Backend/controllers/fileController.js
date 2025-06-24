import supabase from "../config/supabaseClient.js";
import fs from "fs";

export const uploadFile = async (req, res) => {
  const file = req.file;
  const bucket = process.env.SUPABASE_BUCKET;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(file.filename, fs.createReadStream(file.path), {
      contentType: file.mimetype,
      duplex: "half", // Required for streams in Node
    });

  fs.unlinkSync(file.path); // Clean up temp file

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    path: data.path,
    publicUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`,
  });
};

export const getFileUrl = async (req, res) => {
  const { filename } = req.params;
  const bucket = process.env.SUPABASE_BUCKET;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return res.json({ publicUrl: data.publicUrl });
};

export const getSignedUrl = async (req, res) => {
  const { filename } = req.params;
  const bucket = process.env.SUPABASE_BUCKET;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filename, 60); // 60 seconds

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ signedUrl: data.signedUrl });
};

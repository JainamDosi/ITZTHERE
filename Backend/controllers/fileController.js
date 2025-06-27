import supabase from "../config/supabaseClient.js";
import fs from "fs";

import { uploadToSupabase } from "../utils/uploadToSupabase.js";

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadToSupabase(file);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

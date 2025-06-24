import multer from "multer";
import fs from "fs";

const tempDir = "./temp";
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    // Preserve original filename
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export default upload;

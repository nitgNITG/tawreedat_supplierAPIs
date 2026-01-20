import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Ensure uploads/temp directory exists relative to the project structure
// Assuming this file is in src/core/middlewares, we go up two levels to src, then to uploads
const tempDir = path.join(__dirname, "..", "..", "uploads", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Use diskStorage instead of memoryStorage
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    // Store temporarily in uploads/temp
    cb(null, tempDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    // Generate unique temporary filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "temp-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    // Only allow image files
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

export default upload;

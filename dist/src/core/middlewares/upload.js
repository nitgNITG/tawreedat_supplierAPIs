"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure uploads/temp directory exists relative to the project structure
// Assuming this file is in src/core/middlewares, we go up two levels to src, then to uploads
const tempDir = path_1.default.join(__dirname, "..", "..", "uploads", "temp");
if (!fs_1.default.existsSync(tempDir)) {
    fs_1.default.mkdirSync(tempDir, { recursive: true });
}
// Use diskStorage instead of memoryStorage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // Store temporarily in uploads/temp
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Generate unique temporary filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, "temp-" + uniqueSuffix + ext);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});
exports.default = upload;

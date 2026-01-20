"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const uploadImage = async (file, destination) => {
    let tempFilePath = null;
    try {
        // Store the temp file path for cleanup
        tempFilePath = file.path;
        // Create uploads directory and subdirectory
        const uploadsDir = path_1.default.join(__dirname, "..", "..", "uploads");
        const subDir = destination
            ? destination.replace(/^\//, "").split("/")[0]
            : "";
        const fullUploadDir = subDir ? path_1.default.join(uploadsDir, subDir) : uploadsDir;
        // Ensure directories exist
        await promises_1.default.mkdir(fullUploadDir, { recursive: true });
        await promises_1.default.mkdir(path_1.default.join(uploadsDir, "temp"), { recursive: true });
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
        if (!fileExtension) {
            throw new Error("File extension not found");
        }
        const fileName = `${timestamp}_${Math.random()
            .toString(36)
            .substring(2)}.${fileExtension}`;
        const finalFilePath = path_1.default.join(fullUploadDir, fileName);
        // Process image based on type
        if (fileExtension === "png") {
            await (0, sharp_1.default)(tempFilePath, {
                limitInputPixels: 268402689,
                sequentialRead: true,
            })
                .resize(2000, 2000, {
                fit: "inside",
                withoutEnlargement: true,
            })
                .png({ quality: 80, compressionLevel: 9 })
                .toFile(finalFilePath);
        }
        else if (fileExtension === "webp") {
            await (0, sharp_1.default)(tempFilePath, {
                limitInputPixels: 268402689,
                sequentialRead: true,
            })
                .resize(2000, 2000, {
                fit: "inside",
                withoutEnlargement: true,
            })
                .webp({ quality: 80 })
                .toFile(finalFilePath);
        }
        else if (["jpeg", "jpg"].includes(fileExtension)) {
            await (0, sharp_1.default)(tempFilePath, {
                limitInputPixels: 268402689,
                sequentialRead: true,
            })
                .resize(2000, 2000, {
                fit: "inside",
                withoutEnlargement: true,
            })
                .jpeg({ quality: 80 })
                .toFile(finalFilePath);
        }
        else if (["gif", "svg"].includes(fileExtension)) {
            // Copy without processing
            await promises_1.default.copyFile(tempFilePath, finalFilePath);
        }
        else {
            throw new Error(`Unsupported file type: ${fileExtension}`);
        }
        // Delete the temporary file
        await promises_1.default.unlink(tempFilePath).catch((err) => {
            console.warn("Failed to delete temp file:", err.message);
        });
        // Return the public URL
        const publicUrl = subDir
            ? `${process.env.BASE_URL}/uploads/${subDir}/${fileName}`
            : `${process.env.BASE_URL}/uploads/${fileName}`;
        console.log("Image uploaded successfully:", publicUrl);
        return publicUrl;
    }
    catch (error) {
        console.error("Error in uploadImage function:", error);
        // Clean up temp file if it exists
        if (tempFilePath) {
            await promises_1.default.unlink(tempFilePath).catch((err) => {
                console.warn("Failed to delete temp file on error:", err.message);
            });
        }
        throw new Error(`Image processing failed: ${error.message}`);
    }
};
exports.default = uploadImage;

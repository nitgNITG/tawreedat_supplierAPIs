"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const deleteImage = async (fileUrl) => {
    try {
        if (!fileUrl)
            return false;
        let filePath;
        if (fileUrl.startsWith("/uploads/")) {
            filePath = fileUrl.replace(/^\//, "");
        }
        else if (fileUrl.startsWith("http")) {
            const url = new URL(fileUrl);
            filePath = url.pathname.replace(/^\//, "");
        }
        else {
            filePath = fileUrl;
        }
        // Assuming this file is in src/utils, '..' goes to src
        const absolutePath = path_1.default.join(__dirname, "..", filePath);
        try {
            await promises_1.default.access(absolutePath); // check file exists
            await promises_1.default.unlink(absolutePath);
            console.log("Deleted:", absolutePath);
            return true;
        }
        catch (err) {
            if (err.code === "ENOENT") {
                console.warn("File not found:", absolutePath);
                return false;
            }
            console.error("Delete error:", err.message);
            return false;
        }
    }
    catch (error) {
        console.error("Unexpected delete error:", error.message);
        return false;
    }
};
exports.default = deleteImage;

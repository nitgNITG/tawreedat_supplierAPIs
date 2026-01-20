"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const auth_controller_1 = __importDefault(require("./modules/Registration & Authentication/auth.controller"));
const profile_controller_1 = __importDefault(require("./modules/Profile Management/profile.controller"));
router.use("/supplier/auth", auth_controller_1.default);
router.use("/supplier/profile", profile_controller_1.default);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.forgetPasswordSchema = exports.updatePasswordSchema = exports.resendOtpSchema = exports.updateEmailSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const global_types_1 = require("../../types/global.types");
exports.registerSchema = zod_1.default
    .object({
    // user fields
    full_name: zod_1.default.string().min(3).max(50),
    email: zod_1.default.email(),
    phone: zod_1.default.string().optional(),
    password: zod_1.default.string().min(6),
    image_url: zod_1.default.string().optional(),
    lang: zod_1.default.string().optional(),
    birth_date: zod_1.default.coerce.date().optional(),
    gender: zod_1.default.literal([global_types_1.GenderEnum.MALE, global_types_1.GenderEnum.FEMALE]).optional(),
    login_type: zod_1.default.string().optional(),
    apple_id: zod_1.default.string().optional(),
    // supplier fields
    type_id: zod_1.default.number().optional(),
    national_id: zod_1.default.string(),
    synonyms: zod_1.default.string().optional(),
    tax_card: zod_1.default.string(),
    commercial_register: zod_1.default.string(),
})
    .superRefine((args, ctx) => {
    if (args.phone) {
        const clean = args.phone.replace(/[\s-]/g, "");
        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        if (!phoneRegex.test(clean)) {
            ctx.addIssue({
                code: "custom",
                path: ["phone"],
                message: "Phone number is incorrect",
            });
        }
    }
});
exports.loginSchema = zod_1.default.object({
    email: zod_1.default.email(),
    password: zod_1.default.string(),
});
exports.verifyEmailSchema = zod_1.default.object({
    email: zod_1.default.email(),
    firstOtp: zod_1.default.string(),
    secondOtp: zod_1.default.string().optional(),
});
exports.updateEmailSchema = zod_1.default.object({
    new_email: zod_1.default.email(),
});
exports.resendOtpSchema = zod_1.default.object({
    email: zod_1.default.email(),
});
exports.updatePasswordSchema = zod_1.default.object({
    current_password: zod_1.default.string(),
    new_password: zod_1.default.string(),
});
exports.forgetPasswordSchema = zod_1.default.object({
    email: zod_1.default.email(),
});
exports.changePasswordSchema = zod_1.default.object({
    email: zod_1.default.email(),
    otp: zod_1.default.string(),
    new_password: zod_1.default.string(),
});

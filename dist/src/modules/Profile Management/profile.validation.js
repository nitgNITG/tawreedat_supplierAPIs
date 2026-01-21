"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatSchema = exports.updateStoreAddressSchema = exports.addStoreAddressSchema = exports.updateDocumentsSchema = exports.updateProfileSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const global_types_1 = require("../../types/global.types");
exports.updateProfileSchema = zod_1.default
    .object({
    // user fields
    full_name: zod_1.default.string().min(3).max(50).optional(),
    phone: zod_1.default.string().optional(),
    lang: zod_1.default.string().optional(),
    birth_date: zod_1.default.coerce.date().optional(),
    gender: zod_1.default.literal([global_types_1.GenderEnum.MALE, global_types_1.GenderEnum.FEMALE]).optional(),
    // supplier fields
    synonyms: zod_1.default.string().optional(),
    apple_id: zod_1.default.string().optional(),
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
exports.updateDocumentsSchema = zod_1.default.object({
    type_id: zod_1.default.string().optional(),
    is_active: zod_1.default.boolean().optional(),
    national_id: zod_1.default
        .string()
        .regex(/^\d{14}$/, "National ID must be 14 digits")
        .optional(),
    tax_card: zod_1.default.string().optional(),
    commercial_register: zod_1.default.string().optional(),
});
// Working hours schema for validation
const dayWorkingHoursSchema = zod_1.default.union([
    zod_1.default.object({
        open: zod_1.default
            .string()
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
        close: zod_1.default
            .string()
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
    }),
    zod_1.default.object({
        closed: zod_1.default.literal(true),
    }),
]);
// Working hours schema for validation
const workingHoursSchema = zod_1.default.object({
    saturday: dayWorkingHoursSchema.optional().nullable(),
    sunday: dayWorkingHoursSchema.optional().nullable(),
    monday: dayWorkingHoursSchema.optional().nullable(),
    tuesday: dayWorkingHoursSchema.optional().nullable(),
    wednesday: dayWorkingHoursSchema.optional().nullable(),
    thursday: dayWorkingHoursSchema.optional().nullable(),
    friday: dayWorkingHoursSchema.optional().nullable(),
});
exports.addStoreAddressSchema = zod_1.default.object({
    address_line_1: zod_1.default.string().min(3).optional(),
    address_line_2: zod_1.default.string().min(3).optional(),
    city: zod_1.default.string().min(2).optional(),
    state: zod_1.default.string().min(2).optional(),
    country: zod_1.default.string().min(2).optional(),
    latitude: zod_1.default.coerce.number().min(-90).max(90).optional(),
    longitude: zod_1.default.coerce.number().min(-180).max(180).optional(),
    contact_name: zod_1.default.string().min(3).optional(),
    contact_phone: zod_1.default.string().optional(),
    google_map_link: zod_1.default.string().optional(),
    working_hours: workingHoursSchema.optional(),
});
exports.updateStoreAddressSchema = zod_1.default.object({
    address_line_1: zod_1.default.string().min(3).optional(),
    address_line_2: zod_1.default.string().min(3).optional(),
    city: zod_1.default.string().min(2).optional(),
    state: zod_1.default.string().min(2).optional(),
    country: zod_1.default.string().min(2).optional(),
    latitude: zod_1.default.coerce.number().min(-90).max(90).optional(),
    longitude: zod_1.default.coerce.number().min(-180).max(180).optional(),
    contact_name: zod_1.default.string().min(3).optional(),
    contact_phone: zod_1.default.string().optional(),
    google_map_link: zod_1.default.string().optional(),
    working_hours: workingHoursSchema.optional(),
});
exports.getStatSchema = zod_1.default.object({
    isAdvancedStat: zod_1.default.enum(["true", "false"]).optional(),
});

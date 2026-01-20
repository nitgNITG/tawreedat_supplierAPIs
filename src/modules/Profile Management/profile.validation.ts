import z from "zod";
import { GenderEnum } from "../../types/global.types";

export const updateProfileSchema = z
  .object({
    // user fields
    full_name: z.string().min(3).max(50).optional(),
    phone: z.string().optional(),
    lang: z.string().optional(),
    birth_date: z.coerce.date().optional(),
    gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
    // supplier fields
    synonyms: z.string().optional(),
    apple_id: z.string().optional(),
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

export const updateDocumentsSchema = z.object({
  type_id: z.string().optional(),
  is_active: z.boolean().optional(),
  national_id: z
    .string()
    .regex(/^\d{14}$/, "National ID must be 14 digits")
    .optional(),
  tax_card: z.string().optional(),
  commercial_register: z.string().optional(),
});

// Working hours schema for validation
const dayWorkingHoursSchema = z.union([
  z.object({
    open: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Time must be in HH:MM format",
      ),
    close: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Time must be in HH:MM format",
      ),
  }),
  z.object({
    closed: z.literal(true),
  }),
]);
// Working hours schema for validation
const workingHoursSchema = z.object({
  saturday: dayWorkingHoursSchema.optional().nullable(),
  sunday: dayWorkingHoursSchema.optional().nullable(),
  monday: dayWorkingHoursSchema.optional().nullable(),
  tuesday: dayWorkingHoursSchema.optional().nullable(),
  wednesday: dayWorkingHoursSchema.optional().nullable(),
  thursday: dayWorkingHoursSchema.optional().nullable(),
  friday: dayWorkingHoursSchema.optional().nullable(),
});

export const addStoreAddressSchema = z.object({
  address_line_1: z.string().min(3).optional(),
  address_line_2: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  postal_code: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  contact_name: z.string().min(3).optional(),
  contact_phone: z.string().optional(),
  working_hours: workingHoursSchema.optional(),
});

export const updateStoreAddressSchema = z.object({
  address_line_1: z.string().min(3).optional(),
  address_line_2: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  postal_code: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  contact_name: z.string().min(3).optional(),
  contact_phone: z.string().optional(),
  working_hours: workingHoursSchema.optional(),
});

export const getStatSchema = z.object({
  isAdvancedStat: z.enum(["true", "false"]).optional(),
});

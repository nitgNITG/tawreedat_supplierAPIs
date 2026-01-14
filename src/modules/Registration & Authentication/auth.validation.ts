import z from "zod";
import { GenderEnum } from "../../types/global.types";

export const registerSchema = z
  .object({
    // user fields
    full_name: z.string().min(3).max(50),
    email: z.email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    image_url: z.string().optional(),
    lang: z.string().optional(),
    birth_date: z.coerce.date().optional(),
    gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
    login_type: z.string().optional(),
    apple_id: z.string().optional(),
    // supplier fields
    type_id: z.number().optional(),
    national_id: z.string(),
    synonyms: z.string().optional(),
    tax_card: z.string(),
    commercial_register: z.string(),
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

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  user_otp: z.string(),
  // secondOtp: z.string().optional(),
});

export const updateEmailSchema = z.object({
  new_email: z.email(),
});

export const resendOtpSchema = z.object({
  email: z.email(),
});

export const updatePasswordSchema = z.object({
  current_password: z.string(),
  new_password: z.string(),
});

export const forgetPasswordSchema = z.object({
  email: z.email(),
});

export const changePasswordSchema = z.object({
  email: z.email(),
  user_otp: z.string(),
  new_password: z.string(),
});

import z from "zod";
import { GenderEnum } from "../../types/global.types";

export const registerSchema = z
  .object({
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    email: z.email(),
    password: z.string(),
    age: z.number().min(18).max(200).optional(),
    gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
    phone: z.string().optional(),
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

export const confirmEmailSchema = z.object({
  email: z.email(),
  firstOtp: z.string(),
  secondOtp: z.string().optional(),
});

export const updateEmailSchema = z.object({
  newEmail: z.email(),
});

export const resendEmailOtpSchema = z.object({
  email: z.email(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

export const forgetPasswordSchema = z.object({
  email: z.email(),
});

export const changePasswordSchema = z.object({
  email: z.email(),
  otp: z.string(),
  newPassword: z.string(),
});

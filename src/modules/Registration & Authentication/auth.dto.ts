import z from "zod";
import {
  appleLoginSchema,
  changePasswordSchema,
  verifyEmailSchema,
  forgetPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "./auth.validation";

export type registerDTO = z.infer<typeof registerSchema>;
export type verifyEmaiDTO = z.infer<typeof verifyEmailSchema>;
export type updateEmaiDTO = z.infer<typeof updateEmailSchema>;
export type resendOtpDTO = z.infer<typeof resendOtpSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
export type updatePasswordDTO = z.infer<typeof updatePasswordSchema>;
export type forgetPasswordDTO = z.infer<typeof forgetPasswordSchema>;
export type changePasswordDTO = z.infer<typeof changePasswordSchema>;
export type googleLoginDTO = z.infer<typeof googleLoginSchema>;
export type appleLoginDTO = z.infer<typeof appleLoginSchema>;

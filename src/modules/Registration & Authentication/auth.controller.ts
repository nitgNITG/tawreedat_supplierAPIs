import { Router } from "express";
import { AuthService } from "./auth.service";
import { validation } from "../../core/middlewares/validation.middleware";
import {
  changePasswordSchema,
  verifyEmailSchema,
  forgetPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "./auth.validation";
import { auth } from "../../core/middlewares/auth.middleware";
const router = Router();
const authService = new AuthService();

router.post("/register", validation(registerSchema), authService.register);
router.post("/login", validation(loginSchema), authService.login);
router.get("/get-supplier-types", authService.getSupplierTypes);
router.post("/refresh-token", authService.refreshToken);
router.post("/verify-email", validation(verifyEmailSchema), authService.verifyEmail);
router.patch("/update-email",auth,validation(updateEmailSchema),authService.updateEmail);
router.post("/resend-otp",validation(resendOtpSchema),authService.resendOtp);
router.patch("/update-password",auth,validation(updatePasswordSchema),authService.updatePassword);
router.post("/forget-password",validation(forgetPasswordSchema),authService.forgetPassword);
router.patch("/change-password",validation(changePasswordSchema),authService.changePassword);
router.post("/logout", auth, authService.logout);

export default router;

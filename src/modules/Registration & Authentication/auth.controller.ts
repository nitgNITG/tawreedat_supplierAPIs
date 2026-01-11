import { Router } from "express";
import { AuthService } from "./auth.service";
import { validation } from "../../core/middlewares/validation.middleware";
import {
  changePasswordSchema,
  confirmEmailSchema,
  forgetPasswordSchema,
  loginSchema,
  registerSchema,
  resendEmailOtpSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "./auth.validation";
import { auth } from "../../core/middlewares/auth.middleware";
const router = Router();
const authService = new AuthService();

router.post("/register", validation(registerSchema), authService.register);
router.post("/login", validation(loginSchema), authService.login);
router.post("/refresh-token", authService.refreshToken);
router.post("/confirm-email", validation(confirmEmailSchema), authService.confirmEmail);
router.patch("/update-email",auth,validation(updateEmailSchema),authService.updateEmail);
router.post("/resend-email-otp",validation(resendEmailOtpSchema),authService.resendEmailOtp);
router.patch("/update-password",auth,validation(updatePasswordSchema),authService.updatePassword);
router.post("/forget-password",validation(forgetPasswordSchema),authService.forgetPassword);
router.patch("/change-password",validation(changePasswordSchema),authService.changePassword);
router.post("/logout", auth, authService.logout);

export default router;

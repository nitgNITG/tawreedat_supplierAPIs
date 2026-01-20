import { Router } from "express";
const router = Router();
import authRouter from "./modules/Registration & Authentication/auth.controller";
import profileRouter from "./modules/Profile Management/profile.controller";

router.use("/supplier/auth", authRouter);
router.use("/supplier/profile", profileRouter);

export default router;

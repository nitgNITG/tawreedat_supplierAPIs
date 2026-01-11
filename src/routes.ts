import { Router } from "express";
const router = Router();
import authRouter from "./modules/Registration & Authentication/auth.controller";

router.use("/auth", authRouter);

export default router;

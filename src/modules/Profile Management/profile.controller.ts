import { Router } from "express";
import { validation } from "../../core/middlewares/validation.middleware";
import {
  updateDocumentsSchema,
  updateProfileSchema,
  addStoreAddressSchema,
  updateStoreAddressSchema,
  getStatSchema,
} from "./profile.validation";
import { auth } from "../../core/middlewares/auth.middleware";
import upload from "../../core/middlewares/upload";
import { ProfileService } from "./profile.service";
const router = Router();
const profileService = new ProfileService();

router.get("/get-profile", auth, profileService.getProfile);
router.patch(
  "/update-profile",
  auth,
  upload.single("image"),
  validation(updateProfileSchema),
  profileService.updateProfile,
);
router.patch(
  "/update-documents",
  auth,
  validation(updateDocumentsSchema),
  profileService.updateDocuments,
);
router.get("/get-store-addresses", auth, profileService.getStoreAddresses);
router.post(
  "/add-store-address",
  auth,
  validation(addStoreAddressSchema),
  profileService.addStoreAddress,
);
router.get("/get-store-address/:id", auth, profileService.getStoreAddress);
router.patch(
  "/update-store-address/:id",
  auth,
  validation(updateStoreAddressSchema),
  profileService.updateStoreAddress,
);
router.delete(
  "/delete-store-address/:id",
  auth,
  profileService.deleteStoreAddress,
);
router.patch("/update-stat", auth, profileService.updateStat);
router.get(
  "/get-stat",
  auth,
  validation(getStatSchema),
  profileService.getStat,
);
router.delete("/soft-delete", auth, profileService.softDelete);
router.delete("/hard-delete", auth, profileService.hardDelete);
router.post("/cancel-soft-delete", auth, profileService.cancelSoftDelete);

export default router;

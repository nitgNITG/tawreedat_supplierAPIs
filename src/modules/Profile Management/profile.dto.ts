import z from "zod";
import {
  updateProfileSchema,
  updateDocumentsSchema,
  addStoreAddressSchema,
  updateStoreAddressSchema,
  getStatSchema,
} from "./profile.validation";

export type updateProfileDTO = z.infer<typeof updateProfileSchema>;
export type updateDocumentsDTO = z.infer<typeof updateDocumentsSchema>;
export type addStoreAddressDTO = z.infer<typeof addStoreAddressSchema>;
export type updateStoreAddressDTO = z.infer<typeof updateStoreAddressSchema>;
export type getStatDTO = z.infer<typeof getStatSchema>;

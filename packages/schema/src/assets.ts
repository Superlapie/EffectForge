import { z } from "zod";
import { IdSchema } from "./primitives.js";

export const AssetTypeSchema = z.enum([
  "texture",
  "image",
  "model",
  "font",
  "lut",
  "noise-texture",
]);

export type AssetType = z.infer<typeof AssetTypeSchema>;

export const AssetSchema = z.object({
  id: IdSchema,
  type: AssetTypeSchema,
  name: z.string().min(1).max(256),
  mimeType: z.string().min(1).max(128),
  byteSize: z.number().int().nonnegative(),
  contentHash: z.string().min(8).max(128),
  /** Relative path inside the project archive, e.g. assets/textures/spark.png */
  archivePath: z.string().min(1).max(512),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type Asset = z.infer<typeof AssetSchema>;

export const AssetRegistrySchema = z.record(IdSchema, AssetSchema).default({});

export type AssetRegistry = z.infer<typeof AssetRegistrySchema>;

import { z } from "zod";
import { CanvasSchema } from "./canvas.js";
import { TimelineSchema } from "./timeline.js";
import { AssetRegistrySchema } from "./assets.js";
import { LayerSchema } from "./layers/index.js";
import { IdSchema } from "./primitives.js";

export const FORMAT_NAME = "effectforge" as const;

/** Current supported project format version. Increment when schema changes require migration. */
export const CURRENT_FORMAT_VERSION = 1;

export const ExportPreferencesSchema = z.object({
  targetFramework: z.enum(["react-vite", "nextjs", "vanilla"]).optional(),
  portableSource: z.boolean().default(false),
  reducedMotionPolicy: z
    .enum(["reduce-intensity", "pause-decorative", "static-fallback", "ignore-essential-only"])
    .default("reduce-intensity"),
});

export type ExportPreferences = z.infer<typeof ExportPreferencesSchema>;

export const ProjectMetadataSchema = z.object({
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  author: z.string().max(256).optional(),
  description: z.string().max(2048).optional(),
  tags: z.array(z.string().max(64)).max(32).default([]),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;

export const EffectForgeProjectSchema = z.object({
  format: z.literal(FORMAT_NAME),
  formatVersion: z.number().int().positive(),
  id: IdSchema,
  name: z.string().min(1).max(256),
  seed: z.number().int().nonnegative(),
  canvas: CanvasSchema,
  timeline: TimelineSchema,
  layers: z.array(LayerSchema).default([]),
  assets: AssetRegistrySchema,
  exportPreferences: ExportPreferencesSchema.default({
    portableSource: false,
    reducedMotionPolicy: "reduce-intensity",
  }),
  metadata: ProjectMetadataSchema.default({ tags: [] }),
});

export type EffectForgeProject = z.infer<typeof EffectForgeProjectSchema>;

/** Raw JSON before validation — used for migration input. */
export type UnknownProjectDocument = Record<string, unknown>;

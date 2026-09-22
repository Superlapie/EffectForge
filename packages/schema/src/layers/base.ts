import { z } from "zod";
import { BlendModeSchema, IdSchema } from "../primitives.js";

export const LayerBaseSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(128),
  enabled: z.boolean().default(true),
  locked: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1),
  blendMode: BlendModeSchema.default("normal"),
});

export type LayerBase = z.infer<typeof LayerBaseSchema>;

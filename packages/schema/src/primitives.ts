import { z } from "zod";

/** Hex color string (#RGB, #RRGGBB, or #RRGGBBAA). */
export const ColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Color must be a hex string (#RGB, #RRGGBB, or #RRGGBBAA)",
  });

export type Color = z.infer<typeof ColorSchema>;

export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Vector2 = z.infer<typeof Vector2Schema>;

export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Vector3 = z.infer<typeof Vector3Schema>;

export const IdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message: "ID must contain only alphanumeric characters, underscores, and hyphens",
  });

export type Id = z.infer<typeof IdSchema>;

export const BlendModeSchema = z.enum([
  "normal",
  "additive",
  "multiply",
  "screen",
  "overlay",
]);

export type BlendMode = z.infer<typeof BlendModeSchema>;

import { z } from "zod";
import { LayerBaseSchema } from "./base.js";

export const EventTriggerSchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("pointer-click") }),
  z.object({ source: z.literal("pointer-hover") }),
  z.object({ source: z.literal("pointer-enter") }),
  z.object({ source: z.literal("pointer-leave") }),
  z.object({ source: z.literal("page-visibility") }),
  z.object({ source: z.literal("timeline-marker"), markerId: z.string() }),
  z.object({ source: z.literal("custom"), eventName: z.string().min(1).max(128) }),
]);

export type EventTrigger = z.infer<typeof EventTriggerSchema>;

export const EventLayerSchema = LayerBaseSchema.extend({
  kind: z.literal("event"),
  trigger: EventTriggerSchema,
  targetLayerIds: z.array(z.string()).default([]),
  action: z.enum(["enable", "disable", "burst", "trigger"]).default("burst"),
});

export type EventLayer = z.infer<typeof EventLayerSchema>;

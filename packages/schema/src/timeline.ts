import { z } from "zod";

export const TimelineMarkerSchema = z.object({
  id: z.string().min(1),
  time: z.number().min(0),
  label: z.string().min(1).max(128),
  eventName: z.string().min(1).max(128).optional(),
});

export type TimelineMarker = z.infer<typeof TimelineMarkerSchema>;

export const TimelineSchema = z.object({
  duration: z.number().positive().max(3600),
  loop: z.boolean().default(true),
  markers: z.array(TimelineMarkerSchema).default([]),
});

export type Timeline = z.infer<typeof TimelineSchema>;

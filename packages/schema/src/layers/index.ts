import { z } from "zod";
import {
  ParticleBehaviorSchema,
  ParticleEmitterSchema,
  ParticleLayerSchema,
  type ParticleBehavior,
  type ParticleEmitter,
  type ParticleLayer,
} from "./particles.js";
import { TrailLayerSchema, type TrailLayer } from "./trail.js";
import { DistortionLayerSchema, type DistortionLayer } from "./distortion.js";
import { TextLayerSchema, type TextLayer } from "./text.js";
import { ModelLayerSchema, type ModelLayer } from "./model.js";
import { PostFxLayerSchema, type PostFxLayer } from "./postfx.js";
import { GroupLayerSchema, type GroupLayer } from "./group.js";
import { EventLayerSchema, type EventLayer } from "./event.js";

export const LayerSchema = z.discriminatedUnion("kind", [
  ParticleLayerSchema,
  TrailLayerSchema,
  DistortionLayerSchema,
  TextLayerSchema,
  ModelLayerSchema,
  PostFxLayerSchema,
  GroupLayerSchema,
  EventLayerSchema,
]);

export type Layer = z.infer<typeof LayerSchema>;

export type LayerKind = Layer["kind"];

export {
  ParticleBehaviorSchema,
  ParticleEmitterSchema,
  ParticleLayerSchema,
  TrailLayerSchema,
  DistortionLayerSchema,
  TextLayerSchema,
  ModelLayerSchema,
  PostFxLayerSchema,
  GroupLayerSchema,
  EventLayerSchema,
};

export type {
  ParticleBehavior,
  ParticleEmitter,
  ParticleLayer,
  TrailLayer,
  DistortionLayer,
  TextLayer,
  ModelLayer,
  PostFxLayer,
  GroupLayer,
  EventLayer,
};

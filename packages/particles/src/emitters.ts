import type { EmitterShape, ParticleEmitter } from "@effectforge/schema";
import type { RandomStream } from "@effectforge/core";

export interface EmittedPosition {
  x: number;
  y: number;
  z: number;
}

function applyEmitterTransform(
  emitter: ParticleEmitter,
  local: EmittedPosition,
): EmittedPosition {
  const { position, scale } = emitter;
  return {
    x: position.x + local.x * scale.x,
    y: position.y + local.y * scale.y,
    z: position.z + local.z * scale.z,
  };
}

function sampleShape(shape: EmitterShape, stream: RandomStream): EmittedPosition {
  switch (shape.type) {
    case "point":
      return { x: 0, y: 0, z: 0 };
    case "box": {
      const halfX = shape.size.x * 0.5;
      const halfY = shape.size.y * 0.5;
      const halfZ = shape.size.z * 0.5;
      return {
        x: stream.nextRange(-halfX, halfX),
        y: stream.nextRange(-halfY, halfY),
        z: stream.nextRange(-halfZ, halfZ),
      };
    }
    case "circle": {
      const angle = stream.nextRange(0, Math.PI * 2);
      return {
        x: Math.cos(angle) * shape.radius,
        y: Math.sin(angle) * shape.radius,
        z: 0,
      };
    }
    default:
      throw new Error(`Emitter shape "${shape.type}" is not implemented until a later phase`);
  }
}

/** Sample a spawn position from an emitter shape using deterministic randomness. */
export function sampleEmitterPosition(
  emitter: ParticleEmitter,
  stream: RandomStream,
): EmittedPosition {
  const local = sampleShape(emitter.shape, stream);
  return applyEmitterTransform(emitter, local);
}

/** Sample an initial velocity direction for a newly spawned particle. */
export function sampleInitialVelocity(
  speed: number,
  stream: RandomStream,
): { x: number; y: number; z: number } {
  const angle = stream.nextRange(0, Math.PI * 2);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  return { x: vx, y: vy, z: 0 };
}

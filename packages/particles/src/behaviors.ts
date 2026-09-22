import type { ParticleBehavior } from "@effectforge/schema";
import type { PointerInteractionContext } from "./pointer-context.js";
import type { ParticleStore } from "./store.js";

function applyCursorForce(
  px: number,
  py: number,
  vx: number,
  vy: number,
  pointer: PointerInteractionContext,
  strength: number,
  radius: number,
  attract: boolean,
  dt: number,
): [number, number] {
  if (!pointer.active) {
    return [vx, vy];
  }

  const dx = pointer.position.x - px;
  const dy = pointer.position.y - py;
  const distSq = dx * dx + dy * dy;
  const radiusSq = radius * radius;
  if (distSq > radiusSq || distSq < 1e-8) {
    return [vx, vy];
  }

  const dist = Math.sqrt(distSq);
  const falloff = 1 - dist / radius;
  const force = strength * falloff * dt;
  const directionX = attract ? dx / dist : -dx / dist;
  const directionY = attract ? dy / dist : -dy / dist;
  return [vx + directionX * force, vy + directionY * force];
}

/** Apply schema-defined behaviors to a single particle. */
export function applyBehaviors(
  store: ParticleStore,
  index: number,
  behaviors: ParticleBehavior[],
  dt: number,
  pointer?: PointerInteractionContext | null,
): void {
  const p = store.positionOffset(index);
  const vo = store.positionOffset(index);
  const px = store.position[p]!;
  const py = store.position[p + 1]!;

  let vx = store.velocity[vo]!;
  let vy = store.velocity[vo + 1]!;
  let vz = store.velocity[vo + 2]!;

  for (const behavior of behaviors) {
    switch (behavior.type) {
      case "gravity":
        vy += behavior.strength * dt;
        break;
      case "drag": {
        const damping = Math.max(0, 1 - behavior.coefficient * dt);
        vx *= damping;
        vy *= damping;
        vz *= damping;
        break;
      }
      case "constant-acceleration":
        vx += behavior.acceleration.x * dt;
        vy += behavior.acceleration.y * dt;
        vz += behavior.acceleration.z * dt;
        break;
      case "cursor-attract":
        if (pointer) {
          [vx, vy] = applyCursorForce(
            px,
            py,
            vx,
            vy,
            pointer,
            behavior.strength,
            behavior.radius,
            true,
            dt,
          );
        }
        break;
      case "cursor-repel":
        if (pointer) {
          [vx, vy] = applyCursorForce(
            px,
            py,
            vx,
            vy,
            pointer,
            behavior.strength,
            behavior.radius,
            false,
            dt,
          );
        }
        break;
      default:
        break;
    }
  }

  store.velocity[vo] = vx;
  store.velocity[vo + 1] = vy;
  store.velocity[vo + 2] = vz;

  store.position[p]! += vx * dt;
  store.position[p + 1]! += vy * dt;
  store.position[p + 2]! += vz * dt;
}

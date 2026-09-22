import type { ParticleBehavior } from "@effectforge/schema";
import type { ParticleStore } from "./store.js";

/** Apply schema-defined behaviors to a single particle. */
export function applyBehaviors(
  store: ParticleStore,
  index: number,
  behaviors: ParticleBehavior[],
  dt: number,
): void {
  const p = store.positionOffset(index);
  const vo = store.positionOffset(index);

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

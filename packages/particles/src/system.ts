import { deriveStream, type RandomStream } from "@effectforge/core";
import type { ParticleLayer } from "@effectforge/schema";
import { applyBehaviors } from "./behaviors.js";
import { sampleEmitterPosition, sampleInitialVelocity } from "./emitters.js";
import { ParticleStore } from "./store.js";
import { sampleColor, sampleNumeric } from "./values.js";

export interface ParticleSystemOptions {
  layer: ParticleLayer;
  projectSeed: number;
}

/**
 * Single particle layer simulation driver.
 * Phase 4: rate emission, point/box/circle emitters, gravity/drag, pooled SoA store.
 */
export class ParticleSystem {
  readonly layer: ParticleLayer;
  readonly store: ParticleStore;

  private readonly spawnStream: RandomStream;
  private emissionAccumulator = 0;
  private elapsed = 0;

  constructor(options: ParticleSystemOptions) {
    this.layer = options.layer;
    this.store = new ParticleStore(options.layer.emitter.maxParticles);
    this.spawnStream = deriveStream(options.projectSeed, `particles:${options.layer.id}:spawn`);
  }

  get activeCount(): number {
    return this.store.activeCount;
  }

  get elapsedTime(): number {
    return this.elapsed;
  }

  reset(): void {
    this.store.forEachAlive((index) => this.store.kill(index));
    this.emissionAccumulator = 0;
    this.elapsed = 0;
  }

  seek(time: number): void {
    this.reset();
    this.elapsed = Math.max(0, time);
  }

  simulate(dt: number): void {
    if (!this.layer.enabled || dt <= 0) {
      return;
    }

    this.elapsed += dt;
    this.emitParticles(dt);
    this.integrateParticles(dt);
  }

  private emitParticles(dt: number): void {
    const emitter = this.layer.emitter;
    if (this.elapsed < emitter.startDelay) {
      return;
    }

    if (emitter.duration !== null) {
      const localTime = this.elapsed - emitter.startDelay;
      if (localTime > emitter.duration) {
        if (!emitter.loop) {
          return;
        }
      }
    }

    if (emitter.rate <= 0) {
      return;
    }

    this.emissionAccumulator += emitter.rate * dt;
    while (this.emissionAccumulator >= 1) {
      if (!this.spawnParticle()) {
        break;
      }
      this.emissionAccumulator -= 1;
    }
  }

  private spawnParticle(): boolean {
    const index = this.store.spawn();
    if (index === null) {
      return false;
    }

    const spawnPosition = sampleEmitterPosition(this.layer.emitter, this.spawnStream);
    const speed = sampleNumeric(this.layer.speed, this.spawnStream);
    const velocity = sampleInitialVelocity(speed, this.spawnStream);
    const lifetime = Math.max(0.001, sampleNumeric(this.layer.lifetime, this.spawnStream));
    const size = Math.max(0.001, sampleNumeric(this.layer.size, this.spawnStream));
    const opacity = Math.min(1, Math.max(0, sampleNumeric(this.layer.initialOpacity, this.spawnStream)));
    const [r, g, b, a] = sampleColor(this.layer.color, this.spawnStream);

    const p = this.store.positionOffset(index);
    this.store.position[p] = spawnPosition.x;
    this.store.position[p + 1] = spawnPosition.y;
    this.store.position[p + 2] = spawnPosition.z;

    const v = this.store.positionOffset(index);
    this.store.velocity[v] = velocity.x;
    this.store.velocity[v + 1] = velocity.y;
    this.store.velocity[v + 2] = velocity.z;

    this.store.age[index] = 0;
    this.store.lifetime[index] = lifetime;
    this.store.size[index] = size;

    const c = this.store.colorOffset(index);
    this.store.color[c] = r;
    this.store.color[c + 1] = g;
    this.store.color[c + 2] = b;
    this.store.color[c + 3] = a * opacity;

    return true;
  }

  private integrateParticles(dt: number): void {
    const behaviors = this.layer.behaviors;
    this.store.forEachAlive((index) => {
      const age = this.store.age[index]! + dt;
      this.store.age[index] = age;
      if (age >= this.store.lifetime[index]!) {
        this.store.kill(index);
        return;
      }
      applyBehaviors(this.store, index, behaviors, dt);
    });
  }
}

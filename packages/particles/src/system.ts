import { deriveStream, type RandomStream } from "@effectforge/core";
import type { ParticleLayer } from "@effectforge/schema";
import { applyBehaviors } from "./behaviors.js";
import { collectBurstTriggers } from "./bursts.js";
import { sampleEmitterPosition, sampleInitialVelocity } from "./emitters.js";
import { applyLifetimeCurves } from "./lifetime.js";
import { ParticleStore } from "./store.js";
import { sampleColor, sampleNumeric } from "./values.js";

export interface ParticleSystemOptions {
  layer: ParticleLayer;
  projectSeed: number;
}

/**
 * Single particle layer simulation driver.
 * Phase 5: bursts, curve/gradient value sources, size/opacity over lifetime.
 */
export class ParticleSystem {
  readonly layer: ParticleLayer;
  readonly store: ParticleStore;

  private readonly spawnStream: RandomStream;
  private readonly burstStream: RandomStream;
  private emissionAccumulator = 0;
  private elapsed = 0;
  private previousElapsed = 0;
  private readonly firedBurstKeys = new Set<string>();
  private prewarmed = false;

  constructor(options: ParticleSystemOptions) {
    this.layer = options.layer;
    this.store = new ParticleStore(options.layer.emitter.maxParticles);
    this.spawnStream = deriveStream(options.projectSeed, `particles:${options.layer.id}:spawn`);
    this.burstStream = deriveStream(options.projectSeed, `particles:${options.layer.id}:burst`);
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
    this.previousElapsed = 0;
    this.firedBurstKeys.clear();
    this.prewarmed = false;
  }

  seek(time: number): void {
    this.reset();
    this.elapsed = Math.max(0, time);
    this.previousElapsed = this.elapsed;
  }

  simulate(dt: number): void {
    if (!this.layer.enabled || dt <= 0) {
      return;
    }

    this.runPrewarmIfNeeded();

    this.previousElapsed = this.elapsed;
    this.elapsed += dt;
    this.emitParticles(dt);
    this.integrateParticles(dt);
  }

  private runPrewarmIfNeeded(): void {
    const emitter = this.layer.emitter;
    if (!emitter.prewarm || this.prewarmed || this.elapsed > 0) {
      return;
    }

    const prewarmDuration = emitter.duration ?? 1;
    const steps = Math.max(1, Math.ceil(prewarmDuration / (1 / 60)));
    const stepDt = prewarmDuration / steps;
    for (let i = 0; i < steps; i++) {
      this.previousElapsed = this.elapsed;
      this.elapsed += stepDt;
      this.emitParticles(stepDt);
      this.integrateParticles(stepDt);
    }
    this.prewarmed = true;
  }

  private emitParticles(dt: number): void {
    const emitter = this.layer.emitter;
    if (this.elapsed < emitter.startDelay) {
      return;
    }

    if (emitter.duration !== null) {
      const localTime = this.elapsed - emitter.startDelay;
      if (localTime > emitter.duration && !emitter.loop) {
        return;
      }
    }

    this.emitBursts();
    this.emitContinuous(dt);
  }

  private emitBursts(): void {
    const triggers = collectBurstTriggers(
      this.layer.emitter,
      this.previousElapsed,
      this.elapsed,
      this.firedBurstKeys,
      this.burstStream,
    );

    for (const trigger of triggers) {
      for (let i = 0; i < trigger.count; i++) {
        if (!this.spawnParticle()) {
          break;
        }
      }
    }
  }

  private emitContinuous(dt: number): void {
    const rate = this.layer.emitter.rate;
    if (rate <= 0) {
      return;
    }

    this.emissionAccumulator += rate * dt;
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

    const sampleT = this.spawnStream.next();
    const spawnPosition = sampleEmitterPosition(this.layer.emitter, this.spawnStream);
    const speed = sampleNumeric(this.layer.speed, this.spawnStream, sampleT);
    const velocity = sampleInitialVelocity(speed, this.spawnStream);
    const lifetime = Math.max(0.001, sampleNumeric(this.layer.lifetime, this.spawnStream, sampleT));
    const size = Math.max(0.001, sampleNumeric(this.layer.size, this.spawnStream, sampleT));
    const opacity = Math.min(
      1,
      Math.max(0, sampleNumeric(this.layer.initialOpacity, this.spawnStream, sampleT)),
    );
    const [r, g, b, a] = sampleColor(this.layer.color, this.spawnStream, sampleT);

    const p = this.store.positionOffset(index);
    this.store.position[p] = spawnPosition.x;
    this.store.position[p + 1] = spawnPosition.y;
    this.store.position[p + 2] = spawnPosition.z;

    const vo = this.store.positionOffset(index);
    this.store.velocity[vo] = velocity.x;
    this.store.velocity[vo + 1] = velocity.y;
    this.store.velocity[vo + 2] = velocity.z;

    this.store.age[index] = 0;
    this.store.lifetime[index] = lifetime;
    this.store.baseSize[index] = size;
    this.store.size[index] = size;
    this.store.baseOpacity[index] = a * opacity;

    const c = this.store.colorOffset(index);
    this.store.color[c] = r;
    this.store.color[c + 1] = g;
    this.store.color[c + 2] = b;
    this.store.color[c + 3] = this.store.baseOpacity[index]!;

    applyLifetimeCurves(
      this.store,
      index,
      this.layer.sizeOverLifetime,
      this.layer.opacityOverLifetime,
    );

    return true;
  }

  private integrateParticles(dt: number): void {
    const behaviors = this.layer.behaviors;
    const sizeCurve = this.layer.sizeOverLifetime;
    const opacityCurve = this.layer.opacityOverLifetime;

    this.store.forEachAlive((index) => {
      const age = this.store.age[index]! + dt;
      this.store.age[index] = age;
      if (age >= this.store.lifetime[index]!) {
        this.store.kill(index);
        return;
      }

      applyBehaviors(this.store, index, behaviors, dt);
      applyLifetimeCurves(this.store, index, sizeCurve, opacityCurve);
    });
  }
}

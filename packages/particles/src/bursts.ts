import type { Burst, ParticleEmitter } from "@effectforge/schema";
import type { RandomStream } from "@effectforge/core/prng";

export interface BurstTrigger {
  burstIndex: number;
  cycle: number;
  count: number;
}

export function getEmitterLocalTime(elapsed: number, emitter: ParticleEmitter): number {
  const local = elapsed - emitter.startDelay;
  if (local < 0) {
    return -1;
  }
  if (emitter.duration !== null && emitter.loop && emitter.duration > 0) {
    return local % emitter.duration;
  }
  return local;
}

export function getEmitterLoopIndex(elapsed: number, emitter: ParticleEmitter): number {
  const local = elapsed - emitter.startDelay;
  if (local < 0 || emitter.duration === null || !emitter.loop || emitter.duration <= 0) {
    return 0;
  }
  return Math.floor(local / emitter.duration);
}

function isTriggerInWindow(
  triggerTime: number,
  previousLocalTime: number,
  currentLocalTime: number,
  wrapped: boolean,
): boolean {
  if (!wrapped) {
    return triggerTime > previousLocalTime && triggerTime <= currentLocalTime;
  }
  return triggerTime > previousLocalTime || triggerTime <= currentLocalTime;
}

/** Collect burst triggers that fire within the elapsed time step. */
export function collectBurstTriggers(
  emitter: ParticleEmitter,
  previousElapsed: number,
  currentElapsed: number,
  firedKeys: Set<string>,
  stream: RandomStream,
): BurstTrigger[] {
  if (currentElapsed <= previousElapsed || emitter.bursts.length === 0) {
    return [];
  }

  const previousLocal = getEmitterLocalTime(previousElapsed, emitter);
  const currentLocal = getEmitterLocalTime(currentElapsed, emitter);
  if (currentLocal < 0) {
    return [];
  }

  const wrapped =
    emitter.loop &&
    emitter.duration !== null &&
    emitter.duration > 0 &&
    previousLocal >= 0 &&
    previousLocal > currentLocal;

  const loopIndex = getEmitterLoopIndex(currentElapsed, emitter);
  const triggers: BurstTrigger[] = [];

  for (let burstIndex = 0; burstIndex < emitter.bursts.length; burstIndex++) {
    const burst = emitter.bursts[burstIndex] as Burst;
    for (let cycle = 0; cycle < burst.cycles; cycle++) {
      const triggerTime = burst.time + cycle * burst.interval;
      const previousForCompare = previousLocal < 0 ? -Number.EPSILON : previousLocal;

      if (!isTriggerInWindow(triggerTime, previousForCompare, currentLocal, wrapped)) {
        continue;
      }

      const key = `${loopIndex}:${burstIndex}:${cycle}`;
      if (firedKeys.has(key)) {
        continue;
      }

      firedKeys.add(key);
      if (stream.next() > burst.probability) {
        continue;
      }

      triggers.push({ burstIndex, cycle, count: burst.count });
    }
  }

  return triggers;
}

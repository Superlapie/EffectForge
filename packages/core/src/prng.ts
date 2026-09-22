/**
 * Mulberry32 deterministic PRNG.
 * Never use Math.random() in effect simulation — always use streams derived from project seed.
 */
export interface RandomStream {
  /** Returns a float in [0, 1). */
  next(): number;
  /** Returns an integer in [min, max] inclusive. */
  nextInt(min: number, max: number): number;
  /** Returns a float in [min, max). */
  nextRange(min: number, max: number): number;
  /** Fork a child stream with a distinct sub-seed. */
  fork(subSeed: number): RandomStream;
  /** Current internal state for debugging/reproducibility. */
  getState(): number;
}

export function createRandomStream(seed: number): RandomStream {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const stream: RandomStream = {
    next,
    nextInt(min: number, max: number): number {
      const lo = Math.ceil(min);
      const hi = Math.floor(max);
      return Math.floor(next() * (hi - lo + 1)) + lo;
    },
    nextRange(min: number, max: number): number {
      return min + next() * (max - min);
    },
    fork(subSeed: number): RandomStream {
      const combined = (state ^ (subSeed * 0x9e3779b9)) >>> 0;
      return createRandomStream(combined);
    },
    getState(): number {
      return state;
    },
  };

  return stream;
}

/** Derive a project-level seed stream for a named subsystem. */
export function deriveStream(projectSeed: number, namespace: string): RandomStream {
  let hash = projectSeed >>> 0;
  for (let i = 0; i < namespace.length; i++) {
    hash = Math.imul(hash ^ namespace.charCodeAt(i), 0x5bd1e995);
    hash ^= hash >>> 13;
  }
  return createRandomStream(hash >>> 0);
}

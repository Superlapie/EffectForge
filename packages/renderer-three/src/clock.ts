export interface SimulationClockOptions {
  /** Fixed simulation timestep in seconds (default 1/60). */
  fixedTimestep?: number;
  /** Maximum substeps per frame to avoid spiral-of-death (default 8). */
  maxSubSteps?: number;
}

export interface SimulationTickResult {
  steps: number;
  consumedDelta: number;
  time: number;
}

/**
 * Deterministic fixed-timestep simulation clock.
 * Separates wall-clock frame deltas from quantized simulation steps.
 */
export class SimulationClock {
  private readonly fixedTimestep: number;
  private readonly maxSubSteps: number;
  private time = 0;
  private accumulator = 0;
  private playing = false;

  constructor(options: SimulationClockOptions = {}) {
    this.fixedTimestep = options.fixedTimestep ?? 1 / 60;
    this.maxSubSteps = options.maxSubSteps ?? 8;
  }

  getFixedTimestep(): number {
    return this.fixedTimestep;
  }

  getTime(): number {
    return this.time;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  play(): void {
    this.playing = true;
  }

  pause(): void {
    this.playing = false;
  }

  stop(): void {
    this.playing = false;
    this.time = 0;
    this.accumulator = 0;
  }

  seek(time: number): void {
    this.time = Math.max(0, time);
    this.accumulator = 0;
  }

  /** Advance simulation by an exact delta (deterministic, bypasses accumulator). */
  step(delta: number): void {
    if (delta <= 0) {
      return;
    }
    this.time += delta;
  }

  /**
   * Consume a frame delta while playing, emitting fixed substeps.
   * Returns how many substeps ran and how much wall time was consumed.
   */
  tick(
    frameDelta: number,
    onSubStep: (dt: number, timeAfterStep: number) => void,
  ): SimulationTickResult {
    if (!this.playing || frameDelta <= 0) {
      return { steps: 0, consumedDelta: 0, time: this.time };
    }

    this.accumulator += frameDelta;
    let steps = 0;
    let consumed = 0;

    while (this.accumulator >= this.fixedTimestep && steps < this.maxSubSteps) {
      this.accumulator -= this.fixedTimestep;
      this.time += this.fixedTimestep;
      consumed += this.fixedTimestep;
      steps += 1;
      onSubStep(this.fixedTimestep, this.time);
    }

    return { steps, consumedDelta: consumed, time: this.time };
  }
}

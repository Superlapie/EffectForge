import { describe, expect, it } from "vitest";
import { SimulationClock } from "./clock.js";

describe("SimulationClock", () => {
  it("starts stopped at time zero", () => {
    const clock = new SimulationClock();
    expect(clock.getTime()).toBe(0);
    expect(clock.isPlaying()).toBe(false);
  });

  it("step advances time deterministically", () => {
    const clock = new SimulationClock({ fixedTimestep: 1 / 60 });
    clock.step(1 / 60);
    clock.step(1 / 60);
    expect(clock.getTime()).toBeCloseTo(2 / 60, 8);
  });

  it("seek sets absolute time and clears accumulator", () => {
    const clock = new SimulationClock({ fixedTimestep: 1 / 60 });
    clock.play();
    clock.tick(1, () => undefined);
    clock.seek(2.5);
    expect(clock.getTime()).toBe(2.5);
  });

  it("stop resets time and playback state", () => {
    const clock = new SimulationClock();
    clock.play();
    clock.step(1);
    clock.stop();
    expect(clock.getTime()).toBe(0);
    expect(clock.isPlaying()).toBe(false);
  });

  it("tick emits fixed substeps while playing", () => {
    const clock = new SimulationClock({ fixedTimestep: 0.1, maxSubSteps: 10 });
    const steps: number[] = [];
    clock.play();

    const result = clock.tick(0.35, (dt, time) => {
      steps.push(dt);
      expect(time).toBeGreaterThan(0);
    });

    expect(result.steps).toBe(3);
    expect(steps).toEqual([0.1, 0.1, 0.1]);
    expect(clock.getTime()).toBeCloseTo(0.3, 8);
  });

  it("tick respects maxSubSteps cap", () => {
    const clock = new SimulationClock({ fixedTimestep: 0.1, maxSubSteps: 2 });
    clock.play();
    const result = clock.tick(1, () => undefined);
    expect(result.steps).toBe(2);
    expect(clock.getTime()).toBeCloseTo(0.2, 8);
  });

  it("tick does nothing when paused", () => {
    const clock = new SimulationClock({ fixedTimestep: 0.1 });
    const result = clock.tick(0.5, () => undefined);
    expect(result.steps).toBe(0);
    expect(clock.getTime()).toBe(0);
  });
});

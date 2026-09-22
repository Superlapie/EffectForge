import { createDefaultParticleLayer } from "@effectforge/core";
import { ParticleSystem } from "@effectforge/particles";

const FRAMES = 300;
const DT = 1 / 60;
const PARTICLE_COUNT = 10_000;

function fillStore(system) {
  const capacity = system.store.capacity;
  for (let i = 0; i < capacity; i++) {
    const index = system.store.spawn();
    if (index === null) {
      break;
    }
    const t = i / capacity;
    const p = system.store.positionOffset(index);
    system.store.position[p] = (t - 0.5) * 2;
    system.store.position[p + 1] = ((1 - t) - 0.5) * 2;
    system.store.position[p + 2] = 0;
    system.store.velocity[p] = (t - 0.5) * 0.5;
    system.store.velocity[p + 1] = ((1 - t) - 0.5) * 0.5;
    system.store.velocity[p + 2] = 0;
    system.store.age[index] = 0;
    system.store.lifetime[index] = 60;
    system.store.size[index] = 0.02;
    const c = system.store.colorOffset(index);
    system.store.color[c] = 1;
    system.store.color[c + 1] = 1;
    system.store.color[c + 2] = 1;
    system.store.color[c + 3] = 1;
  }
  system.layer.emitter.rate = 0;
}

function runBenchmark() {
  const layer = createDefaultParticleLayer("Benchmark");
  layer.emitter.maxParticles = PARTICLE_COUNT;
  layer.emitter.rate = 0;
  layer.behaviors = [
    { type: "gravity", strength: -0.8 },
    { type: "drag", coefficient: 0.05 },
  ];

  const system = new ParticleSystem({ layer, projectSeed: 2024 });
  fillStore(system);
  const filledCount = system.activeCount;

  const start = performance.now();
  for (let frame = 0; frame < FRAMES; frame++) {
    system.simulate(DT);
  }
  const elapsed = performance.now() - start;
  const msPerFrame = elapsed / FRAMES;

  console.log("EffectForge particle simulation benchmark");
  console.log(`  particles: ${system.activeCount}`);
  console.log(`  frames:    ${FRAMES}`);
  console.log(`  total:     ${elapsed.toFixed(2)} ms`);
  console.log(`  per frame: ${msPerFrame.toFixed(3)} ms`);
  console.log(`  fps equiv: ${(1000 / msPerFrame).toFixed(1)}`);
}

runBenchmark();

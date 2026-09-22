import type { ParticleStore } from "@effectforge/particles";
import {
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  ShaderMaterial,
} from "three";

const PARTICLE_VERTEX_SHADER = `
  attribute vec3 instanceColor;
  attribute float instanceAlpha;
  attribute float instanceSize;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = instanceColor;
    vAlpha = instanceAlpha;
    vec4 worldPosition = instanceMatrix * vec4(position * instanceSize, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
  }
`;

const PARTICLE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

/** GPU instanced billboard mesh synced from a particle store. */
export class ParticleInstancedMesh {
  readonly mesh: InstancedMesh;
  private readonly maxParticles: number;
  private readonly colorAttr: InstancedBufferAttribute;
  private readonly alphaAttr: InstancedBufferAttribute;
  private readonly sizeAttr: InstancedBufferAttribute;
  private readonly scratchMatrix = new Matrix4();
  private visibleCount = 0;

  constructor(maxParticles: number) {
    const geometry = new PlaneGeometry(1, 1);
    this.colorAttr = new InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3);
    this.alphaAttr = new InstancedBufferAttribute(new Float32Array(maxParticles), 1);
    this.sizeAttr = new InstancedBufferAttribute(new Float32Array(maxParticles), 1);
    geometry.setAttribute("instanceColor", this.colorAttr);
    geometry.setAttribute("instanceAlpha", this.alphaAttr);
    geometry.setAttribute("instanceSize", this.sizeAttr);

    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
    });

    this.mesh = new InstancedMesh(geometry, material, maxParticles);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.maxParticles = maxParticles;
    this.mesh.count = 0;
  }

  get count(): number {
    return this.visibleCount;
  }

  syncFromStore(store: ParticleStore, layerOpacity: number): number {
    let writeIndex = 0;

    store.forEachAlive((particleIndex) => {
      if (writeIndex >= this.maxParticles) {
        return;
      }

      const p = store.positionOffset(particleIndex);
      const c = store.colorOffset(particleIndex);
      const x = store.position[p]!;
      const y = store.position[p + 1]!;
      const z = store.position[p + 2]!;
      const size = store.size[particleIndex]!;

      this.scratchMatrix.makeTranslation(x, y, z);
      this.mesh.setMatrixAt(writeIndex, this.scratchMatrix);
      this.colorAttr.setXYZ(
        writeIndex,
        store.color[c]!,
        store.color[c + 1]!,
        store.color[c + 2]!,
      );
      this.alphaAttr.setX(writeIndex, store.color[c + 3]! * layerOpacity);
      this.sizeAttr.setX(writeIndex, size);
      writeIndex += 1;
    });

    this.mesh.count = writeIndex;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.colorAttr.needsUpdate = true;
    this.alphaAttr.needsUpdate = true;
    this.sizeAttr.needsUpdate = true;
    this.visibleCount = writeIndex;
    return writeIndex;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    const material = this.mesh.material;
    if (material instanceof ShaderMaterial) {
      material.dispose();
    }
  }
}

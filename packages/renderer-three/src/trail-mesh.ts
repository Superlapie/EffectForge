import { evaluateColorGradient, evaluateParameterCurve } from "@effectforge/particles";
import type { TrailStore } from "@effectforge/trails";
import { trailWidthToWorld } from "@effectforge/trails";
import type { TrailLayer } from "@effectforge/schema";
import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Mesh,
  ShaderMaterial,
} from "three";

const TRAIL_VERTEX_SHADER = `
  attribute vec3 trailColor;
  attribute float trailAlpha;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = trailColor;
    vAlpha = trailAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TRAIL_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

const DEFAULT_GRADIENT = {
  colorStops: [
    { position: 0, color: "#88ccff" },
    { position: 1, color: "#ffffff" },
  ],
  alphaStops: [
    { position: 0, alpha: 0 },
    { position: 1, alpha: 1 },
  ],
};

/** Ribbon mesh synced from a trail point store. */
export class TrailMesh {
  readonly mesh: Mesh;
  private readonly maxPoints: number;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;
  private readonly alphas: Float32Array;
  private readonly indices: Uint16Array;
  private visibleVertices = 0;

  constructor(maxPoints: number) {
    const vertexCapacity = maxPoints * 2;
    this.maxPoints = maxPoints;
    this.positions = new Float32Array(vertexCapacity * 3);
    this.colors = new Float32Array(vertexCapacity * 3);
    this.alphas = new Float32Array(vertexCapacity);
    this.indices = new Uint16Array((maxPoints - 1) * 6);

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(this.positions, 3));
    geometry.setAttribute("trailColor", new BufferAttribute(this.colors, 3));
    geometry.setAttribute("trailAlpha", new BufferAttribute(this.alphas, 1));
    geometry.setIndex(new BufferAttribute(this.indices, 1));

    const positionAttr = geometry.getAttribute("position") as BufferAttribute;
    const colorAttr = geometry.getAttribute("trailColor") as BufferAttribute;
    const alphaAttr = geometry.getAttribute("trailAlpha") as BufferAttribute;
    positionAttr.setUsage(DynamicDrawUsage);
    colorAttr.setUsage(DynamicDrawUsage);
    alphaAttr.setUsage(DynamicDrawUsage);

    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: TRAIL_VERTEX_SHADER,
      fragmentShader: TRAIL_FRAGMENT_SHADER,
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.frustumCulled = false;
  }

  syncFromStore(store: TrailStore, layer: TrailLayer): number {
    const count = store.pointCount;
    if (count < 2) {
      this.visibleVertices = 0;
      this.mesh.visible = false;
      this.mesh.geometry.setDrawRange(0, 0);
      return 0;
    }

    this.mesh.visible = true;
    const gradient = layer.colorGradient ?? DEFAULT_GRADIENT;
    let vertexIndex = 0;
    let indexOffset = 0;

    for (let pointIndex = 0; pointIndex < count; pointIndex += 1) {
      const point = store.getPoint(pointIndex);
      if (!point) {
        continue;
      }

      const normalized = count <= 1 ? 1 : pointIndex / (count - 1);
      const width = trailWidthToWorld(layer.width) *
        evaluateParameterCurve(layer.widthOverLifetime ?? { type: "constant", value: 1 }, normalized);
      const [r, g, b, alpha] = evaluateColorGradient(gradient, normalized);
      const fade = Math.pow(layer.fade, 1 - normalized);
      const finalAlpha = alpha * fade * layer.opacity;

      let tangentX = 0;
      let tangentY = 1;
      if (pointIndex < count - 1) {
        const next = store.getPoint(pointIndex + 1);
        if (next) {
          tangentX = next.x - point.x;
          tangentY = next.y - point.y;
        }
      } else if (pointIndex > 0) {
        const previous = store.getPoint(pointIndex - 1);
        if (previous) {
          tangentX = point.x - previous.x;
          tangentY = point.y - previous.y;
        }
      }

      const length = Math.hypot(tangentX, tangentY) || 1;
      const normalX = -tangentY / length;
      const normalY = tangentX / length;
      const halfWidth = width * 0.5;

      this.writeVertex(vertexIndex, point.x + normalX * halfWidth, point.y + normalY * halfWidth, point.z, r, g, b, finalAlpha);
      vertexIndex += 1;
      this.writeVertex(vertexIndex, point.x - normalX * halfWidth, point.y - normalY * halfWidth, point.z, r, g, b, finalAlpha);
      vertexIndex += 1;

      if (pointIndex < count - 1) {
        const base = pointIndex * 2;
        this.indices[indexOffset++] = base;
        this.indices[indexOffset++] = base + 1;
        this.indices[indexOffset++] = base + 2;
        this.indices[indexOffset++] = base + 1;
        this.indices[indexOffset++] = base + 3;
        this.indices[indexOffset++] = base + 2;
      }
    }

    this.visibleVertices = vertexIndex;
    const geometry = this.mesh.geometry;
    geometry.setDrawRange(0, indexOffset);
    geometry.getAttribute("position")!.needsUpdate = true;
    geometry.getAttribute("trailColor")!.needsUpdate = true;
    geometry.getAttribute("trailAlpha")!.needsUpdate = true;
    geometry.index!.needsUpdate = true;
    geometry.computeBoundingSphere();

    return count;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    const material = this.mesh.material;
    if (material instanceof ShaderMaterial) {
      material.dispose();
    }
  }

  private writeVertex(
    index: number,
    x: number,
    y: number,
    z: number,
    r: number,
    g: number,
    b: number,
    alpha: number,
  ): void {
    const positionOffset = index * 3;
    this.positions[positionOffset] = x;
    this.positions[positionOffset + 1] = y;
    this.positions[positionOffset + 2] = z;
    this.colors[positionOffset] = r;
    this.colors[positionOffset + 1] = g;
    this.colors[positionOffset + 2] = b;
    this.alphas[index] = alpha;
  }
}

import type { ResolvedDistortionLayer } from "@effectforge/distortion";
import type { DistortionLayer } from "@effectforge/schema";
import type { Texture, WebGLRenderer } from "three";
import {
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three";

type DistortionEffect = DistortionLayer["effect"];

const SCREEN_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const COPY_FRAGMENT_SHADER = `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(tDiffuse, vUv);
  }
`;

function createFragmentShader(effect: DistortionEffect): string {
  switch (effect.type) {
    case "ripple":
      return `
        uniform sampler2D tDiffuse;
        uniform float uAmplitude;
        uniform float uFrequency;
        uniform float uSpeed;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          float wave = sin((uv.y - uTime * uSpeed * 0.1) * uFrequency) * uAmplitude;
          vec2 displaced = uv + vec2(wave, sin((uv.x + uTime * uSpeed * 0.08) * uFrequency) * uAmplitude * 0.5);
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, displaced);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    case "heat-haze":
      return `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uSpeed;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec2 uv = vUv;
          float n1 = hash(uv * 40.0 + vec2(uTime * uSpeed * 0.2, 0.0));
          float n2 = hash(uv * 40.0 + vec2(0.0, uTime * uSpeed * 0.15));
          vec2 offset = vec2(n1 - 0.5, n2 - 0.5) * uIntensity * 0.03;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, uv + offset);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    case "liquid":
      return `
        uniform sampler2D tDiffuse;
        uniform float uViscosity;
        uniform float uRippleStrength;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec2 uv = vUv;
          float ripple = sin(length(uv - 0.5) * 30.0 - uTime * 2.0) * uRippleStrength * 0.02;
          float noise = (hash(uv * 20.0 + uTime * 0.5) - 0.5) * (1.0 - uViscosity) * 0.02;
          vec2 displaced = uv + normalize(uv - 0.5) * ripple + vec2(noise);
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, displaced);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    case "lens":
      return `
        uniform sampler2D tDiffuse;
        uniform float uStrength;
        uniform float uRadius;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5);
          vec2 dir = vUv - center;
          float dist = length(dir);
          float factor = smoothstep(uRadius, 0.0, dist) * uStrength * 0.15;
          vec2 displaced = vUv - normalize(dir + 0.0001) * factor;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, displaced);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    case "chromatic-warp":
      return `
        uniform sampler2D tDiffuse;
        uniform float uOffset;
        uniform float uAngle;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 dir = vec2(cos(uAngle), sin(uAngle));
          vec2 uvR = vUv + dir * uOffset;
          vec2 uvG = vUv;
          vec2 uvB = vUv - dir * uOffset;
          float r = texture2D(tDiffuse, uvR).r;
          float g = texture2D(tDiffuse, uvG).g;
          float b = texture2D(tDiffuse, uvB).b;
          float a = texture2D(tDiffuse, vUv).a;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = vec4(r, g, b, a);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    case "glitch-displacement":
      return `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uBlockSize;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        float hash(float n) {
          return fract(sin(n) * 43758.5453123);
        }

        void main() {
          vec2 uv = vUv;
          float row = floor(uv.y * (720.0 / uBlockSize));
          float jump = step(0.9, hash(row + floor(uTime * 8.0))) * uIntensity * 0.08;
          vec2 displaced = uv + vec2(jump, 0.0);
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, displaced);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    case "pixel-displacement":
      return `
        uniform sampler2D tDiffuse;
        uniform float uBlockSize;
        uniform float uIntensity;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec2 pixelSize = vec2(uBlockSize) / vec2(textureSize(tDiffuse, 0));
          vec2 blockUv = floor(vUv / pixelSize) * pixelSize + pixelSize * 0.5;
          vec2 offset = (hash(blockUv + uTime) - 0.5) * uIntensity * pixelSize * 4.0;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, blockUv + offset);
          gl_FragColor = mix(base, warped, uOpacity);
        }
      `;
    default:
      return COPY_FRAGMENT_SHADER;
  }
}

function setUniform(material: ShaderMaterial, name: string, value: unknown): void {
  const uniform = material.uniforms[name];
  if (uniform) {
    uniform.value = value;
  }
}

function applyUniforms(
  material: ShaderMaterial,
  effect: DistortionEffect,
  opacity: number,
  time: number,
): void {
  setUniform(material, "uOpacity", opacity);
  setUniform(material, "uTime", time);

  switch (effect.type) {
    case "ripple":
      setUniform(material, "uAmplitude", effect.amplitude);
      setUniform(material, "uFrequency", effect.frequency);
      setUniform(material, "uSpeed", effect.speed);
      break;
    case "heat-haze":
      setUniform(material, "uIntensity", effect.intensity);
      setUniform(material, "uSpeed", effect.speed);
      break;
    case "liquid":
      setUniform(material, "uViscosity", effect.viscosity);
      setUniform(material, "uRippleStrength", effect.rippleStrength);
      break;
    case "lens":
      setUniform(material, "uStrength", effect.strength);
      setUniform(material, "uRadius", effect.radius);
      break;
    case "chromatic-warp":
      setUniform(material, "uOffset", effect.offset);
      setUniform(material, "uAngle", effect.angle);
      break;
    case "glitch-displacement":
      setUniform(material, "uIntensity", effect.intensity);
      setUniform(material, "uBlockSize", effect.blockSize);
      break;
    case "pixel-displacement":
      setUniform(material, "uBlockSize", effect.blockSize);
      setUniform(material, "uIntensity", effect.intensity);
      break;
    default:
      break;
  }
}

function defaultUniforms(): Record<string, { value: unknown }> {
  return {
    tDiffuse: { value: null },
    uOpacity: { value: 1 },
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uFrequency: { value: 1 },
    uSpeed: { value: 1 },
    uIntensity: { value: 0 },
    uViscosity: { value: 0.5 },
    uRippleStrength: { value: 0 },
    uStrength: { value: 0 },
    uRadius: { value: 0.3 },
    uOffset: { value: 0 },
    uAngle: { value: 0 },
    uBlockSize: { value: 8 },
  };
}

interface EffectPass {
  material: ShaderMaterial;
  mesh: Mesh;
}

/** Applies enabled distortion layers as fullscreen displacement passes after the main scene render. */
export class DistortionPipeline {
  private readonly screenScene = new Scene();
  private readonly screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readBuffer: WebGLRenderTarget;
  private writeBuffer: WebGLRenderTarget;
  private readonly copyPass: EffectPass;
  private readonly passCache = new Map<string, EffectPass>();
  private layers: ResolvedDistortionLayer[] = [];
  private width = 1;
  private height = 1;

  constructor(width: number, height: number) {
    this.readBuffer = this.createTarget(width, height);
    this.writeBuffer = this.createTarget(width, height);
    this.copyPass = this.createPass(COPY_FRAGMENT_SHADER, defaultUniforms());
    this.setSize(width, height);
  }

  get activeLayerCount(): number {
    return this.layers.length;
  }

  setLayers(layers: ResolvedDistortionLayer[]): void {
    this.layers = layers;
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.readBuffer.setSize(this.width, this.height);
    this.writeBuffer.setSize(this.width, this.height);
  }

  /**
   * Render the scene to an offscreen buffer, apply distortion passes, and present to screen.
   * Returns the final texture when `presentToScreen` is false.
   */
  render(
    webgl: WebGLRenderer,
    renderScene: () => void,
    time: number,
    presentToScreen = true,
  ): Texture {
    if (this.layers.length === 0) {
      if (presentToScreen) {
        renderScene();
      }
      return this.readBuffer.texture;
    }

    webgl.setRenderTarget(this.readBuffer);
    webgl.clear();
    renderScene();

    const output = this.applyPasses(webgl, this.readBuffer.texture, time);

    if (presentToScreen) {
      setUniform(this.copyPass.material, "tDiffuse", output);
      webgl.setRenderTarget(null);
      this.renderPass(webgl, this.copyPass);
    }

    return output;
  }

  /** Apply distortion passes to an existing input texture. */
  applyPasses(webgl: WebGLRenderer, inputTexture: Texture, time: number): Texture {
    let currentTexture = inputTexture;

    for (const { layer, effect } of this.layers) {
      const pass = this.getPassForEffect(effect);
      setUniform(pass.material, "tDiffuse", currentTexture);
      applyUniforms(pass.material, effect, layer.opacity, time);

      webgl.setRenderTarget(this.writeBuffer);
      webgl.clear();
      this.renderPass(webgl, pass);

      currentTexture = this.writeBuffer.texture;
      this.swapBuffers();
    }

    return currentTexture;
  }

  dispose(): void {
    this.readBuffer.dispose();
    this.writeBuffer.dispose();
    this.copyPass.material.dispose();
    this.copyPass.mesh.geometry.dispose();
    for (const pass of this.passCache.values()) {
      pass.material.dispose();
      pass.mesh.geometry.dispose();
    }
    this.passCache.clear();
  }

  private renderPass(webgl: WebGLRenderer, pass: EffectPass): void {
    this.screenScene.clear();
    this.screenScene.add(pass.mesh);
    webgl.render(this.screenScene, this.screenCamera);
  }

  private swapBuffers(): void {
    const temp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = temp;
  }

  private createTarget(width: number, height: number): WebGLRenderTarget {
    return new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
    });
  }

  private createPass(
    fragmentShader: string,
    uniforms: Record<string, { value: unknown }>,
  ): EffectPass {
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: SCREEN_VERTEX_SHADER,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    return { material, mesh };
  }

  private getPassForEffect(effect: DistortionEffect): EffectPass {
    const cached = this.passCache.get(effect.type);
    if (cached) {
      return cached;
    }

    const pass = this.createPass(createFragmentShader(effect), defaultUniforms());
    this.passCache.set(effect.type, pass);
    return pass;
  }
}

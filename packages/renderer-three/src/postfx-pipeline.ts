import type { ResolvedPostFxLayer } from "@effectforge/postfx";
import type { PostFxLayer } from "@effectforge/schema";

type PostEffect = PostFxLayer["effect"];
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

function createFragmentShader(effect: PostEffect): string {
  switch (effect.type) {
    case "bloom":
      return `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uThreshold;
        uniform float uOpacity;
        uniform vec2 uTexelSize;
        varying vec2 vUv;

        void main() {
          vec4 base = texture2D(tDiffuse, vUv);
          vec3 glow = vec3(0.0);
          for (int x = -2; x <= 2; x++) {
            for (int y = -2; y <= 2; y++) {
              vec2 offset = vec2(float(x), float(y)) * uTexelSize * 2.5;
              vec4 sampleColor = texture2D(tDiffuse, vUv + offset);
              float brightness = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
              glow += max(brightness - uThreshold, 0.0) * sampleColor.rgb;
            }
          }
          glow /= 25.0;
          vec3 bloomed = base.rgb + glow * uIntensity;
          gl_FragColor = vec4(mix(base.rgb, bloomed, uOpacity), base.a);
        }
      `;
    case "vignette":
      return `
        uniform sampler2D tDiffuse;
        uniform float uDarkness;
        uniform float uOffset;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec4 base = texture2D(tDiffuse, vUv);
          float dist = distance(vUv, vec2(0.5));
          float vignette = smoothstep(uOffset + 0.35, uOffset - 0.1, dist);
          vec3 shaded = base.rgb * mix(1.0, 1.0 - uDarkness, vignette);
          gl_FragColor = vec4(mix(base.rgb, shaded, uOpacity), base.a);
        }
      `;
    case "chromatic-aberration":
      return `
        uniform sampler2D tDiffuse;
        uniform float uOffset;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 dir = vUv - 0.5;
          float r = texture2D(tDiffuse, vUv + dir * uOffset).r;
          float g = texture2D(tDiffuse, vUv).g;
          float b = texture2D(tDiffuse, vUv - dir * uOffset).b;
          float a = texture2D(tDiffuse, vUv).a;
          vec4 shifted = vec4(r, g, b, a);
          vec4 base = texture2D(tDiffuse, vUv);
          gl_FragColor = mix(base, shifted, uOpacity);
        }
      `;
    case "noise":
      return `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec4 base = texture2D(tDiffuse, vUv);
          float grain = hash(vUv * 1200.0 + uTime) - 0.5;
          vec3 noisy = base.rgb + grain * uIntensity;
          gl_FragColor = vec4(mix(base.rgb, noisy, uOpacity), base.a);
        }
      `;
    case "glitch":
      return `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          float row = floor(uv.y * 80.0);
          float jump = step(0.92, fract(sin(row * 12.9898 + uTime * 6.0) * 43758.5453)) * uIntensity * 0.05;
          uv.x += jump;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 glitched = texture2D(tDiffuse, uv);
          gl_FragColor = mix(base, glitched, uOpacity);
        }
      `;
    case "pixelation":
      return `
        uniform sampler2D tDiffuse;
        uniform float uGranularity;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 pixelSize = vec2(uGranularity) / vec2(textureSize(tDiffuse, 0));
          vec2 uv = floor(vUv / pixelSize) * pixelSize + pixelSize * 0.5;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 pixelated = texture2D(tDiffuse, uv);
          gl_FragColor = mix(base, pixelated, uOpacity);
        }
      `;
    case "shockwave":
      return `
        uniform sampler2D tDiffuse;
        uniform vec2 uCenter;
        uniform float uSpeed;
        uniform float uAmplitude;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 center = uCenter;
          float dist = distance(vUv, center);
          float wave = sin((dist - uTime * uSpeed * 0.15) * 40.0) * uAmplitude * 0.02;
          vec2 uv = vUv + normalize(vUv - center) * wave;
          vec4 base = texture2D(tDiffuse, vUv);
          vec4 warped = texture2D(tDiffuse, uv);
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
  effect: PostEffect,
  opacity: number,
  time: number,
  width: number,
  height: number,
): void {
  setUniform(material, "uOpacity", opacity);
  setUniform(material, "uTime", time);
  setUniform(material, "uTexelSize", {
    x: 1 / Math.max(1, width),
    y: 1 / Math.max(1, height),
  });

  switch (effect.type) {
    case "bloom":
      setUniform(material, "uIntensity", effect.intensity);
      setUniform(material, "uThreshold", effect.threshold);
      break;
    case "vignette":
      setUniform(material, "uDarkness", effect.darkness);
      setUniform(material, "uOffset", effect.offset);
      break;
    case "chromatic-aberration":
      setUniform(material, "uOffset", effect.offset);
      break;
    case "noise":
    case "glitch":
      setUniform(material, "uIntensity", effect.intensity);
      break;
    case "pixelation":
      setUniform(material, "uGranularity", effect.granularity);
      break;
    case "shockwave":
      setUniform(material, "uCenter", { x: effect.center.x, y: effect.center.y });
      setUniform(material, "uSpeed", effect.speed);
      setUniform(material, "uAmplitude", effect.amplitude);
      break;
    default:
      break;
  }
}

function defaultUniforms(width: number, height: number): Record<string, { value: unknown }> {
  return {
    tDiffuse: { value: null },
    uOpacity: { value: 1 },
    uTexelSize: { value: { x: 1 / Math.max(1, width), y: 1 / Math.max(1, height) } },
    uTime: { value: 0 },
    uIntensity: { value: 0 },
    uThreshold: { value: 0 },
    uDarkness: { value: 0 },
    uOffset: { value: 0 },
    uGranularity: { value: 8 },
    uCenter: { value: { x: 0.5, y: 0.5 } },
    uSpeed: { value: 1 },
    uAmplitude: { value: 0 },
  };
}

interface EffectPass {
  material: ShaderMaterial;
  mesh: Mesh;
}

/** Applies enabled postfx layers as fullscreen passes after the main scene render. */
export class PostFxPipeline {
  private readonly screenScene = new Scene();
  private readonly screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readBuffer: WebGLRenderTarget;
  private writeBuffer: WebGLRenderTarget;
  private readonly copyPass: EffectPass;
  private readonly passCache = new Map<string, EffectPass>();
  private layers: ResolvedPostFxLayer[] = [];
  private width = 1;
  private height = 1;

  constructor(width: number, height: number) {
    this.readBuffer = this.createTarget(width, height);
    this.writeBuffer = this.createTarget(width, height);
    this.copyPass = this.createPass(COPY_FRAGMENT_SHADER, defaultUniforms(width, height));
    this.setSize(width, height);
  }

  get activeLayerCount(): number {
    return this.layers.length;
  }

  setLayers(layers: ResolvedPostFxLayer[]): void {
    this.layers = layers;
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.readBuffer.setSize(this.width, this.height);
    this.writeBuffer.setSize(this.width, this.height);
  }

  render(
    webgl: WebGLRenderer,
    renderScene: () => void,
    time: number,
  ): void {
    if (this.layers.length === 0) {
      renderScene();
      return;
    }

    webgl.setRenderTarget(this.readBuffer);
    webgl.clear();
    renderScene();

    this.renderFromTexture(webgl, this.readBuffer.texture, time);
  }

  /** Apply postfx passes to an existing input texture and present to screen. */
  renderFromTexture(webgl: WebGLRenderer, inputTexture: Texture, time: number): void {
    if (this.layers.length === 0) {
      setUniform(this.copyPass.material, "tDiffuse", inputTexture);
      webgl.setRenderTarget(null);
      this.renderPass(webgl, this.copyPass);
      return;
    }

    let currentTexture = inputTexture;

    for (const { layer, effect } of this.layers) {
      const pass = this.getPassForEffect(effect);
      setUniform(pass.material, "tDiffuse", currentTexture);
      applyUniforms(pass.material, effect, layer.opacity, time, this.width, this.height);

      webgl.setRenderTarget(this.writeBuffer);
      webgl.clear();
      this.renderPass(webgl, pass);

      currentTexture = this.writeBuffer.texture;
      this.swapBuffers();
    }

    setUniform(this.copyPass.material, "tDiffuse", currentTexture);
    webgl.setRenderTarget(null);
    this.renderPass(webgl, this.copyPass);
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

  private getPassForEffect(effect: PostEffect): EffectPass {
    const cached = this.passCache.get(effect.type);
    if (cached) {
      return cached;
    }

    const pass = this.createPass(createFragmentShader(effect), defaultUniforms(this.width, this.height));
    this.passCache.set(effect.type, pass);
    return pass;
  }
}

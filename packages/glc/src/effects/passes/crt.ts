// Ported from pixi-filters (MIT): reference/pixi-filters/src/crt
// Curved interlace lines + pixel noise + vignette. The default time advances
// one 2π phase per loop (seamless); the default seed is a deterministic hash
// of t so the noise flickers but exports stay reproducible.

import { resolveBool, resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface CrtOptions {
  /** Screen curvature bend. Default 1. */
  curvature?: ScalarParam;
  /** Interlace line width (0 disables lines). Default 1. */
  lineWidth?: ScalarParam;
  /** Interlace line contrast. Default 0.25. */
  lineContrast?: ScalarParam;
  /** Vertical instead of horizontal lines. Default false. */
  verticalLine?: boolean | ((t: number) => boolean);
  /** Noise intensity 0..1. Default 0.2. */
  noise?: ScalarParam;
  /** Noise grain size in px. Default 1. */
  noiseSize?: ScalarParam;
  /** Vignette radius 0..1 (0 disables). Default 0.3. */
  vignetting?: ScalarParam;
  /** Vignette darkness 0..1. Default 1. */
  vignettingAlpha?: ScalarParam;
  /** Vignette blur 0..1. Default 0.3. */
  vignettingBlur?: ScalarParam;
  /** Line scroll phase (animatable). Default: t * 2π (seamless loop). */
  time?: ScalarParam;
  /** Noise seed (animatable). Default: deterministic hash of t. */
  seed?: ScalarParam;
}

const DECLARATIONS = `
uniform float uCurvature;
uniform float uLineWidth;
uniform float uLineContrast;
uniform float uVerticalLine;
uniform float uNoiseAmount;
uniform float uNoiseSize;
uniform float uVignette;
uniform float uVignetteAlpha;
uniform float uVignetteBlur;
uniform float uPhase;
uniform float uSeed;

const float SQRT_2 = 1.414213;

float crtRand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

export function crt(gl: WebGL2RenderingContext, options: CrtOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      fragColor = texture(uTexture, vUv);

      if (uNoiseAmount > 0.0 && uNoiseSize > 0.0) {
        vec2 pixelCoord = floor(vUv * uResolution / uNoiseSize);
        float n = (crtRand(pixelCoord * uNoiseSize * uSeed) - 0.5) * uNoiseAmount;
        fragColor.rgb += n;
      }

      if (uVignette > 0.0) {
        float outter = SQRT_2 - uVignette * SQRT_2;
        vec2 vdir = vec2(0.5) - vUv;
        vdir.y *= uResolution.y / uResolution.x;
        float darker = clamp((outter - length(vdir) * SQRT_2) / (0.00001 + uVignetteBlur * SQRT_2), 0.0, 1.0);
        fragColor.rgb *= darker + (1.0 - darker) * (1.0 - uVignetteAlpha);
      }

      if (uLineWidth > 0.0) {
        vec2 dir = vUv - 0.5;
        float c = uCurvature > 0.0 ? uCurvature : 1.0;
        float k = uCurvature > 0.0 ? (length(dir * dir) * 0.25 * c * c + 0.935 * c) : 1.0;
        vec2 uv = dir * k;
        float v = uVerticalLine > 0.5 ? uv.x * uResolution.x : uv.y * uResolution.y;
        v *= min(1.0, 2.0 / uLineWidth) / c;
        float j = 1.0 + cos(v * 1.2 - uPhase) * 0.5 * uLineContrast;
        fragColor.rgb *= j;
        float segment = uVerticalLine > 0.5
          ? mod((dir.x + 0.5) * uResolution.x, 4.0)
          : mod((dir.y + 0.5) * uResolution.y, 4.0);
        fragColor.rgb *= 0.99 + ceil(segment) * 0.015;
      }
    `,
    {
      uCurvature: (t) => resolveScalar(options.curvature, t, 1),
      uLineWidth: (t) => resolveScalar(options.lineWidth, t, 1),
      uLineContrast: (t) => resolveScalar(options.lineContrast, t, 0.25),
      uVerticalLine: (t) => resolveBool(options.verticalLine, t, false),
      uNoiseAmount: (t) => resolveScalar(options.noise, t, 0.2),
      uNoiseSize: (t) => resolveScalar(options.noiseSize, t, 1),
      uVignette: (t) => resolveScalar(options.vignetting, t, 0.3),
      uVignetteAlpha: (t) => resolveScalar(options.vignettingAlpha, t, 1),
      uVignetteBlur: (t) => resolveScalar(options.vignettingBlur, t, 0.3),
      uPhase: (t) => resolveScalar(options.time, t, t * Math.PI * 2),
      // Deterministic per-frame seed: hash of t, never Math.random.
      uSeed: (t) => resolveScalar(options.seed, t, fractHash(t)),
    },
    DECLARATIONS
  );
}

/** Deterministic hash of t in (0..1) — the JS twin of the shader's rand(). */
export function fractHash(t: number): number {
  const x = Math.sin(t * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

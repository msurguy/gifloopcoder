// Ported from pixi-filters (MIT): reference/pixi-filters/src/old-film
// Sepia + vignette + scratches + grain. The default seed is a deterministic
// hash of t, so the film damage flickers per frame but exports reproduce.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';
import { fractHash } from './crt.js';

export interface OldFilmOptions {
  /** Sepia amount 0..1. Default 0.3. */
  sepia?: ScalarParam;
  /** Noise intensity 0..1. Default 0.3. */
  noise?: ScalarParam;
  /** Noise grain size in px. Default 1. */
  noiseSize?: ScalarParam;
  /** Scratch intensity (-1..1, sign flips direction). Default 0.5. */
  scratch?: ScalarParam;
  /** Scratch density 0..1. Default 0.3. */
  scratchDensity?: ScalarParam;
  /** Scratch width in px. Default 1. */
  scratchWidth?: ScalarParam;
  /** Vignette radius 0..1. Default 0.3. */
  vignetting?: ScalarParam;
  /** Vignette darkness 0..1. Default 1. */
  vignettingAlpha?: ScalarParam;
  /** Vignette blur 0..1. Default 0.3. */
  vignettingBlur?: ScalarParam;
  /** Damage seed (animatable). Default: deterministic hash of t. */
  seed?: ScalarParam;
}

const DECLARATIONS = `
uniform float uSepia;
uniform float uNoiseAmount;
uniform float uNoiseSize;
uniform float uScratch;
uniform float uScratchDensity;
uniform float uScratchWidth;
uniform float uVignette;
uniform float uVignetteAlpha;
uniform float uVignetteBlur;
uniform float uSeed;

const float SQRT_2 = 1.414213;
const vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);

float filmRand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 overlayBlend(vec3 src, vec3 dst) {
  return vec3(
    (dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),
    (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),
    (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z))
  );
}
`;

export function oldFilm(gl: WebGL2RenderingContext, options: OldFilmOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      fragColor = texture(uTexture, vUv);
      vec3 color = fragColor.rgb;

      if (uSepia > 0.0) {
        float gray = (color.r + color.g + color.b) / 3.0;
        vec3 grayscale = vec3(gray);
        color = overlayBlend(SEPIA_RGB, grayscale);
        color = grayscale + uSepia * (color - grayscale);
      }

      vec2 coord = vUv;

      if (uVignette > 0.0) {
        float outter = SQRT_2 - uVignette * SQRT_2;
        vec2 dir = vec2(0.5) - coord;
        dir.y *= uResolution.y / uResolution.x;
        float darker = clamp((outter - length(dir) * SQRT_2) / (0.00001 + uVignetteBlur * SQRT_2), 0.0, 1.0);
        color *= darker + (1.0 - darker) * (1.0 - uVignetteAlpha);
      }

      if (uScratchDensity > uSeed && uScratch != 0.0) {
        float phase = uSeed * 256.0;
        float s = mod(floor(phase), 2.0);
        float dist = 1.0 / uScratchDensity;
        float d = distance(coord, vec2(uSeed * dist, abs(s - uSeed * dist)));
        if (d < uSeed * 0.6 + 0.4) {
          float period = uScratchDensity * 10.0;
          float xx = coord.x * period + phase;
          float aa = abs(mod(xx, 0.5) * 4.0);
          float bb = mod(floor(xx / 0.5), 2.0);
          float yy = (1.0 - bb) * aa + bb * (2.0 - aa);
          float kk = 2.0 * period;
          float dw = uScratchWidth / uResolution.x * (0.75 + uSeed);
          float dh = dw * kk;
          float tine = (yy - (2.0 - dh));
          if (tine > 0.0) {
            float _sign = sign(uScratch);
            tine = s * tine / period + uScratch + 0.1;
            tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);
            color *= tine;
          }
        }
      }

      if (uNoiseAmount > 0.0 && uNoiseSize > 0.0) {
        vec2 pixelCoord = floor(vUv * uResolution / uNoiseSize) * uNoiseSize;
        float n = (filmRand(pixelCoord * uSeed) - 0.5) * uNoiseAmount;
        color += n * (1.0 - color);
      }

      fragColor.rgb = color;
    `,
    {
      uSepia: (t) => resolveScalar(options.sepia, t, 0.3),
      uNoiseAmount: (t) => resolveScalar(options.noise, t, 0.3),
      uNoiseSize: (t) => resolveScalar(options.noiseSize, t, 1),
      uScratch: (t) => resolveScalar(options.scratch, t, 0.5),
      uScratchDensity: (t) => resolveScalar(options.scratchDensity, t, 0.3),
      uScratchWidth: (t) => resolveScalar(options.scratchWidth, t, 1),
      uVignette: (t) => resolveScalar(options.vignetting, t, 0.3),
      uVignetteAlpha: (t) => resolveScalar(options.vignettingAlpha, t, 1),
      uVignetteBlur: (t) => resolveScalar(options.vignettingBlur, t, 0.3),
      uSeed: (t) => resolveScalar(options.seed, t, fractHash(t)),
    },
    DECLARATIONS
  );
}

// Ported from pixi-filters (MIT): reference/pixi-filters/src/zoom-blur
// The per-pixel dithering hash hides the fixed sample count and is a pure
// function of the pixel position — fully deterministic across frames.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface ZoomBlurOptions {
  /** Blur strength (0..1 sensible). Default 0.1. */
  strength?: ScalarParam;
  /** Zoom center X, 0..1 of width. Default 0.5. */
  centerX?: ScalarParam;
  /** Zoom center Y, 0..1 of height. Default 0.5. */
  centerY?: ScalarParam;
  /** Untouched radius around the center in px. Default 0. */
  innerRadius?: ScalarParam;
  /** Sample count (baked, not animatable). Default 32. */
  maxKernelSize?: number;
}

const DECLARATIONS = `
uniform float uStrength;
uniform float uCenterX;
uniform float uCenterY;
uniform float uInnerRadius;

float zoomRand(vec2 co, float seed) {
  const float a = 12.9898, b = 78.233, c = 43758.5453;
  float dt = dot(co + seed, vec2(a, b)), sn = mod(dt, 3.14159);
  return fract(sin(sn) * c + seed);
}
`;

export function zoomBlur(gl: WebGL2RenderingContext, options: ZoomBlurOptions = {}): Pass {
  const kernel = Math.max(4, Math.round(options.maxKernelSize ?? 32)).toFixed(1);

  return new ShaderPass(
    gl,
    `
      const float MAX_KERNEL_SIZE = ${kernel};
      float minGradient = uInnerRadius * 0.3;
      float innerRadius = (uInnerRadius + minGradient * 0.5) / uResolution.x;

      float countLimit = MAX_KERNEL_SIZE;
      vec2 dir = vec2(uCenterX, uCenterY) - vUv;
      float dist = length(vec2(dir.x, dir.y * uResolution.y / uResolution.x));
      float strength = uStrength;

      if (dist < innerRadius) {
        float delta = innerRadius - dist;
        float normalCount = (minGradient + 1e-4) / uResolution.x;
        delta = (normalCount - delta) / normalCount;
        countLimit *= max(delta, 0.0);
        strength *= max(delta, 0.0);
      }

      if (countLimit < 1.0) {
        fragColor = texture(uTexture, vUv);
      } else {
        float offset = zoomRand(vUv, 0.0);
        float total = 0.0;
        vec4 color = vec4(0.0);
        vec2 sdir = dir * strength;
        for (float s = 0.0; s < MAX_KERNEL_SIZE; s++) {
          float percent = (s + offset) / MAX_KERNEL_SIZE;
          float weight = 4.0 * (percent - percent * percent);
          color += texture(uTexture, vUv + sdir * percent) * weight;
          total += weight;
          if (s > countLimit) break;
        }
        fragColor = color / total;
      }
    `,
    {
      uStrength: (t) => resolveScalar(options.strength, t, 0.1),
      uCenterX: (t) => resolveScalar(options.centerX, t, 0.5),
      uCenterY: (t) => resolveScalar(options.centerY, t, 0.5),
      uInnerRadius: (t) => resolveScalar(options.innerRadius, t, 0),
    },
    DECLARATIONS
  );
}

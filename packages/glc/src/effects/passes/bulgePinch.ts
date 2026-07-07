// Ported from pixi-filters (MIT): reference/pixi-filters/src/bulge-pinch

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface BulgePinchOptions {
  /** Center X, 0..1 of width. Default 0.5. */
  centerX?: ScalarParam;
  /** Center Y, 0..1 of height. Default 0.5. */
  centerY?: ScalarParam;
  /** Effect radius in px. Default 100. */
  radius?: ScalarParam;
  /** -1 (pinch) .. 1 (bulge). Default 1. */
  strength?: ScalarParam;
}

export function bulgePinch(gl: WebGL2RenderingContext, options: BulgePinchOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec2 center = vec2(uCenterX, uCenterY) * uResolution;
      vec2 coord = vUv * uResolution - center;
      float dist = length(coord);
      if (dist < uRadius && dist > 0.0) {
        float percent = dist / uRadius;
        if (uStrength > 0.0) {
          coord *= mix(1.0, smoothstep(0.0, uRadius / dist, percent), uStrength * 0.75);
        } else {
          coord *= mix(1.0, pow(percent, 1.0 + uStrength * 0.75) * uRadius / dist, 1.0 - percent);
        }
      }
      vec2 uv = (coord + center) / uResolution;
      vec2 clamped = clamp(uv, 0.0, 1.0);
      vec4 color = texture(uTexture, clamped);
      if (uv != clamped) {
        color *= max(0.0, 1.0 - length(uv - clamped));
      }
      fragColor = color;
    `,
    {
      uCenterX: (t) => resolveScalar(options.centerX, t, 0.5),
      uCenterY: (t) => resolveScalar(options.centerY, t, 0.5),
      uRadius: (t) => resolveScalar(options.radius, t, 100),
      uStrength: (t) => resolveScalar(options.strength, t, 1),
    }
  );
}

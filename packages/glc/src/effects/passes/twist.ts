// Ported from pixi-filters (MIT): reference/pixi-filters/src/twist

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface TwistOptions {
  /** Twist radius in px. Default 200. */
  radius?: ScalarParam;
  /** Twist angle (radians at the center). Default 4. */
  angle?: ScalarParam;
  /** Twist center X, 0..1 of width. Default 0.5. */
  offsetX?: ScalarParam;
  /** Twist center Y, 0..1 of height. Default 0.5. */
  offsetY?: ScalarParam;
}

export function twist(gl: WebGL2RenderingContext, options: TwistOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec2 center = vec2(uOffsetX, uOffsetY) * uResolution;
      vec2 coord = vUv * uResolution - center;
      float dist = length(coord);
      if (dist < uRadius) {
        float ratioDist = (uRadius - dist) / uRadius;
        float angleMod = ratioDist * ratioDist * uAngle;
        float s = sin(angleMod);
        float c = cos(angleMod);
        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
      }
      fragColor = texture(uTexture, clamp((coord + center) / uResolution, 0.0, 1.0));
    `,
    {
      uRadius: (t) => resolveScalar(options.radius, t, 200),
      uAngle: (t) => resolveScalar(options.angle, t, 4),
      uOffsetX: (t) => resolveScalar(options.offsetX, t, 0.5),
      uOffsetY: (t) => resolveScalar(options.offsetY, t, 0.5),
    }
  );
}

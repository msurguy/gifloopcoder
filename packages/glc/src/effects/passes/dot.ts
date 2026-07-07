// Ported from pixi-filters (MIT): reference/pixi-filters/src/dot
// Classic halftone dot-screen.

import { resolveBool, resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface DotOptions {
  /** Dot pattern scale. Default 1. */
  scale?: ScalarParam;
  /** Pattern angle. Default 5. */
  angle?: ScalarParam;
  /** Render in grayscale. Default true. */
  grayscale?: boolean | ((t: number) => boolean);
}

export function dot(gl: WebGL2RenderingContext, options: DotOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      float s = sin(uAngle), c = cos(uAngle);
      vec2 tex = vUv * uResolution;
      vec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * uScale;
      float pattern = sin(point.x) * sin(point.y) * 4.0;
      vec4 color = texture(uTexture, vUv);
      vec3 rgb = color.rgb;
      if (uGrayScale > 0.5) {
        rgb = vec3((color.r + color.g + color.b) / 3.0);
      }
      fragColor = vec4(clamp(rgb * 10.0 - 5.0 + pattern, 0.0, 1.0), color.a);
    `,
    {
      uScale: (t) => resolveScalar(options.scale, t, 1),
      uAngle: (t) => resolveScalar(options.angle, t, 5),
      uGrayScale: (t) => resolveBool(options.grayscale, t, true),
    }
  );
}

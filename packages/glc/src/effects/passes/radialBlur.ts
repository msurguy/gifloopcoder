// Ported from pixi-filters (MIT): reference/pixi-filters/src/radial-blur
// Angular blur around a center point.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface RadialBlurOptions {
  /** Total blur angle in degrees. Default 12. */
  angle?: ScalarParam;
  /** Center X, 0..1 of width. Default 0.5. */
  centerX?: ScalarParam;
  /** Center Y, 0..1 of height. Default 0.5. */
  centerY?: ScalarParam;
  /** Sample count. Default 9. */
  kernelSize?: ScalarParam;
  /** Effect radius in px (-1 = whole frame). Default -1. */
  radius?: ScalarParam;
}

export function radialBlur(gl: WebGL2RenderingContext, options: RadialBlurOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      const int MAX_KERNEL_SIZE = 64;
      vec4 color = texture(uTexture, vUv);
      int kernel = int(clamp(uKernelSize, 0.0, float(MAX_KERNEL_SIZE)));

      if (kernel > 1) {
        float aspect = uResolution.y / uResolution.x;
        vec2 center = vec2(uCenterX, uCenterY);
        float gradient = uRadius / uResolution.x * 0.3;
        float radius = uRadius / uResolution.x - gradient * 0.5;
        int k = kernel - 1;

        vec2 coord = vUv;
        vec2 dir = center - coord;
        float dist = length(vec2(dir.x, dir.y * aspect));

        float radianStep = radians(uAngle);
        bool skip = false;
        if (radius >= 0.0 && dist > radius) {
          float delta = dist - radius;
          float scale = 1.0 - abs(delta / max(gradient, 1e-4));
          if (scale <= 0.0) skip = true;
          radianStep *= max(scale, 0.0);
        }

        if (!skip) {
          radianStep /= float(k);
          float s = sin(radianStep);
          float c = cos(radianStep);
          mat2 rotation = mat2(vec2(c, -s), vec2(s, c));
          for (int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
            if (i == k) break;
            coord -= center;
            coord.y *= aspect;
            coord = rotation * coord;
            coord.y /= aspect;
            coord += center;
            color += texture(uTexture, clamp(coord, 0.0, 1.0));
          }
          color /= float(kernel);
        }
      }
      fragColor = color;
    `,
    {
      uAngle: (t) => resolveScalar(options.angle, t, 12),
      uCenterX: (t) => resolveScalar(options.centerX, t, 0.5),
      uCenterY: (t) => resolveScalar(options.centerY, t, 0.5),
      uKernelSize: (t) => resolveScalar(options.kernelSize, t, 9),
      uRadius: (t) => resolveScalar(options.radius, t, -1),
    }
  );
}

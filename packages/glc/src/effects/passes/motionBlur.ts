// Ported from pixi-filters (MIT): reference/pixi-filters/src/motion-blur

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface MotionBlurOptions {
  /** Velocity X in px. Default 20. */
  velocityX?: ScalarParam;
  /** Velocity Y in px. Default 0. */
  velocityY?: ScalarParam;
  /** Sample count (odd numbers look best), 3..25. Default 5. */
  kernelSize?: ScalarParam;
  /** Offset along the velocity in px. Default 0. */
  offset?: ScalarParam;
}

export function motionBlur(gl: WebGL2RenderingContext, options: MotionBlurOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      const int MAX_KERNEL_SIZE = 64;
      vec4 color = texture(uTexture, vUv);
      int kernel = int(clamp(uKernelSize, 0.0, float(MAX_KERNEL_SIZE)));
      vec2 vel = vec2(uVelocityX, uVelocityY);
      if (kernel > 1 && length(vel) > 0.01) {
        vec2 velocity = vel / uResolution;
        float offset = -uOffsetPx / length(vel) - 0.5;
        int k = kernel - 1;
        for (int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
          if (i == k) break;
          vec2 bias = velocity * (float(i) / float(k) + offset);
          color += texture(uTexture, vUv + bias);
        }
        color /= float(kernel);
      }
      fragColor = color;
    `,
    {
      uVelocityX: (t) => resolveScalar(options.velocityX, t, 20),
      uVelocityY: (t) => resolveScalar(options.velocityY, t, 0),
      uKernelSize: (t) => resolveScalar(options.kernelSize, t, 5),
      uOffsetPx: (t) => resolveScalar(options.offset, t, 0),
    }
  );
}

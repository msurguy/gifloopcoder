// Ported from pixi-filters (MIT): reference/pixi-filters/src/pixelate

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface PixelateOptions {
  /** Pixel block size in px. Default 10. */
  size?: ScalarParam;
}

export function pixelate(gl: WebGL2RenderingContext, options: PixelateOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec2 px = vUv * uResolution;
      vec2 size = vec2(max(uSize, 1.0));
      vec2 coord = (floor(px / size) + 0.5) * size / uResolution;
      fragColor = texture(uTexture, coord);
    `,
    {
      uSize: (t) => resolveScalar(options.size, t, 10),
    }
  );
}

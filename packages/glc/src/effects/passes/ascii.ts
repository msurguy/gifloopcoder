// Ported from pixi-filters (MIT): reference/pixi-filters/src/ascii
// Bitmap "characters" encoded as 5x5 bitfields, chosen by cell luminance.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface AsciiOptions {
  /** Character cell size in px. Default 8. */
  size?: ScalarParam;
}

export function ascii(gl: WebGL2RenderingContext, options: AsciiOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      float size = max(uSize, 2.0);
      vec2 px = vUv * uResolution;
      vec2 cellPx = floor(px / size) * size;
      vec4 color = texture(uTexture, (cellPx + 0.5 * size) / uResolution);

      float gray = 0.3 * color.r + 0.59 * color.g + 0.11 * color.b;
      float n = 65536.0;              // .
      if (gray > 0.2) n = 65600.0;    // :
      if (gray > 0.3) n = 332772.0;   // *
      if (gray > 0.4) n = 15255086.0; // o
      if (gray > 0.5) n = 23385164.0; // &
      if (gray > 0.6) n = 15252014.0; // 8
      if (gray > 0.7) n = 13199452.0; // @
      if (gray > 0.8) n = 11512810.0; // #

      vec2 p = mod(px, size) / size;      // 0..1 within the cell
      p = floor((p * 2.0 - 1.0) * vec2(4.0) + 2.5);
      float charPixel = 0.0;
      if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y) {
        if (int(mod(n / exp2(p.x + 5.0 * p.y), 2.0)) == 1) charPixel = 1.0;
      }
      fragColor = vec4(color.rgb * charPixel, color.a);
    `,
    {
      uSize: (t) => resolveScalar(options.size, t, 8),
    }
  );
}

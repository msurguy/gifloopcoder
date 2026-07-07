// Ported from pixi-filters (MIT): reference/pixi-filters/src/cross-hatch
// Line spacing exposed as a param (the reference hardcodes 10px).

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface CrossHatchOptions {
  /** Hatch line spacing in px. Default 10. */
  spacing?: ScalarParam;
}

export function crossHatch(gl: WebGL2RenderingContext, options: CrossHatchOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec2 px = vUv * uResolution;
      vec4 src = texture(uTexture, vUv);
      float lum = length(src.rgb);
      float spacing = max(uSpacing, 2.0);
      vec3 rgb = vec3(1.0);
      if (lum < 1.00 && mod(px.x + px.y, spacing) < 1.0) rgb = vec3(0.0);
      if (lum < 0.75 && mod(px.x - px.y, spacing) < 1.0) rgb = vec3(0.0);
      if (lum < 0.50 && mod(px.x + px.y - spacing * 0.5, spacing) < 1.0) rgb = vec3(0.0);
      if (lum < 0.30 && mod(px.x - px.y - spacing * 0.5, spacing) < 1.0) rgb = vec3(0.0);
      fragColor = vec4(rgb, src.a);
    `,
    {
      uSpacing: (t) => resolveScalar(options.spacing, t, 10),
    }
  );
}

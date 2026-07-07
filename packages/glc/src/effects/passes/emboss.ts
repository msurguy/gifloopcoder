// Ported from pixi-filters (MIT): reference/pixi-filters/src/emboss

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface EmbossOptions {
  /** Emboss strength. Default 5. */
  strength?: ScalarParam;
}

export function emboss(gl: WebGL2RenderingContext, options: EmbossOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec2 onePixel = 1.0 / uResolution;
      vec4 color = vec4(vec3(0.5), 0.0);
      color -= texture(uTexture, vUv - onePixel) * uStrength;
      color += texture(uTexture, vUv + onePixel) * uStrength;
      float gray = (color.r + color.g + color.b) / 3.0;
      float alpha = texture(uTexture, vUv).a;
      fragColor = vec4(vec3(gray), alpha);
    `,
    {
      uStrength: (t) => resolveScalar(options.strength, t, 5),
    }
  );
}

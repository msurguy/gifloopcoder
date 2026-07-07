// Ported from pixi-filters (MIT): reference/pixi-filters/src/rgb-split
// Independent per-channel offsets (unlike chromaticAberration's radial split).

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface RgbSplitOptions {
  /** Red channel offset in px. Defaults -10, 0. */
  redX?: ScalarParam;
  redY?: ScalarParam;
  /** Green channel offset in px. Defaults 0, 10. */
  greenX?: ScalarParam;
  greenY?: ScalarParam;
  /** Blue channel offset in px. Defaults 0, 0. */
  blueX?: ScalarParam;
  blueY?: ScalarParam;
}

export function rgbSplit(gl: WebGL2RenderingContext, options: RgbSplitOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      float r = texture(uTexture, clamp(vUv + vec2(uRedX, uRedY) / uResolution, 0.0, 1.0)).r;
      float g = texture(uTexture, clamp(vUv + vec2(uGreenX, uGreenY) / uResolution, 0.0, 1.0)).g;
      float b = texture(uTexture, clamp(vUv + vec2(uBlueX, uBlueY) / uResolution, 0.0, 1.0)).b;
      float a = texture(uTexture, vUv).a;
      fragColor = vec4(r, g, b, a);
    `,
    {
      uRedX: (t) => resolveScalar(options.redX, t, -10),
      uRedY: (t) => resolveScalar(options.redY, t, 0),
      uGreenX: (t) => resolveScalar(options.greenX, t, 0),
      uGreenY: (t) => resolveScalar(options.greenY, t, 10),
      uBlueX: (t) => resolveScalar(options.blueX, t, 0),
      uBlueY: (t) => resolveScalar(options.blueY, t, 0),
    }
  );
}

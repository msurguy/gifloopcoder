// Ported from pixi-filters (MIT): reference/pixi-filters/src/adjustment
// Adapted for straight (non-premultiplied) alpha.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface AdjustmentOptions {
  /** Gamma correction, >0. Default 1. */
  gamma?: ScalarParam;
  /** Saturation multiplier, 0 = grayscale. Default 1. */
  saturation?: ScalarParam;
  /** Contrast around mid-gray. Default 1. */
  contrast?: ScalarParam;
  /** Brightness multiplier. Default 1. */
  brightness?: ScalarParam;
  /** Per-channel multipliers. Default 1 each. */
  red?: ScalarParam;
  green?: ScalarParam;
  blue?: ScalarParam;
  /** Output alpha multiplier. Default 1. */
  alpha?: ScalarParam;
}

export function adjustment(gl: WebGL2RenderingContext, options: AdjustmentOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec4 c = texture(uTexture, vUv);
      vec3 rgb = pow(max(c.rgb, 0.0), vec3(1.0 / max(uGamma, 1e-4)));
      rgb = mix(vec3(0.5), mix(vec3(dot(vec3(0.2125, 0.7154, 0.0721), rgb)), rgb, uSaturation), uContrast);
      rgb *= vec3(uRed, uGreen, uBlue);
      fragColor = vec4(rgb * uBrightness, c.a * uAlpha);
    `,
    {
      uGamma: (t) => resolveScalar(options.gamma, t, 1),
      uSaturation: (t) => resolveScalar(options.saturation, t, 1),
      uContrast: (t) => resolveScalar(options.contrast, t, 1),
      uBrightness: (t) => resolveScalar(options.brightness, t, 1),
      uRed: (t) => resolveScalar(options.red, t, 1),
      uGreen: (t) => resolveScalar(options.green, t, 1),
      uBlue: (t) => resolveScalar(options.blue, t, 1),
      uAlpha: (t) => resolveScalar(options.alpha, t, 1),
    }
  );
}

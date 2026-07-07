// Ported from pixi-filters (MIT): reference/pixi-filters/src/hsl-adjustment
// Quaternion-based hue shift; saturation/lightness curves from glfx.js.

import { resolveBool, resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface HslAdjustmentOptions {
  /** Hue rotation in degrees (0..360 wraps seamlessly). Default 0. */
  hue?: ScalarParam;
  /** Saturation, -1..1 (0 = unchanged). Default 0. */
  saturation?: ScalarParam;
  /** Lightness, -1..1 (0 = unchanged). Default 0. */
  lightness?: ScalarParam;
  /** Colorize mode: apply hue to a desaturated base. Default false. */
  colorize?: boolean | ((t: number) => boolean);
  /** Blend of the adjusted result over the original, 0..1. Default 1. */
  alpha?: ScalarParam;
}

export function hslAdjustment(gl: WebGL2RenderingContext, options: HslAdjustmentOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec4 color = texture(uTexture, vUv);
      vec3 rgb = color.rgb;
      if (uColorize > 0.5) {
        rgb = vec3(dot(rgb, vec3(0.299, 0.587, 0.114)), 0.0, 0.0);
      }
      // Quaternion hue rotation around the gray axis.
      const vec3 k = vec3(0.57735);
      float cosA = cos(uHue);
      rgb = rgb * cosA + cross(k, rgb) * sin(uHue) + k * dot(k, rgb) * (1.0 - cosA);
      float average = (rgb.r + rgb.g + rgb.b) / 3.0;
      if (uSaturation > 0.0) {
        rgb += (average - rgb) * (1.0 - 1.0 / (1.001 - uSaturation));
      } else {
        rgb -= (average - rgb) * uSaturation;
      }
      rgb = mix(rgb, vec3(ceil(uLightness)) * color.a, abs(uLightness));
      fragColor = mix(color, vec4(rgb, color.a), uAlpha);
    `,
    {
      uHue: (t) => (resolveScalar(options.hue, t, 0) * Math.PI) / 180,
      uSaturation: (t) => resolveScalar(options.saturation, t, 0),
      uLightness: (t) => resolveScalar(options.lightness, t, 0),
      uColorize: (t) => resolveBool(options.colorize, t, false),
      uAlpha: (t) => resolveScalar(options.alpha, t, 1),
    }
  );
}

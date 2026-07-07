// Ported from pixi-filters (MIT): reference/pixi-filters/src/outline
// Draws a colored outline around opaque content by sampling alpha in a circle.
// The sample count (quality) is baked into the shader at construction.
// Adapted to straight alpha: composited in premultiplied space, then unpremultiplied.

import {
  resolveBool,
  resolveColor,
  resolveScalar,
  ShaderPass,
  type ColorParam,
  type Pass,
  type ScalarParam,
} from '../pass.js';

export interface OutlineOptions {
  /** Outline thickness in px. Default 1. */
  thickness?: ScalarParam;
  /** Outline color. Default '#000000'. */
  color?: ColorParam;
  /** Outline opacity. Default 1. */
  alpha?: ScalarParam;
  /** Sample quality 0..1 (baked at construction, not animatable). Default 0.25. */
  quality?: number;
  /** Only render the outline, hiding the content. Default false. */
  knockout?: boolean | ((t: number) => boolean);
}

const MAX_SAMPLES = 100;
const MIN_SAMPLES = 1;

export function outline(gl: WebGL2RenderingContext, options: OutlineOptions = {}): Pass {
  const quality = options.quality ?? 0.25;
  const angleStep = ((Math.PI * 2) / Math.max(quality * MAX_SAMPLES, MIN_SAMPLES)).toFixed(7);

  return new ShaderPass(
    gl,
    `
      const float DOUBLE_PI = 6.2831853;
      const float ANGLE_STEP = ${angleStep};

      vec2 thicknessUv = vec2(uThickness) / uResolution;
      vec4 src = texture(uTexture, vUv);
      float maxAlpha = 0.0;
      for (float angle = 0.0; angle <= DOUBLE_PI; angle += ANGLE_STEP) {
        vec2 pos = vUv + thicknessUv * vec2(cos(angle), sin(angle));
        maxAlpha = max(maxAlpha, texture(uTexture, clamp(pos, 0.0, 1.0)).a);
      }
      float outlineAlpha = uAlpha * maxAlpha * (1.0 - src.a);
      // Composite (premultiplied), then back to straight alpha.
      float contentWeight = uKnockout > 0.5 ? 0.0 : 1.0;
      vec3 pm = src.rgb * src.a * contentWeight + uColor * outlineAlpha;
      float a = src.a * contentWeight + outlineAlpha;
      fragColor = vec4(a > 0.0 ? pm / a : vec3(0.0), a);
    `,
    {
      uThickness: (t) => resolveScalar(options.thickness, t, 1),
      uColor: (t) => resolveColor(options.color, t, '#000000'),
      uAlpha: (t) => resolveScalar(options.alpha, t, 1),
      uKnockout: (t) => resolveBool(options.knockout, t, false),
    },
    // uColor auto-declares as float when the option is a fn; declare explicitly.
    'uniform float uThickness;\nuniform vec3 uColor;\nuniform float uAlpha;\nuniform float uKnockout;'
  );
}

// Ported from pixi-filters (MIT): reference/pixi-filters/src/glow
// Alpha-driven inner/outer glow. distance & quality are baked into the shader
// at construction (GLSL loop bounds must be constant); other params animate.
// Adapted to straight alpha (premultiplied composite, unpremultiplied output).

import {
  resolveBool,
  resolveColor,
  resolveScalar,
  ShaderPass,
  type ColorParam,
  type Pass,
  type ScalarParam,
} from '../pass.js';

export interface GlowOptions {
  /** Glow spread in px (baked, not animatable). Default 10. */
  distance?: number;
  /** Outer glow strength. Default 4. */
  outerStrength?: ScalarParam;
  /** Inner glow strength. Default 0. */
  innerStrength?: ScalarParam;
  /** Glow color. Default '#ffffff'. */
  color?: ColorParam;
  /** Glow opacity. Default 1. */
  alpha?: ScalarParam;
  /** Sample quality 0..1 (baked, not animatable). Default 0.15. */
  quality?: number;
  /** Only render the glow, hiding the content. Default false. */
  knockout?: boolean | ((t: number) => boolean);
}

export function glow(gl: WebGL2RenderingContext, options: GlowOptions = {}): Pass {
  const distance = Math.max(1, Math.round(options.distance ?? 10));
  const quality = options.quality ?? 0.15;
  const angleStepSize = Math.min(1 / quality / distance, Math.PI * 2).toFixed(7);

  return new ShaderPass(
    gl,
    `
      const float PI = 3.14159265;
      const float DIST = ${distance.toFixed(1)};
      const float ANGLE_STEP_SIZE = ${angleStepSize};
      const float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);
      const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;

      vec2 px = 1.0 / uResolution;
      float totalAlpha = 0.0;
      for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {
        vec2 direction = vec2(cos(angle), sin(angle)) * px;
        for (float curDistance = 0.0; curDistance < DIST; curDistance++) {
          vec2 displaced = clamp(vUv + direction * (curDistance + 1.0), 0.0, 1.0);
          totalAlpha += (DIST - curDistance) * texture(uTexture, displaced).a;
        }
      }

      vec4 curColor = texture(uTexture, vUv);
      float alphaRatio = totalAlpha / MAX_TOTAL_ALPHA;

      float innerGlowAlpha = (1.0 - alphaRatio) * uInnerStrength * curColor.a * uAlpha;
      float innerGlowStrength = min(1.0, innerGlowAlpha);
      vec3 innerRgbPm = mix(curColor.rgb * curColor.a, uColor * curColor.a, innerGlowStrength);

      float outerGlowAlpha = alphaRatio * uOuterStrength * (1.0 - curColor.a) * uAlpha;
      float outerGlowStrength = min(1.0 - curColor.a, outerGlowAlpha);

      if (uKnockout > 0.5) {
        float resultAlpha = min(1.0, outerGlowAlpha + innerGlowAlpha);
        fragColor = vec4(uColor, resultAlpha);
      } else {
        vec3 pm = innerRgbPm + uColor * outerGlowStrength;
        float a = min(1.0, curColor.a + outerGlowStrength);
        fragColor = vec4(a > 0.0 ? pm / a : vec3(0.0), a);
      }
    `,
    {
      uOuterStrength: (t) => resolveScalar(options.outerStrength, t, 4),
      uInnerStrength: (t) => resolveScalar(options.innerStrength, t, 0),
      uColor: (t) => resolveColor(options.color, t, '#ffffff'),
      uAlpha: (t) => resolveScalar(options.alpha, t, 1),
      uKnockout: (t) => resolveBool(options.knockout, t, false),
    },
    'uniform float uOuterStrength;\nuniform float uInnerStrength;\nuniform vec3 uColor;\nuniform float uAlpha;\nuniform float uKnockout;'
  );
}

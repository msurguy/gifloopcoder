import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface ChromaticAberrationOptions {
  /** Channel separation in pixels. Default 3. */
  amount?: ScalarParam;
}

export function chromaticAberration(
  gl: WebGL2RenderingContext,
  options: ChromaticAberrationOptions = {}
): Pass {
  return new ShaderPass(
    gl,
    `
      // Radial split: offset red/blue along the direction from center, scaled
      // by distance so the effect is strongest at the edges.
      vec2 dir = vUv - 0.5;
      vec2 px = (uAmount / uResolution) * (0.3 + length(dir));
      vec2 off = normalize(dir + 1e-6) * px;
      float r = texture(uTexture, vUv - off).r;
      float g = texture(uTexture, vUv).g;
      float b = texture(uTexture, vUv + off).b;
      float a = texture(uTexture, vUv).a;
      fragColor = vec4(r, g, b, a);
    `,
    {
      uAmount: (t) => resolveScalar(options.amount, t, 3),
    }
  );
}

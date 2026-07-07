import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface FilmGrainOptions {
  /** Noise intensity, 0..1. Default 0.08. */
  amount?: ScalarParam;
}

export function filmGrain(gl: WebGL2RenderingContext, options: FilmGrainOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec4 color = texture(uTexture, vUv);
      // Hash noise seeded by pixel + uTime (= loop t), so exported frames are
      // deterministic and the loop wraps seamlessly. No Math.random anywhere.
      vec2 seed = vUv * uResolution + uTime * 1000.0;
      float n = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
      // Scale by alpha so transparent regions stay clean.
      color.rgb += n * uAmount * color.a;
      fragColor = color;
    `,
    {
      uAmount: (t) => resolveScalar(options.amount, t, 0.08),
    }
  );
}

// Deterministic shader-only glitch. Pixi's GlitchFilter builds its band layout
// CPU-side with Math.random into a displacement texture; ours derives the bands
// from a hash of (band index, seed) in the shader, so exports are reproducible.
// The default seed steps 8 times per loop for that classic jump-cut feel.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface GlitchOptions {
  /** Number of slices across the banding axis. Default 8. */
  slices?: ScalarParam;
  /** Max displacement as a fraction of width. Default 0.05. */
  offset?: ScalarParam;
  /** Displacement direction in degrees (0 = horizontal shift of horizontal bands). Default 0. */
  direction?: ScalarParam;
  /** Extra red/blue channel offset in px along the shift axis. Default 2. */
  rgbOffset?: ScalarParam;
  /** Fraction of slices that shift, 0..1. Default 0.6. */
  density?: ScalarParam;
  /** Randomization seed (animatable). Default: steps 8 times per loop. */
  seed?: ScalarParam;
}

const DECLARATIONS = `
uniform float uSlices;
uniform float uOffset;
uniform float uDirection;
uniform float uRgbOffset;
uniform float uDensity;
uniform float uSeed;

float glitchHash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

export function glitch(gl: WebGL2RenderingContext, options: GlitchOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      float rad = radians(uDirection);
      vec2 axis = vec2(cos(rad), sin(rad));      // displacement axis
      vec2 perp = vec2(-axis.y, axis.x);         // banding axis

      float bandCoord = dot(vUv, perp);
      float band = floor(bandCoord * max(uSlices, 1.0));
      float r1 = glitchHash(vec2(band, floor(uSeed * 1000.0)));
      float r2 = glitchHash(vec2(band + 31.0, floor(uSeed * 1000.0)));

      float shift = (r2 < uDensity) ? (r1 * 2.0 - 1.0) * uOffset : 0.0;
      vec2 base = vUv + axis * shift;
      vec2 split = axis * (uRgbOffset / uResolution.x);

      float red = texture(uTexture, clamp(base + split, 0.0, 1.0)).r;
      vec4 mid = texture(uTexture, clamp(base, 0.0, 1.0));
      float blue = texture(uTexture, clamp(base - split, 0.0, 1.0)).b;
      fragColor = vec4(red, mid.g, blue, mid.a);
    `,
    {
      uSlices: (t) => resolveScalar(options.slices, t, 8),
      uOffset: (t) => resolveScalar(options.offset, t, 0.05),
      uDirection: (t) => resolveScalar(options.direction, t, 0),
      uRgbOffset: (t) => resolveScalar(options.rgbOffset, t, 2),
      uDensity: (t) => resolveScalar(options.density, t, 0.6),
      uSeed: (t) => resolveScalar(options.seed, t, Math.floor(t * 8) / 8),
    },
    DECLARATIONS
  );
}

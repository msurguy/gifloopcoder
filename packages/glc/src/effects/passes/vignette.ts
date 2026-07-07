import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface VignetteOptions {
  /** Darkening at the edges, 0..1. Default 0.5. */
  amount?: ScalarParam;
  /** Distance (0..~1.4, center→corner) where darkening reaches full. Default 0.75. */
  radius?: ScalarParam;
  /** Falloff width of the darkened ring. Default 0.45. */
  softness?: ScalarParam;
}

export function vignette(gl: WebGL2RenderingContext, options: VignetteOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      vec4 color = texture(uTexture, vUv);
      // Corner distance normalized so ~1.0 reaches the corners.
      float dist = length(vUv - 0.5) * 1.41421356;
      float edge = smoothstep(uRadius - uSoftness, uRadius, dist);
      color.rgb *= 1.0 - uAmount * edge;
      fragColor = color;
    `,
    {
      uAmount: (t) => resolveScalar(options.amount, t, 0.5),
      uRadius: (t) => resolveScalar(options.radius, t, 0.75),
      uSoftness: (t) => resolveScalar(options.softness, t, 0.45),
    }
  );
}

// Ported from pixi-filters (MIT): reference/pixi-filters/src/reflection
// Water reflection below a boundary line with animated waves. The default
// time advances one full 2π phase per loop, so the waves wrap seamlessly.

import { resolveBool, resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface ReflectionOptions {
  /** Mirror the source above the boundary. Default true. */
  mirror?: boolean | ((t: number) => boolean);
  /** Boundary line, 0..1 from the top. Default 0.5. */
  boundary?: ScalarParam;
  /** Wave amplitude in px at the boundary. Default 0. */
  amplitudeStart?: ScalarParam;
  /** Wave amplitude in px at the bottom. Default 20. */
  amplitudeEnd?: ScalarParam;
  /** Wavelength in px at the boundary. Default 30. */
  wavelengthStart?: ScalarParam;
  /** Wavelength in px at the bottom. Default 100. */
  wavelengthEnd?: ScalarParam;
  /** Opacity at the boundary. Default 1. */
  alphaStart?: ScalarParam;
  /** Opacity at the bottom. Default 1. */
  alphaEnd?: ScalarParam;
  /** Wave phase (animatable). Default: t * 2π (seamless loop). */
  time?: ScalarParam;
}

export function reflection(gl: WebGL2RenderingContext, options: ReflectionOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      if (vUv.y < uBoundary) {
        fragColor = texture(uTexture, vUv);
      } else {
        float k = (vUv.y - uBoundary) / (1.0 - uBoundary + 0.0001);
        float v = uBoundary + uBoundary - vUv.y;
        float y = uMirror > 0.5 ? v : vUv.y;

        float amplitude = mix(uAmplitudeStart, uAmplitudeEnd, k) / uResolution.x;
        float waveLength = mix(uWavelengthStart, uWavelengthEnd, k) / uResolution.y;
        float alpha = mix(uAlphaStart, uAlphaEnd, k);

        float x = vUv.x + cos(v * 6.2831853 / waveLength - uPhase) * amplitude;
        x = clamp(x, 0.0, 1.0);

        vec4 color = texture(uTexture, vec2(x, clamp(y, 0.0, 1.0)));
        fragColor = vec4(color.rgb, color.a * alpha);
      }
    `,
    {
      uMirror: (t) => resolveBool(options.mirror, t, true),
      uBoundary: (t) => resolveScalar(options.boundary, t, 0.5),
      uAmplitudeStart: (t) => resolveScalar(options.amplitudeStart, t, 0),
      uAmplitudeEnd: (t) => resolveScalar(options.amplitudeEnd, t, 20),
      uWavelengthStart: (t) => resolveScalar(options.wavelengthStart, t, 30),
      uWavelengthEnd: (t) => resolveScalar(options.wavelengthEnd, t, 100),
      uAlphaStart: (t) => resolveScalar(options.alphaStart, t, 1),
      uAlphaEnd: (t) => resolveScalar(options.alphaEnd, t, 1),
      uPhase: (t) => resolveScalar(options.time, t, t * Math.PI * 2),
    }
  );
}

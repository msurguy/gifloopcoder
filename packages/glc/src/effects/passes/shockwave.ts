// Ported from pixi-filters (MIT): reference/pixi-filters/src/shockwave
// time defaults to the loop t itself, so the wave expands over one loop and
// resets exactly at the wrap — a natural looping effect.

import { resolveScalar, ShaderPass, type Pass, type ScalarParam } from '../pass.js';

export interface ShockwaveOptions {
  /** Wave center X, 0..1 of width. Default 0.5. */
  centerX?: ScalarParam;
  /** Wave center Y, 0..1 of height. Default 0.5. */
  centerY?: ScalarParam;
  /** Wave time 0..N (animatable). Default: the loop t. */
  time?: ScalarParam;
  /** Expansion speed in px per unit time. Default 500. */
  speed?: ScalarParam;
  /** Displacement amplitude in px. Default 30. */
  amplitude?: ScalarParam;
  /** Ring wavelength in px. Default 160. */
  wavelength?: ScalarParam;
  /** Brightness boost inside the ring (1 = none). Default 1.25. */
  brightness?: ScalarParam;
  /** Max radius in px (-1 = unlimited). Default -1. */
  radius?: ScalarParam;
}

export function shockwave(gl: WebGL2RenderingContext, options: ShockwaveOptions = {}): Pass {
  return new ShaderPass(
    gl,
    `
      const float PI = 3.14159265;
      float halfWavelength = uWavelength * 0.5 / uResolution.x;
      float maxRadius = uRadius / uResolution.x;
      float currentRadius = uWaveTime * uSpeed / uResolution.x;

      float fade = 1.0;
      vec4 result = texture(uTexture, vUv);
      bool skip = false;

      if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) skip = true;
        fade = 1.0 - pow(min(currentRadius / max(maxRadius, 1e-4), 1.0), 2.0);
      }

      vec2 dir = vUv - vec2(uCenterX, uCenterY);
      dir.y *= uResolution.y / uResolution.x;
      float dist = length(dir);

      if (!skip && dist > 0.0 && dist >= currentRadius - halfWavelength && dist <= currentRadius + halfWavelength) {
        vec2 diffUV = normalize(dir);
        float diff = (dist - currentRadius) / halfWavelength;
        float p = 1.0 - pow(abs(diff), 2.0);
        float powDiff = 1.25 * sin(diff * PI) * p * (uAmplitude * fade);
        vec2 uv = vUv + diffUV * powDiff / uResolution;
        vec2 clamped = clamp(uv, 0.0, 1.0);
        result = texture(uTexture, clamped);
        if (uv != clamped) {
          result *= max(0.0, 1.0 - length(uv - clamped));
        }
        result.rgb *= 1.0 + (uBrightness - 1.0) * p * fade;
      }
      fragColor = result;
    `,
    {
      uCenterX: (t) => resolveScalar(options.centerX, t, 0.5),
      uCenterY: (t) => resolveScalar(options.centerY, t, 0.5),
      uWaveTime: (t) => resolveScalar(options.time, t, t),
      uSpeed: (t) => resolveScalar(options.speed, t, 500),
      uAmplitude: (t) => resolveScalar(options.amplitude, t, 30),
      uWavelength: (t) => resolveScalar(options.wavelength, t, 160),
      uBrightness: (t) => resolveScalar(options.brightness, t, 1.25),
      uRadius: (t) => resolveScalar(options.radius, t, -1),
    }
  );
}

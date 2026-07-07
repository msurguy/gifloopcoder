import { ShaderPass, type Pass, type UniformValue } from '../pass.js';

export interface ShaderPassOptions {
  /**
   * GLSL for the fragment body. Available in scope: `vUv` (0..1), `uTexture`
   * (the scene), `uResolution`, `uTime` (loop t), and every key in `uniforms`.
   * Assign the result to `fragColor`. Example:
   *   `fragColor = texture(uTexture, vUv) * uIntensity;`
   */
  fragment: string;
  /** Custom uniforms: literal number/vector, or fn(t) → number/vector. */
  uniforms?: Record<string, UniformValue>;
  /**
   * Optional explicit GLSL uniform declarations, e.g. `uniform vec3 uColor;`.
   * Omit to auto-declare (scalars as float, array literals as vecN).
   */
  declarations?: string;
}

export function customShader(gl: WebGL2RenderingContext, options: ShaderPassOptions): Pass {
  return new ShaderPass(gl, options.fragment, options.uniforms ?? {}, options.declarations);
}

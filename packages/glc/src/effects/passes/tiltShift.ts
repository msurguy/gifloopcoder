// Tilt-shift: variable blur that leaves a horizontal focus band sharp.
// Inspired by pixi-filters' tilt-shift (MIT), simplified to a horizontal band
// (start/end on Y) with per-pixel blur strength; two axis passes (H then V).

import { FRAG_HEADER, createProgram, drawFullscreen } from '../glUtils.js';
import { resolveScalar, type Pass, type PassContext, type ScalarParam } from '../pass.js';

export interface TiltShiftOptions {
  /** Top of the sharp band, 0..1. Default 0.35. */
  focusStart?: ScalarParam;
  /** Bottom of the sharp band, 0..1. Default 0.65. */
  focusEnd?: ScalarParam;
  /** Max blur in px at the frame edges. Default 8. */
  blur?: ScalarParam;
  /** Softness of the sharp-to-blurred transition, 0..1. Default 0.3. */
  gradient?: ScalarParam;
}

// 9-tap gaussian along uDirection, scaled by distance from the focus band.
const AXIS_FRAG = `
uniform vec2 uDirection;
uniform float uFocusStart;
uniform float uFocusEnd;
uniform float uBlur;
uniform float uGradient;

void main() {
  float below = uFocusStart - vUv.y;
  float above = vUv.y - uFocusEnd;
  float distToBand = max(max(below, above), 0.0);
  float strength = smoothstep(0.0, max(uGradient, 1e-3), distToBand);
  vec2 step = uDirection * uBlur * strength;

  float w0 = 0.227027, w1 = 0.1945946, w2 = 0.1216216, w3 = 0.054054, w4 = 0.016216;
  vec4 sum = texture(uTexture, vUv) * w0;
  sum += texture(uTexture, vUv + step * 1.0) * w1;
  sum += texture(uTexture, vUv - step * 1.0) * w1;
  sum += texture(uTexture, vUv + step * 2.0) * w2;
  sum += texture(uTexture, vUv - step * 2.0) * w2;
  sum += texture(uTexture, vUv + step * 3.0) * w3;
  sum += texture(uTexture, vUv - step * 3.0) * w3;
  sum += texture(uTexture, vUv + step * 4.0) * w4;
  sum += texture(uTexture, vUv - step * 4.0) * w4;
  fragColor = sum;
}`;

class TiltShiftPass implements Pass {
  private program: WebGLProgram;
  private loc: Record<string, WebGLUniformLocation | null>;

  constructor(
    gl: WebGL2RenderingContext,
    private options: TiltShiftOptions
  ) {
    this.program = createProgram(gl, FRAG_HEADER + AXIS_FRAG);
    this.loc = {
      texture: gl.getUniformLocation(this.program, 'uTexture'),
      direction: gl.getUniformLocation(this.program, 'uDirection'),
      focusStart: gl.getUniformLocation(this.program, 'uFocusStart'),
      focusEnd: gl.getUniformLocation(this.program, 'uFocusEnd'),
      blur: gl.getUniformLocation(this.program, 'uBlur'),
      gradient: gl.getUniformLocation(this.program, 'uGradient'),
    };
  }

  render(input: WebGLTexture, output: WebGLFramebuffer | null, ctx: PassContext): void {
    const { gl, width, height, t } = ctx;
    const focusStart = resolveScalar(this.options.focusStart, t, 0.35);
    const focusEnd = resolveScalar(this.options.focusEnd, t, 0.65);
    const blurPx = resolveScalar(this.options.blur, t, 8);
    const gradient = resolveScalar(this.options.gradient, t, 0.3);

    const mid = ctx.pool.acquire();
    gl.useProgram(this.program);
    gl.uniform1i(this.loc.texture, 0);
    if (this.loc.focusStart) gl.uniform1f(this.loc.focusStart, focusStart);
    if (this.loc.focusEnd) gl.uniform1f(this.loc.focusEnd, focusEnd);
    if (this.loc.blur) gl.uniform1f(this.loc.blur, blurPx / 4); // spread over 4 taps
    if (this.loc.gradient) gl.uniform1f(this.loc.gradient, gradient);

    // Horizontal: input -> mid
    gl.bindFramebuffer(gl.FRAMEBUFFER, mid.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    if (this.loc.direction) gl.uniform2f(this.loc.direction, 1 / width, 0);
    drawFullscreen(gl);

    // Vertical: mid -> output
    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    gl.viewport(0, 0, width, height);
    gl.bindTexture(gl.TEXTURE_2D, mid.texture);
    if (this.loc.direction) gl.uniform2f(this.loc.direction, 0, 1 / height);
    drawFullscreen(gl);

    ctx.pool.release(mid);
  }

  dispose(gl: WebGL2RenderingContext): void {
    gl.deleteProgram(this.program);
  }
}

export function tiltShift(gl: WebGL2RenderingContext, options: TiltShiftOptions = {}): Pass {
  return new TiltShiftPass(gl, options);
}

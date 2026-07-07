// Kawase blur, ported from pixi-filters (MIT): reference/pixi-filters/src/kawase-blur
// One cheap 4-tap program iterated `quality` times with growing offsets; the
// iteration count is fixed at construction, strength animates.

import { FRAG_HEADER, createProgram, drawFullscreen } from '../glUtils.js';
import { resolveScalar, type Pass, type PassContext, type ScalarParam } from '../pass.js';

export interface BlurOptions {
  /** Blur strength in px. Default 4. */
  strength?: ScalarParam;
  /** Number of kawase iterations, 1..8 (baked, not animatable). Default 3. */
  quality?: number;
}

const KAWASE_BODY = `
void main() {
  vec4 color = vec4(0.0);
  color += texture(uTexture, vUv + vec2(-uOffset.x,  uOffset.y));
  color += texture(uTexture, vUv + vec2( uOffset.x,  uOffset.y));
  color += texture(uTexture, vUv + vec2( uOffset.x, -uOffset.y));
  color += texture(uTexture, vUv + vec2(-uOffset.x, -uOffset.y));
  fragColor = color * 0.25;
}`;

export class KawaseBlurPass implements Pass {
  private program: WebGLProgram;
  private uOffset: WebGLUniformLocation | null;
  private uTexture: WebGLUniformLocation | null;

  constructor(
    gl: WebGL2RenderingContext,
    private quality: number,
    private strength: ScalarParam | undefined,
    private defaultStrength = 4
  ) {
    this.program = createProgram(gl, FRAG_HEADER + 'uniform vec2 uOffset;\n' + KAWASE_BODY);
    this.uOffset = gl.getUniformLocation(this.program, 'uOffset');
    this.uTexture = gl.getUniformLocation(this.program, 'uTexture');
  }

  render(input: WebGLTexture, output: WebGLFramebuffer | null, ctx: PassContext): void {
    const { gl, width, height, t } = ctx;
    const strength = Math.max(0, resolveScalar(this.strength, t, this.defaultStrength));
    const quality = Math.max(1, Math.round(this.quality));

    gl.useProgram(this.program);
    gl.uniform1i(this.uTexture, 0);

    let src = input;
    const scratch = [ctx.pool.acquire(), ctx.pool.acquire()];
    for (let i = 0; i < quality; i++) {
      const isLast = i === quality - 1;
      const target = scratch[i % 2];
      gl.bindFramebuffer(gl.FRAMEBUFFER, isLast ? output : target.framebuffer);
      gl.viewport(0, 0, width, height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src);
      const offset = ((i + 0.5) * strength) / quality;
      if (this.uOffset) gl.uniform2f(this.uOffset, offset / width, offset / height);
      drawFullscreen(gl);
      src = target.texture;
    }
    ctx.pool.release(scratch[0]);
    ctx.pool.release(scratch[1]);
  }

  dispose(gl: WebGL2RenderingContext): void {
    gl.deleteProgram(this.program);
  }
}

export function blur(gl: WebGL2RenderingContext, options: BlurOptions = {}): Pass {
  return new KawaseBlurPass(gl, options.quality ?? 3, options.strength);
}

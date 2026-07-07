// Drop shadow, modeled on pixi-filters' DropShadowFilter (MIT):
// extract an offset tinted silhouette -> kawase-blur it -> composite the
// original over it. Works in straight alpha; shines with transparent exports.

import { FRAG_HEADER, createProgram, drawFullscreen } from '../glUtils.js';
import {
  resolveColor,
  resolveScalar,
  type ColorParam,
  type Pass,
  type PassContext,
  type ScalarParam,
} from '../pass.js';

export interface DropShadowOptions {
  /** Shadow offset X in px. Default 4. */
  offsetX?: ScalarParam;
  /** Shadow offset Y in px. Default 4. */
  offsetY?: ScalarParam;
  /** Shadow color. Default '#000000'. */
  color?: ColorParam;
  /** Shadow opacity. Default 0.5. */
  alpha?: ScalarParam;
  /** Shadow blur strength in px. Default 3. */
  blur?: ScalarParam;
  /** Kawase blur iterations (baked, not animatable). Default 2. */
  quality?: number;
}

// 1) Offset silhouette: shadow alpha at (uv - offset), tinted.
const SILHOUETTE_FRAG = `
uniform vec2 uOffset;
uniform vec3 uColor;
uniform float uAlpha;

void main() {
  float a = texture(uTexture, clamp(vUv - uOffset, 0.0, 1.0)).a;
  // Zero out samples that came from outside the frame edge.
  vec2 pos = vUv - uOffset;
  if (pos != clamp(pos, 0.0, 1.0)) a = 0.0;
  fragColor = vec4(uColor, a * uAlpha);
}`;

// 2) Kawase tap (shared shape with blur.ts, kept local for independence).
const KAWASE_FRAG = `
uniform vec2 uKOffset;

void main() {
  vec4 color = vec4(0.0);
  color += texture(uTexture, vUv + vec2(-uKOffset.x,  uKOffset.y));
  color += texture(uTexture, vUv + vec2( uKOffset.x,  uKOffset.y));
  color += texture(uTexture, vUv + vec2( uKOffset.x, -uKOffset.y));
  color += texture(uTexture, vUv + vec2(-uKOffset.x, -uKOffset.y));
  fragColor = color * 0.25;
}`;

// 3) Composite: original over shadow (straight alpha).
const COMPOSITE_FRAG = `
uniform sampler2D uShadow;

void main() {
  vec4 src = texture(uTexture, vUv);
  vec4 shadow = texture(uShadow, vUv);
  float a = src.a + shadow.a * (1.0 - src.a);
  vec3 rgb = a > 0.0
    ? (src.rgb * src.a + shadow.rgb * shadow.a * (1.0 - src.a)) / a
    : vec3(0.0);
  fragColor = vec4(rgb, a);
}`;

class DropShadowPass implements Pass {
  private silhouette: WebGLProgram;
  private kawase: WebGLProgram;
  private composite: WebGLProgram;
  private loc: Record<string, WebGLUniformLocation | null>;

  constructor(
    gl: WebGL2RenderingContext,
    private options: DropShadowOptions
  ) {
    this.silhouette = createProgram(gl, FRAG_HEADER + SILHOUETTE_FRAG);
    this.kawase = createProgram(gl, FRAG_HEADER + KAWASE_FRAG);
    this.composite = createProgram(gl, FRAG_HEADER + COMPOSITE_FRAG);
    this.loc = {
      silTexture: gl.getUniformLocation(this.silhouette, 'uTexture'),
      silOffset: gl.getUniformLocation(this.silhouette, 'uOffset'),
      silColor: gl.getUniformLocation(this.silhouette, 'uColor'),
      silAlpha: gl.getUniformLocation(this.silhouette, 'uAlpha'),
      kawTexture: gl.getUniformLocation(this.kawase, 'uTexture'),
      kawOffset: gl.getUniformLocation(this.kawase, 'uKOffset'),
      compTexture: gl.getUniformLocation(this.composite, 'uTexture'),
      compShadow: gl.getUniformLocation(this.composite, 'uShadow'),
    };
  }

  render(input: WebGLTexture, output: WebGLFramebuffer | null, ctx: PassContext): void {
    const { gl, width, height, t } = ctx;
    const offsetX = resolveScalar(this.options.offsetX, t, 4);
    const offsetY = resolveScalar(this.options.offsetY, t, 4);
    const [r, g, b] = resolveColor(this.options.color, t, '#000000');
    const alpha = resolveScalar(this.options.alpha, t, 0.5);
    const blurPx = Math.max(0, resolveScalar(this.options.blur, t, 3));
    const quality = Math.max(1, Math.round(this.options.quality ?? 2));

    const a = ctx.pool.acquire();
    const b2 = ctx.pool.acquire();

    // 1) Tinted offset silhouette: input -> a
    gl.bindFramebuffer(gl.FRAMEBUFFER, a.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.silhouette);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    gl.uniform1i(this.loc.silTexture, 0);
    if (this.loc.silOffset) gl.uniform2f(this.loc.silOffset, offsetX / width, offsetY / height);
    if (this.loc.silColor) gl.uniform3f(this.loc.silColor, r, g, b);
    if (this.loc.silAlpha) gl.uniform1f(this.loc.silAlpha, alpha);
    drawFullscreen(gl);

    // 2) Kawase blur the shadow: a <-> b2
    gl.useProgram(this.kawase);
    gl.uniform1i(this.loc.kawTexture, 0);
    let shadowTex = a.texture;
    if (blurPx > 0) {
      const targets = [b2, a];
      for (let i = 0; i < quality; i++) {
        const target = targets[i % 2];
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, shadowTex);
        const off = ((i + 0.5) * blurPx) / quality;
        if (this.loc.kawOffset) gl.uniform2f(this.loc.kawOffset, off / width, off / height);
        drawFullscreen(gl);
        shadowTex = target.texture;
      }
    }

    // 3) Composite original over shadow -> output
    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.composite);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTex);
    gl.uniform1i(this.loc.compTexture, 0);
    gl.uniform1i(this.loc.compShadow, 1);
    drawFullscreen(gl);

    ctx.pool.release(a);
    ctx.pool.release(b2);
  }

  dispose(gl: WebGL2RenderingContext): void {
    gl.deleteProgram(this.silhouette);
    gl.deleteProgram(this.kawase);
    gl.deleteProgram(this.composite);
  }
}

export function dropShadow(gl: WebGL2RenderingContext, options: DropShadowOptions = {}): Pass {
  return new DropShadowPass(gl, options);
}

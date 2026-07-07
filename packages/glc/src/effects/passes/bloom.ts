// Bloom: bright-pass → separable Gaussian blur (H then V) → additive composite.
// This is a compound pass — it owns four programs and uses the target pool for
// its two intermediate buffers, then writes the glow back over the scene.

import { resolveScalar, type Pass, type PassContext, type ScalarParam } from '../pass.js';
import { FULLSCREEN_VERT, createProgram, drawFullscreen } from '../glUtils.js';

export interface BloomOptions {
  /** Glow intensity added back onto the scene. Default 0.8. */
  strength?: ScalarParam;
  /** Luminance above which pixels glow, 0..1. Default 0.6. */
  threshold?: ScalarParam;
  /** Blur spread in pixels. Default 3. */
  radius?: ScalarParam;
}

const BRIGHT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float uThreshold;
void main() {
  vec4 c = texture(uTexture, vUv);
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  float contribution = max(0.0, lum - uThreshold) / max(1e-4, 1.0 - uThreshold);
  // Keep transparent pixels from glowing by weighting with alpha.
  fragColor = vec4(c.rgb * contribution * c.a, c.a);
}`;

const BLUR_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform vec2 uDirection;
void main() {
  float w0 = 0.227027, w1 = 0.1945946, w2 = 0.1216216, w3 = 0.054054, w4 = 0.016216;
  vec4 sum = texture(uTexture, vUv) * w0;
  sum += texture(uTexture, vUv + uDirection * 1.0) * w1;
  sum += texture(uTexture, vUv - uDirection * 1.0) * w1;
  sum += texture(uTexture, vUv + uDirection * 2.0) * w2;
  sum += texture(uTexture, vUv - uDirection * 2.0) * w2;
  sum += texture(uTexture, vUv + uDirection * 3.0) * w3;
  sum += texture(uTexture, vUv - uDirection * 3.0) * w3;
  sum += texture(uTexture, vUv + uDirection * 4.0) * w4;
  sum += texture(uTexture, vUv - uDirection * 4.0) * w4;
  fragColor = sum;
}`;

const COMPOSITE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uStrength;
void main() {
  vec4 base = texture(uScene, vUv);
  vec4 glow = texture(uBloom, vUv);
  fragColor = vec4(base.rgb + glow.rgb * uStrength, base.a);
}`;

class BloomPass implements Pass {
  private bright: WebGLProgram;
  private blur: WebGLProgram;
  private composite: WebGLProgram;
  private loc: {
    threshold: WebGLUniformLocation | null;
    direction: WebGLUniformLocation | null;
    blurTex: WebGLUniformLocation | null;
    scene: WebGLUniformLocation | null;
    bloom: WebGLUniformLocation | null;
    strength: WebGLUniformLocation | null;
  };

  constructor(
    gl: WebGL2RenderingContext,
    private options: BloomOptions
  ) {
    this.bright = createProgram(gl, BRIGHT_FRAG);
    this.blur = createProgram(gl, BLUR_FRAG);
    this.composite = createProgram(gl, COMPOSITE_FRAG);
    this.loc = {
      threshold: gl.getUniformLocation(this.bright, 'uThreshold'),
      direction: gl.getUniformLocation(this.blur, 'uDirection'),
      blurTex: gl.getUniformLocation(this.blur, 'uTexture'),
      scene: gl.getUniformLocation(this.composite, 'uScene'),
      bloom: gl.getUniformLocation(this.composite, 'uBloom'),
      strength: gl.getUniformLocation(this.composite, 'uStrength'),
    };
    void FULLSCREEN_VERT; // shared vertex shader is compiled inside createProgram
  }

  render(input: WebGLTexture, output: WebGLFramebuffer | null, ctx: PassContext): void {
    const { gl, width, height, t } = ctx;
    const strength = resolveScalar(this.options.strength, t, 0.8);
    const threshold = resolveScalar(this.options.threshold, t, 0.6);
    const radius = resolveScalar(this.options.radius, t, 3);

    const a = ctx.pool.acquire();
    const b = ctx.pool.acquire();

    // 1) bright-pass: input -> a
    gl.bindFramebuffer(gl.FRAMEBUFFER, a.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.bright);
    bindTexture(gl, input, 0);
    if (this.loc.threshold) gl.uniform1f(this.loc.threshold, threshold);
    drawFullscreen(gl);

    // 2) blur horizontal: a -> b
    gl.bindFramebuffer(gl.FRAMEBUFFER, b.framebuffer);
    gl.useProgram(this.blur);
    bindTexture(gl, a.texture, 0);
    gl.uniform1i(this.loc.blurTex, 0);
    if (this.loc.direction) gl.uniform2f(this.loc.direction, radius / width, 0);
    drawFullscreen(gl);

    // 3) blur vertical: b -> a
    gl.bindFramebuffer(gl.FRAMEBUFFER, a.framebuffer);
    gl.useProgram(this.blur);
    bindTexture(gl, b.texture, 0);
    gl.uniform1i(this.loc.blurTex, 0);
    if (this.loc.direction) gl.uniform2f(this.loc.direction, 0, radius / height);
    drawFullscreen(gl);

    // 4) composite: scene(input) + blurred glow(a) -> output
    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.composite);
    bindTexture(gl, input, 0);
    bindTexture(gl, a.texture, 1);
    if (this.loc.scene) gl.uniform1i(this.loc.scene, 0);
    if (this.loc.bloom) gl.uniform1i(this.loc.bloom, 1);
    if (this.loc.strength) gl.uniform1f(this.loc.strength, strength);
    drawFullscreen(gl);

    ctx.pool.release(a);
    ctx.pool.release(b);
  }

  dispose(gl: WebGL2RenderingContext): void {
    gl.deleteProgram(this.bright);
    gl.deleteProgram(this.blur);
    gl.deleteProgram(this.composite);
  }
}

function bindTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, unit: number): void {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

export function bloom(gl: WebGL2RenderingContext, options: BloomOptions = {}): Pass {
  return new BloomPass(gl, options);
}

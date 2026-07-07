// EffectComposer owns an internal, offscreen WebGL2 canvas and runs the pass
// chain. It never becomes the public canvas: apply() uploads the 2D scene as a
// texture, ping-pongs the passes, renders the last one to the WebGL canvas, then
// draws that result back onto the same 2D canvas (composite 'copy'). This keeps
// every existing export path — which reads pixels from the 2D canvas — unchanged.

import type { Pass, PassContext, TargetPool } from './pass.js';
import {
  createInputTexture,
  createRenderTarget,
  deleteRenderTarget,
  uploadCanvasToTexture,
  type RenderTarget,
} from './glUtils.js';

export class EffectComposer {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private inputTexture: WebGLTexture | null = null;
  private passes: Pass[] = [];
  private enabled = true;
  private width: number;
  private height: number;

  // Ping-pong targets for chaining passes, plus a separate pool for compound
  // passes (bloom) that need their own scratch buffers mid-pass.
  private pingPong: [RenderTarget, RenderTarget] | null = null;
  private poolFree: RenderTarget[] = [];
  private poolUsed: RenderTarget[] = [];

  constructor(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      // Straight (non-premultiplied) alpha so transparent backgrounds survive.
      const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        preserveDrawingBuffer: true,
      });
      if (gl) {
        this.canvas = canvas;
        this.gl = gl;
        gl.disable(gl.BLEND);
        this.inputTexture = createInputTexture(gl);
        this.pingPong = [
          createRenderTarget(gl, this.width, this.height),
          createRenderTarget(gl, this.width, this.height),
        ];
      }
    } catch {
      // WebGL2 unavailable (headless/jsdom/old browser): stay disabled and let
      // rendering fall back to plain 2D.
      this.gl = null;
    }
  }

  /** The GL context, or null when WebGL2 is unavailable (passes can't be built). */
  getGL(): WebGL2RenderingContext | null {
    return this.gl;
  }

  get supported(): boolean {
    return this.gl !== null;
  }

  add(pass: Pass): void {
    this.passes.push(pass);
  }

  removeAt(index: number): void {
    const [removed] = this.passes.splice(index, 1);
    if (removed && this.gl) removed.dispose(this.gl);
  }

  clear(): void {
    if (this.gl) {
      for (const pass of this.passes) pass.dispose(this.gl);
    }
    this.passes.length = 0;
  }

  count(): number {
    return this.passes.length;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** True when there is real work to do (supported, enabled, at least one pass). */
  isActive(): boolean {
    return this.gl !== null && this.enabled && this.passes.length > 0;
  }

  resize(width: number, height: number): void {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    const gl = this.gl;
    if (!gl || !this.canvas) return;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.pingPong) {
      deleteRenderTarget(gl, this.pingPong[0]);
      deleteRenderTarget(gl, this.pingPong[1]);
      this.pingPong = [createRenderTarget(gl, w, h), createRenderTarget(gl, w, h)];
    }
    for (const target of [...this.poolFree, ...this.poolUsed]) deleteRenderTarget(gl, target);
    this.poolFree = [];
    this.poolUsed = [];
  }

  private pool: TargetPool = {
    acquire: () => {
      const gl = this.gl!;
      const target = this.poolFree.pop() ?? createRenderTarget(gl, this.width, this.height);
      this.poolUsed.push(target);
      return target;
    },
    release: (target: RenderTarget) => {
      const i = this.poolUsed.indexOf(target);
      if (i >= 0) this.poolUsed.splice(i, 1);
      this.poolFree.push(target);
    },
  };

  /**
   * Runs the pass chain on `sceneCanvas` and writes the composited result back
   * onto it via the 2D context. No-op when inactive (scene is already correct).
   */
  apply(ctx2d: CanvasRenderingContext2D, sceneCanvas: HTMLCanvasElement, t: number): void {
    const gl = this.gl;
    if (!gl || !this.canvas || !this.pingPong || !this.inputTexture || !this.isActive()) return;

    // Keep the WebGL canvas matched to the scene size.
    if (this.width !== sceneCanvas.width || this.height !== sceneCanvas.height) {
      this.resize(sceneCanvas.width, sceneCanvas.height);
    }

    uploadCanvasToTexture(gl, this.inputTexture, sceneCanvas);

    const ctx: PassContext = { gl, width: this.width, height: this.height, t, pool: this.pool };
    let src: WebGLTexture = this.inputTexture;
    const last = this.passes.length - 1;
    for (let i = 0; i < this.passes.length; i++) {
      const isLast = i === last;
      const target = this.pingPong[i % 2];
      const output = isLast ? null : target.framebuffer;
      this.passes[i].render(src, output, ctx);
      if (!isLast) src = target.texture;
    }

    // The WebGL canvas now holds the final image; replace the 2D canvas with
    // it. The single vertical flip here restores upright orientation (the
    // pipeline runs with vUv.y = 0 at the image top; GL's default framebuffer
    // has y = 0 at the bottom).
    ctx2d.save();
    ctx2d.globalCompositeOperation = 'copy';
    ctx2d.translate(0, sceneCanvas.height);
    ctx2d.scale(1, -1);
    ctx2d.drawImage(this.canvas, 0, 0, sceneCanvas.width, sceneCanvas.height);
    ctx2d.restore();
  }

  dispose(): void {
    const gl = this.gl;
    if (!gl) return;
    this.clear();
    if (this.pingPong) {
      deleteRenderTarget(gl, this.pingPong[0]);
      deleteRenderTarget(gl, this.pingPong[1]);
      this.pingPong = null;
    }
    for (const target of [...this.poolFree, ...this.poolUsed]) deleteRenderTarget(gl, target);
    this.poolFree = [];
    this.poolUsed = [];
    if (this.inputTexture) gl.deleteTexture(this.inputTexture);
    this.inputTexture = null;
    this.gl = null;
    this.canvas = null;
  }
}

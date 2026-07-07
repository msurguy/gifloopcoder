// A Pass takes an input texture, does its work, and writes into an output
// framebuffer (null = the WebGL canvas itself, i.e. the last pass in the chain).
// Simple effects are a single ShaderPass; compound ones (bloom) implement Pass
// directly and lean on the target pool for their intermediate steps.

import * as valueParser from '../parsers/valueParser.js';
import type { PropValue } from '../types.js';
import { FRAG_HEADER, createProgram, drawFullscreen, type RenderTarget } from './glUtils.js';

/** A built-in pass's scalar param — the same animatable forms as shape props. */
export type ScalarParam = PropValue<number>;

/** A custom-shader uniform: a literal scalar/vector, or a fn(t) returning one. */
export type UniformValue = number | number[] | ((t: number) => number | number[]);

/** A pool of reusable render targets, so compound passes don't allocate per frame. */
export interface TargetPool {
  acquire(): RenderTarget;
  release(target: RenderTarget): void;
}

export interface PassContext {
  gl: WebGL2RenderingContext;
  width: number;
  height: number;
  /** Current loop time (0..1); drives animatable uniforms deterministically. */
  t: number;
  pool: TargetPool;
}

export interface Pass {
  /** Renders `input` into `output` (null = the default framebuffer / screen). */
  render(input: WebGLTexture, output: WebGLFramebuffer | null, ctx: PassContext): void;
  dispose(gl: WebGL2RenderingContext): void;
}

/** Resolves a scalar param through the shared valueParser (number | [a,b] | keyframes | fn). */
export function resolveScalar(param: ScalarParam | undefined, t: number, def: number): number {
  if (param === undefined) return def;
  return valueParser.getNumber(param, t, def);
}

/** A color param: '#rgb'/'#rrggbb' hex, an [r,g,b] 0..1 array, or fn(t) → either. */
export type ColorParam = string | [number, number, number] | ((t: number) => string | [number, number, number]);

/** Resolves a color param to [r,g,b] floats (0..1). */
export function resolveColor(param: ColorParam | undefined, t: number, defHex: string): [number, number, number] {
  let value: string | [number, number, number] = param === undefined ? defHex : typeof param === 'function' ? param(t) : param;
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') value = defHex;
  return hexToRgb(value) ?? hexToRgb(defHex) ?? [0, 0, 0];
}

export function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/** Resolves a boolean-ish param (bool | fn(t)) to a 0/1 shader float. */
export function resolveBool(param: boolean | ((t: number) => boolean) | undefined, t: number, def: boolean): number {
  const v = param === undefined ? def : typeof param === 'function' ? param(t) : param;
  return v ? 1 : 0;
}

/** Evaluates a custom uniform, calling it with t if it's a function. */
export function evalUniform(value: UniformValue, t: number): number | number[] {
  return typeof value === 'function' ? value(t) : value;
}

/** Sets a uniform from an already-evaluated scalar or vector (length 1..4). */
export function setUniform(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  value: number | number[]
): void {
  if (location === null) return;
  if (typeof value === 'number') {
    gl.uniform1f(location, value);
    return;
  }
  switch (value.length) {
    case 1:
      gl.uniform1f(location, value[0]);
      break;
    case 2:
      gl.uniform2f(location, value[0], value[1]);
      break;
    case 3:
      gl.uniform3f(location, value[0], value[1], value[2]);
      break;
    case 4:
      gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      break;
    default:
      // Longer arrays are float[] uniforms (e.g. colorMatrix's 20 floats).
      gl.uniform1fv(location, value);
      break;
  }
}

/**
 * A single-program pass. `fragmentBody` is GLSL that assigns `fragColor`, with
 * uTexture/uResolution/uTime and any declared custom uniforms already in scope
 * (see FRAG_HEADER). Custom uniforms are declared automatically from `uniforms`.
 */
export class ShaderPass implements Pass {
  private program: WebGLProgram;
  private uTexture: WebGLUniformLocation | null;
  private uResolution: WebGLUniformLocation | null;
  private uTime: WebGLUniformLocation | null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};

  constructor(
    gl: WebGL2RenderingContext,
    fragmentBody: string,
    private uniforms: Record<string, UniformValue> = {},
    /** Optional GLSL declaration block (custom uniform types); auto-generated if omitted. */
    declarations?: string
  ) {
    const decls = declarations ?? autoDeclareUniforms(gl, uniforms);
    this.program = createProgram(gl, FRAG_HEADER + decls + '\nvoid main() {\n' + fragmentBody + '\n}');
    this.uTexture = gl.getUniformLocation(this.program, 'uTexture');
    this.uResolution = gl.getUniformLocation(this.program, 'uResolution');
    this.uTime = gl.getUniformLocation(this.program, 'uTime');
    for (const name of Object.keys(uniforms)) {
      this.uniformLocations[name] = gl.getUniformLocation(this.program, name);
    }
  }

  render(input: WebGLTexture, output: WebGLFramebuffer | null, ctx: PassContext): void {
    const { gl, width, height, t } = ctx;
    gl.bindFramebuffer(gl.FRAMEBUFFER, output);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    setUniform(gl, this.uTexture, 0);
    if (this.uResolution) gl.uniform2f(this.uResolution, width, height);
    if (this.uTime) gl.uniform1f(this.uTime, t);
    for (const name of Object.keys(this.uniforms)) {
      setUniform(gl, this.uniformLocations[name], evalUniform(this.uniforms[name], t));
    }
    drawFullscreen(gl);
  }

  dispose(gl: WebGL2RenderingContext): void {
    gl.deleteProgram(this.program);
  }
}

/** Infers `uniform float`/`vecN` declarations from the initial uniform values. */
function autoDeclareUniforms(_gl: WebGL2RenderingContext, uniforms: Record<string, UniformValue>): string {
  const lines: string[] = [];
  for (const [name, value] of Object.entries(uniforms)) {
    // Functions are assumed scalar unless their initial call returns a vector;
    // we can't call them here (no t), so default functions to float. Authors
    // needing vec uniforms should pass an initial array literal.
    const sample = typeof value === 'function' ? 0 : value;
    if (typeof sample === 'number' || sample.length <= 1) {
      lines.push(`uniform float ${name};`);
    } else if (sample.length <= 4) {
      lines.push(`uniform vec${sample.length} ${name};`);
    } else {
      // Long arrays become float[] uniforms (see setUniform's uniform1fv path).
      lines.push(`uniform float ${name}[${sample.length}];`);
    }
  }
  return lines.join('\n');
}

// Public post-processing surface. `builtinPasses` maps effect names to pass
// factories; `createEffects` returns the controller exposed as `glc.effects`.
// The composer (and its WebGL context) is created lazily on the first effect so
// sketches that use none pay nothing.

import { EffectComposer } from './composer.js';
import type { Pass } from './pass.js';
import { adjustment, type AdjustmentOptions } from './passes/adjustment.js';
import { ascii, type AsciiOptions } from './passes/ascii.js';
import { bloom, type BloomOptions } from './passes/bloom.js';
import { blur, type BlurOptions } from './passes/blur.js';
import { bulgePinch, type BulgePinchOptions } from './passes/bulgePinch.js';
import { chromaticAberration, type ChromaticAberrationOptions } from './passes/chromaticAberration.js';
import { colorMatrix, type ColorMatrixOptions } from './passes/colorMatrix.js';
import { crossHatch, type CrossHatchOptions } from './passes/crossHatch.js';
import { crt, type CrtOptions } from './passes/crt.js';
import { customShader, type ShaderPassOptions } from './passes/customShader.js';
import { dot, type DotOptions } from './passes/dot.js';
import { dropShadow, type DropShadowOptions } from './passes/dropShadow.js';
import { emboss, type EmbossOptions } from './passes/emboss.js';
import { filmGrain, type FilmGrainOptions } from './passes/filmGrain.js';
import { glitch, type GlitchOptions } from './passes/glitch.js';
import { glow, type GlowOptions } from './passes/glow.js';
import { godray, type GodrayOptions } from './passes/godray.js';
import { hslAdjustment, type HslAdjustmentOptions } from './passes/hslAdjustment.js';
import { motionBlur, type MotionBlurOptions } from './passes/motionBlur.js';
import { oldFilm, type OldFilmOptions } from './passes/oldFilm.js';
import { outline, type OutlineOptions } from './passes/outline.js';
import { pixelate, type PixelateOptions } from './passes/pixelate.js';
import { radialBlur, type RadialBlurOptions } from './passes/radialBlur.js';
import { reflection, type ReflectionOptions } from './passes/reflection.js';
import { rgbSplit, type RgbSplitOptions } from './passes/rgbSplit.js';
import { shockwave, type ShockwaveOptions } from './passes/shockwave.js';
import { tiltShift, type TiltShiftOptions } from './passes/tiltShift.js';
import { twist, type TwistOptions } from './passes/twist.js';
import { vignette, type VignetteOptions } from './passes/vignette.js';
import { zoomBlur, type ZoomBlurOptions } from './passes/zoomBlur.js';

export const builtinPasses = {
  adjustment,
  ascii,
  bloom,
  blur,
  bulgePinch,
  chromaticAberration,
  colorMatrix,
  crossHatch,
  crt,
  dot,
  dropShadow,
  emboss,
  filmGrain,
  glitch,
  glow,
  godray,
  hslAdjustment,
  motionBlur,
  oldFilm,
  outline,
  pixelate,
  radialBlur,
  reflection,
  rgbSplit,
  shockwave,
  tiltShift,
  twist,
  vignette,
  zoomBlur,
} as const;

export type BuiltinEffectName = keyof typeof builtinPasses;

/** Options accepted by each built-in effect, keyed by name. */
export interface BuiltinEffectOptions {
  adjustment: AdjustmentOptions;
  ascii: AsciiOptions;
  bloom: BloomOptions;
  blur: BlurOptions;
  bulgePinch: BulgePinchOptions;
  chromaticAberration: ChromaticAberrationOptions;
  colorMatrix: ColorMatrixOptions;
  crossHatch: CrossHatchOptions;
  crt: CrtOptions;
  dot: DotOptions;
  dropShadow: DropShadowOptions;
  emboss: EmbossOptions;
  filmGrain: FilmGrainOptions;
  glitch: GlitchOptions;
  glow: GlowOptions;
  godray: GodrayOptions;
  hslAdjustment: HslAdjustmentOptions;
  motionBlur: MotionBlurOptions;
  oldFilm: OldFilmOptions;
  outline: OutlineOptions;
  pixelate: PixelateOptions;
  radialBlur: RadialBlurOptions;
  reflection: ReflectionOptions;
  rgbSplit: RgbSplitOptions;
  shockwave: ShockwaveOptions;
  tiltShift: TiltShiftOptions;
  twist: TwistOptions;
  vignette: VignetteOptions;
  zoomBlur: ZoomBlurOptions;
}

/** A serializable effect option value (survives postMessage/structured clone). */
export type EffectOptionValue = number | number[] | string | boolean;

/**
 * Serializable effect description (used by the playground to ship effects into
 * the sandbox). Option values must be plain data since it crosses postMessage.
 */
export type EffectConfig =
  | { type: BuiltinEffectName; options?: Record<string, EffectOptionValue> }
  | { type: 'shader'; fragment: string; uniforms?: Record<string, number | number[]> };

/** The `glc.effects` controller surface available to sketches. */
export interface Effects {
  /** Append a built-in effect. Returns its index (or -1 if WebGL2 is unavailable). */
  add<K extends BuiltinEffectName>(name: K, options?: BuiltinEffectOptions[K]): number;
  /** Append a custom GLSL fragment pass. Returns its index (or -1 if unavailable). */
  addShader(options: ShaderPassOptions): number;
  /** Remove the effect at `index`. */
  remove(index: number): void;
  /** Remove all effects. */
  clear(): void;
  /** Enable/disable the whole chain without removing passes. */
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  /** True when effects will actually run (supported + enabled + non-empty). */
  isActive(): boolean;
  /** Number of effects in the chain. */
  count(): number;
  /** True when WebGL2 post-processing is available in this environment. */
  isSupported(): boolean;
}

export interface EffectsHost {
  /** Current canvas size, used when the composer is first created. */
  getSize(): { width: number; height: number };
  /** Called once, the first time a composer exists, so the host can wire it in. */
  onComposerReady(composer: EffectComposer): void;
  /** Called after any change so the host can re-render the current (paused) frame. */
  requestRender(): void;
}

export function createEffects(host: EffectsHost): Effects & { getComposer(): EffectComposer | null } {
  let composer: EffectComposer | null = null;

  function ensureComposer(): EffectComposer {
    if (!composer) {
      const { width, height } = host.getSize();
      composer = new EffectComposer(width, height);
      host.onComposerReady(composer);
    }
    return composer;
  }

  function addPass(build: (gl: WebGL2RenderingContext) => Pass): number {
    const c = ensureComposer();
    const gl = c.getGL();
    if (!gl) return -1; // unsupported → no-op
    c.add(build(gl));
    host.requestRender();
    return c.count() - 1;
  }

  return {
    add(name, options) {
      return addPass((gl) => builtinPasses[name](gl, (options ?? {}) as never));
    },
    addShader(options) {
      return addPass((gl) => customShader(gl, options));
    },
    remove(index) {
      if (!composer) return;
      composer.removeAt(index);
      host.requestRender();
    },
    clear() {
      if (!composer) return;
      composer.clear();
      host.requestRender();
    },
    setEnabled(enabled) {
      ensureComposer().setEnabled(enabled);
      host.requestRender();
    },
    isEnabled() {
      return composer ? composer.isEnabled() : true;
    },
    isActive() {
      return composer ? composer.isActive() : false;
    },
    count() {
      return composer ? composer.count() : 0;
    },
    isSupported() {
      return ensureComposer().supported;
    },
    getComposer() {
      return composer;
    },
  };
}

export { EffectComposer } from './composer.js';
export { effectMeta, EFFECT_CATEGORIES, defaultEffectOptions } from './meta.js';
export type { EffectMeta, EffectParamMeta, EffectCategory } from './meta.js';
export { colorMatrixPresets } from './passes/colorMatrix.js';
export type { Pass, PassContext, UniformValue, ScalarParam, ColorParam } from './pass.js';
export type { ShaderPassOptions } from './passes/customShader.js';
export type { BloomOptions } from './passes/bloom.js';
export type { ChromaticAberrationOptions } from './passes/chromaticAberration.js';
export type { VignetteOptions } from './passes/vignette.js';
export type { FilmGrainOptions } from './passes/filmGrain.js';

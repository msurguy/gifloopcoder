export { createGLC, GLC, type GLC as GLCInstance, type GLCOptions, type GLCModel } from './glc.js';
export { createRenderList, type RenderList, type ShapeAddMethods } from './renderList.js';
export { createScheduler, type Scheduler } from './scheduler.js';
export { Shape, type ShapeType } from './shape.js';
export { shapeTypes, type ShapeTypeName } from './shapes/index.js';
export { color, type ColorLib } from './color.js';
export { createDefaultStyles } from './styles.js';
export * as valueParser from './parsers/valueParser.js';
export * as colorParser from './parsers/colorParser.js';
export type {
  PropValue,
  ShapeProps,
  Interpolation,
  InterpolationMode,
  Styles,
  GradientDef,
  GradientStop,
  LinearGradientDef,
  RadialGradientDef,
} from './types.js';

export {
  renderFrames,
  getFrameCount,
  type ExportSource,
  type FrameLoopOptions,
} from './export/frameRenderer.js';
export { exportGif, type GifExportOptions } from './export/gif.js';
export {
  exportVideo,
  resolveVideoCodec,
  type VideoExportOptions,
  type VideoExportResult,
  type VideoFormat,
} from './export/video.js';
export { exportPng, exportPngSequence } from './export/png.js';
export { detectExportSupport, type ExportSupport } from './export/capabilities.js';

export {
  createEffects,
  builtinPasses,
  EffectComposer,
  effectMeta,
  EFFECT_CATEGORIES,
  defaultEffectOptions,
  colorMatrixPresets,
  type Effects,
  type EffectsHost,
  type EffectConfig,
  type EffectOptionValue,
  type EffectMeta,
  type EffectParamMeta,
  type EffectCategory,
  type BuiltinEffectName,
  type BuiltinEffectOptions,
  type Pass,
  type PassContext,
  type ScalarParam,
  type ColorParam,
  type UniformValue,
  type ShaderPassOptions,
  type BloomOptions,
  type ChromaticAberrationOptions,
  type VignetteOptions,
  type FilmGrainOptions,
} from './effects/index.js';

// Default export kept for drop-in compatibility with the old UMD bundle usage:
//   var glc = new GLC(document.getElementById('sketch'));
export { GLC as default } from './glc.js';

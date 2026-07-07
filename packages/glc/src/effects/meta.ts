// Self-describing metadata for every built-in effect: label, category, and the
// panel-editable params (key/range/default). UIs render entirely from this —
// no per-effect UI code anywhere. Params not listed here (e.g. animatable
// time/seed overrides) are still available programmatically; see the docs.
//
// NOTE: type-only import — no runtime cycle with index.ts, and no WebGL code
// is pulled into bundles that only need the metadata.

import type { BuiltinEffectName } from './index.js';

export type EffectCategory = 'Color' | 'Blur' | 'Distort' | 'Stylize' | 'Retro' | 'Light';

export const EFFECT_CATEGORIES: readonly EffectCategory[] = [
  'Color',
  'Blur',
  'Distort',
  'Stylize',
  'Retro',
  'Light',
];

export type EffectParamMeta =
  | { kind: 'number'; key: string; label: string; min: number; max: number; step: number; default: number }
  | { kind: 'color'; key: string; label: string; default: string }
  | { kind: 'enum'; key: string; label: string; options: readonly string[]; default: string }
  | { kind: 'boolean'; key: string; label: string; default: boolean };

export interface EffectMeta {
  label: string;
  category: EffectCategory;
  params: readonly EffectParamMeta[];
}

const num = (
  key: string,
  label: string,
  min: number,
  max: number,
  step: number,
  def: number
): EffectParamMeta => ({ kind: 'number', key, label, min, max, step, default: def });

const bool = (key: string, label: string, def: boolean): EffectParamMeta => ({
  kind: 'boolean',
  key,
  label,
  default: def,
});

const color = (key: string, label: string, def: string): EffectParamMeta => ({
  kind: 'color',
  key,
  label,
  default: def,
});

// The Record keying forces compile-time exhaustiveness: adding a pass to
// builtinPasses without meta here is a type error (and vice versa).
export const effectMeta: Record<BuiltinEffectName, EffectMeta> = {
  // --- Color ---
  adjustment: {
    label: 'Adjustment',
    category: 'Color',
    params: [
      num('gamma', 'Gamma', 0.1, 5, 0.05, 1),
      num('saturation', 'Saturation', 0, 3, 0.05, 1),
      num('contrast', 'Contrast', 0, 3, 0.05, 1),
      num('brightness', 'Brightness', 0, 3, 0.05, 1),
      num('red', 'Red', 0, 3, 0.05, 1),
      num('green', 'Green', 0, 3, 0.05, 1),
      num('blue', 'Blue', 0, 3, 0.05, 1),
      num('alpha', 'Alpha', 0, 1, 0.02, 1),
    ],
  },
  colorMatrix: {
    label: 'Color matrix',
    category: 'Color',
    params: [
      {
        kind: 'enum',
        key: 'preset',
        label: 'Preset',
        options: [
          'blackAndWhite',
          'sepia',
          'vintage',
          'polaroid',
          'kodachrome',
          'technicolor',
          'browni',
          'lsd',
          'negative',
          'predator',
        ],
        default: 'sepia',
      },
      num('amount', 'Amount', 0, 1, 0.02, 1),
    ],
  },
  hslAdjustment: {
    label: 'HSL adjust',
    category: 'Color',
    params: [
      num('hue', 'Hue °', -180, 180, 1, 0),
      num('saturation', 'Saturation', -1, 1, 0.02, 0),
      num('lightness', 'Lightness', -1, 1, 0.02, 0),
      bool('colorize', 'Colorize', false),
      num('alpha', 'Mix', 0, 1, 0.02, 1),
    ],
  },

  // --- Blur ---
  blur: {
    label: 'Blur',
    category: 'Blur',
    params: [num('strength', 'Strength', 0, 32, 0.5, 4), num('quality', 'Quality', 1, 8, 1, 3)],
  },
  motionBlur: {
    label: 'Motion blur',
    category: 'Blur',
    params: [
      num('velocityX', 'Velocity X', -90, 90, 1, 20),
      num('velocityY', 'Velocity Y', -90, 90, 1, 0),
      num('kernelSize', 'Samples', 3, 25, 2, 5),
    ],
  },
  radialBlur: {
    label: 'Radial blur',
    category: 'Blur',
    params: [
      num('angle', 'Angle °', 0, 90, 1, 12),
      num('centerX', 'Center X', 0, 1, 0.01, 0.5),
      num('centerY', 'Center Y', 0, 1, 0.01, 0.5),
      num('kernelSize', 'Samples', 3, 31, 2, 9),
    ],
  },
  tiltShift: {
    label: 'Tilt shift',
    category: 'Blur',
    params: [
      num('focusStart', 'Focus top', 0, 1, 0.01, 0.35),
      num('focusEnd', 'Focus bottom', 0, 1, 0.01, 0.65),
      num('blur', 'Blur', 0, 30, 0.5, 8),
      num('gradient', 'Gradient', 0.01, 1, 0.01, 0.3),
    ],
  },
  zoomBlur: {
    label: 'Zoom blur',
    category: 'Blur',
    params: [
      num('strength', 'Strength', 0, 0.5, 0.01, 0.1),
      num('centerX', 'Center X', 0, 1, 0.01, 0.5),
      num('centerY', 'Center Y', 0, 1, 0.01, 0.5),
      num('innerRadius', 'Inner radius', 0, 300, 5, 0),
    ],
  },

  // --- Distort ---
  bulgePinch: {
    label: 'Bulge / pinch',
    category: 'Distort',
    params: [
      num('centerX', 'Center X', 0, 1, 0.01, 0.5),
      num('centerY', 'Center Y', 0, 1, 0.01, 0.5),
      num('radius', 'Radius px', 10, 500, 5, 100),
      num('strength', 'Strength', -1, 1, 0.05, 1),
    ],
  },
  glitch: {
    label: 'Glitch',
    category: 'Distort',
    params: [
      num('slices', 'Slices', 2, 30, 1, 8),
      num('offset', 'Offset', 0, 0.3, 0.005, 0.05),
      num('direction', 'Direction °', 0, 360, 5, 0),
      num('rgbOffset', 'RGB split px', 0, 20, 0.5, 2),
      num('density', 'Density', 0, 1, 0.05, 0.6),
    ],
  },
  reflection: {
    label: 'Reflection',
    category: 'Distort',
    params: [
      bool('mirror', 'Mirror', true),
      num('boundary', 'Boundary', 0, 1, 0.01, 0.5),
      num('amplitudeStart', 'Amplitude near', 0, 50, 1, 0),
      num('amplitudeEnd', 'Amplitude far', 0, 50, 1, 20),
      num('wavelengthStart', 'Wavelength near', 1, 200, 1, 30),
      num('wavelengthEnd', 'Wavelength far', 1, 200, 1, 100),
      num('alphaStart', 'Alpha near', 0, 1, 0.02, 1),
      num('alphaEnd', 'Alpha far', 0, 1, 0.02, 1),
    ],
  },
  shockwave: {
    label: 'Shockwave',
    category: 'Distort',
    params: [
      num('centerX', 'Center X', 0, 1, 0.01, 0.5),
      num('centerY', 'Center Y', 0, 1, 0.01, 0.5),
      num('speed', 'Speed', 50, 2000, 10, 500),
      num('amplitude', 'Amplitude', 0, 100, 1, 30),
      num('wavelength', 'Wavelength', 10, 400, 5, 160),
      num('brightness', 'Brightness', 0.5, 2, 0.05, 1.25),
    ],
  },
  twist: {
    label: 'Twist',
    category: 'Distort',
    params: [
      num('radius', 'Radius px', 10, 600, 5, 200),
      num('angle', 'Angle', -10, 10, 0.1, 4),
      num('offsetX', 'Center X', 0, 1, 0.01, 0.5),
      num('offsetY', 'Center Y', 0, 1, 0.01, 0.5),
    ],
  },

  // --- Stylize ---
  ascii: {
    label: 'ASCII',
    category: 'Stylize',
    params: [num('size', 'Cell size', 2, 32, 1, 8)],
  },
  crossHatch: {
    label: 'Cross hatch',
    category: 'Stylize',
    params: [num('spacing', 'Spacing', 2, 30, 1, 10)],
  },
  dot: {
    label: 'Halftone dot',
    category: 'Stylize',
    params: [
      num('scale', 'Scale', 0.1, 3, 0.05, 1),
      num('angle', 'Angle', 0, 10, 0.1, 5),
      bool('grayscale', 'Grayscale', true),
    ],
  },
  dropShadow: {
    label: 'Drop shadow',
    category: 'Stylize',
    params: [
      num('offsetX', 'Offset X', -50, 50, 1, 4),
      num('offsetY', 'Offset Y', -50, 50, 1, 4),
      color('color', 'Color', '#000000'),
      num('alpha', 'Alpha', 0, 1, 0.02, 0.5),
      num('blur', 'Blur', 0, 20, 0.5, 3),
    ],
  },
  emboss: {
    label: 'Emboss',
    category: 'Stylize',
    params: [num('strength', 'Strength', 0, 20, 0.5, 5)],
  },
  outline: {
    label: 'Outline',
    category: 'Stylize',
    params: [
      num('thickness', 'Thickness px', 0, 20, 0.5, 1),
      color('color', 'Color', '#000000'),
      num('alpha', 'Alpha', 0, 1, 0.02, 1),
      bool('knockout', 'Knockout', false),
    ],
  },
  pixelate: {
    label: 'Pixelate',
    category: 'Stylize',
    params: [num('size', 'Block size', 1, 64, 1, 10)],
  },

  // --- Retro ---
  chromaticAberration: {
    label: 'Chromatic aberration',
    category: 'Retro',
    params: [num('amount', 'Amount px', 0, 20, 0.5, 3)],
  },
  crt: {
    label: 'CRT',
    category: 'Retro',
    params: [
      num('curvature', 'Curvature', 0, 10, 0.1, 1),
      num('lineWidth', 'Line width', 0, 5, 0.1, 1),
      num('lineContrast', 'Line contrast', 0, 1, 0.01, 0.25),
      bool('verticalLine', 'Vertical lines', false),
      num('noise', 'Noise', 0, 1, 0.01, 0.2),
      num('noiseSize', 'Noise size', 1, 10, 0.5, 1),
      num('vignetting', 'Vignette', 0, 1, 0.01, 0.3),
      num('vignettingAlpha', 'Vignette alpha', 0, 1, 0.01, 1),
      num('vignettingBlur', 'Vignette blur', 0, 1, 0.01, 0.3),
    ],
  },
  filmGrain: {
    label: 'Film grain',
    category: 'Retro',
    params: [num('amount', 'Amount', 0, 0.5, 0.01, 0.08)],
  },
  oldFilm: {
    label: 'Old film',
    category: 'Retro',
    params: [
      num('sepia', 'Sepia', 0, 1, 0.01, 0.3),
      num('noise', 'Noise', 0, 1, 0.01, 0.3),
      num('noiseSize', 'Noise size', 1, 10, 0.5, 1),
      num('scratch', 'Scratch', -1, 1, 0.05, 0.5),
      num('scratchDensity', 'Scratch density', 0, 1, 0.01, 0.3),
      num('scratchWidth', 'Scratch width', 1, 20, 0.5, 1),
      num('vignetting', 'Vignette', 0, 1, 0.01, 0.3),
    ],
  },
  rgbSplit: {
    label: 'RGB split',
    category: 'Retro',
    params: [
      num('redX', 'Red X', -20, 20, 0.5, -10),
      num('redY', 'Red Y', -20, 20, 0.5, 0),
      num('greenX', 'Green X', -20, 20, 0.5, 0),
      num('greenY', 'Green Y', -20, 20, 0.5, 10),
      num('blueX', 'Blue X', -20, 20, 0.5, 0),
      num('blueY', 'Blue Y', -20, 20, 0.5, 0),
    ],
  },

  // --- Light ---
  bloom: {
    label: 'Bloom',
    category: 'Light',
    params: [
      num('strength', 'Strength', 0, 3, 0.05, 0.8),
      num('threshold', 'Threshold', 0, 1, 0.02, 0.6),
      num('radius', 'Radius', 0, 12, 0.5, 3),
    ],
  },
  glow: {
    label: 'Glow',
    category: 'Light',
    params: [
      num('distance', 'Distance px', 1, 30, 1, 10),
      num('outerStrength', 'Outer strength', 0, 10, 0.25, 4),
      num('innerStrength', 'Inner strength', 0, 10, 0.25, 0),
      color('color', 'Color', '#ffffff'),
      num('alpha', 'Alpha', 0, 1, 0.02, 1),
      bool('knockout', 'Knockout', false),
    ],
  },
  godray: {
    label: 'God rays',
    category: 'Light',
    params: [
      num('angle', 'Angle °', 0, 360, 1, 30),
      bool('parallel', 'Parallel', true),
      num('centerX', 'Source X', 0, 1, 0.01, 0.5),
      num('centerY', 'Source Y', 0, 1, 0.01, 0),
      num('gain', 'Gain', 0, 1, 0.02, 0.5),
      num('lacunarity', 'Lacunarity', 0, 5, 0.1, 2.5),
      num('alpha', 'Alpha', 0, 1, 0.02, 1),
      num('time', 'Time', 0, 10, 0.1, 0),
    ],
  },
  vignette: {
    label: 'Vignette',
    category: 'Light',
    params: [
      num('amount', 'Amount', 0, 1, 0.02, 0.5),
      num('radius', 'Radius', 0, 1.4, 0.02, 0.75),
      num('softness', 'Softness', 0.01, 1, 0.02, 0.45),
    ],
  },
};

/** Builds a fully-populated options object from an effect's meta defaults. */
export function defaultEffectOptions(
  type: BuiltinEffectName
): Record<string, number | string | boolean> {
  const options: Record<string, number | string | boolean> = {};
  for (const param of effectMeta[type].params) {
    options[param.key] = param.default;
  }
  return options;
}

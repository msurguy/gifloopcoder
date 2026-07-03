/**
 * A GLC animated property. Every shape prop accepts four forms:
 * - a constant value
 * - a `[start, end]` tuple, linearly interpolated over t
 * - an array of keyframe values, indexed by t
 * - a `function(t)` returning the value for a given t (0..1)
 */
export type PropValue<T> = T | [T, T] | T[] | ((t: number) => T);

export type ShapeProps = Record<string, unknown>;

export type InterpolationMode = 'bounce' | 'single';

export interface Interpolation {
  mode: InterpolationMode;
  easing: boolean;
}

export interface GradientStop {
  position: number;
  color: string;
}

export interface LinearGradientDef {
  type: 'linearGradient';
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  colorStops: GradientStop[];
  addColorStop(position: number, color: string): void;
}

export interface RadialGradientDef {
  type: 'radialGradient';
  x0: number;
  y0: number;
  r0: number;
  x1: number;
  y1: number;
  r1: number;
  colorStops: GradientStop[];
  addColorStop(position: number, color: string): void;
}

export type GradientDef = LinearGradientDef | RadialGradientDef;

export interface Styles {
  backgroundColor: string;
  lineWidth: number;
  strokeStyle: string;
  fillStyle: string;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  lineDash: number[];
  miterLimit: number;
  shadowColor: string | null;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  globalAlpha: number;
  translationX: number;
  translationY: number;
  shake: number;
  blendMode: GlobalCompositeOperation;
}

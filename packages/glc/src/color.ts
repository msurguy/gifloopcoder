// The glc.color helper module: rgb/hsv constructors, random colors, animated
// HSV functions, and gradient definition objects. Ported from libs/color.js.

import type { GradientStop, LinearGradientDef, RadialGradientDef } from './types.js';

export function rgba(r: number, g: number, b: number, a: number): string {
  return 'rgba(' + Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b) + ',' + a + ')';
}

export function rgb(r: number, g: number, b: number): string {
  return rgba(r, g, b, 1);
}

export function randomRGB(min?: number, max?: number): string {
  min = min || 0;
  max = max || 256;
  return rgb(
    Math.floor(min + Math.random() * (max - min)),
    Math.floor(min + Math.random() * (max - min)),
    Math.floor(min + Math.random() * (max - min))
  );
}

export function randomGray(min?: number, max?: number): string {
  min = min || 0;
  max = max || 256;
  return gray(Math.floor(min + Math.random() * (max - min)));
}

export function gray(shade: number): string {
  return rgb(shade, shade, shade);
}

export function num(value: number): string {
  const red = value >> 16;
  const green = (value >> 8) & 0xff;
  const blue = value & 0xff;
  return rgb(red, green, blue);
}

export function randomHSV(
  minH: number,
  maxH: number,
  minS: number,
  maxS: number,
  minV: number,
  maxV: number
): string {
  const h = minH + Math.random() * (maxH - minH);
  const s = minS + Math.random() * (maxS - minS);
  const v = minV + Math.random() * (maxV - minV);
  return hsv(h, s, v);
}

export function hsva(h: number, s: number, v: number, a: number): string {
  let r = 0;
  let g = 0;
  let b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return rgba(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255), a);
}

export function hsv(h: number, s: number, v: number): string {
  return hsva(h, s, v, 1);
}

export function animHSVA(
  startH: number,
  endH: number,
  startS: number,
  endS: number,
  startV: number,
  endV: number,
  startA: number,
  endA: number
): (t: number) => string {
  return function (t: number) {
    const h = startH + t * (endH - startH);
    const s = startS + t * (endS - startS);
    const v = startV + t * (endV - startV);
    const a = startA + t * (endA - startA);
    return hsva(h, s, v, a);
  };
}

export function animHSV(
  startH: number,
  endH: number,
  startS: number,
  endS: number,
  startV: number,
  endV: number
): (t: number) => string {
  return animHSVA(startH, endH, startS, endS, startV, endV, 1, 1);
}

export function createLinearGradient(x0: number, y0: number, x1: number, y1: number): LinearGradientDef {
  return {
    type: 'linearGradient',
    x0,
    y0,
    x1,
    y1,
    colorStops: [] as GradientStop[],
    addColorStop(position: number, color: string) {
      this.colorStops.push({ position, color });
    },
  };
}

export function createRadialGradient(
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): RadialGradientDef {
  return {
    type: 'radialGradient',
    x0,
    y0,
    r0,
    x1,
    y1,
    r1,
    colorStops: [] as GradientStop[],
    addColorStop(position: number, color: string) {
      this.colorStops.push({ position, color });
    },
  };
}

export const color = {
  rgb,
  rgba,
  randomRGB,
  randomGray,
  gray,
  num,
  hsv,
  hsva,
  animHSV,
  animHSVA,
  randomHSV,
  createLinearGradient,
  createRadialGradient,
};

export type ColorLib = typeof color;

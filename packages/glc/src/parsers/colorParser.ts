// Resolves animated color props: constant CSS colors, #argb hex with alpha,
// [start,end] color interpolation, keyframe arrays, fn(t), and gradient objects.
// Ported from the original colorParser; the scratch canvas context used to build
// CanvasGradient objects is created lazily so importing this module never touches
// the DOM (Node/SSR safety).

import type { GradientDef, GradientStop, LinearGradientDef, RadialGradientDef } from '../types.js';

interface ColorObj {
  a: number;
  r: number;
  g: number;
  b: number;
}

let scratchContext: CanvasRenderingContext2D | null = null;

function getScratchContext(): CanvasRenderingContext2D {
  if (!scratchContext) {
    scratchContext = document.createElement('canvas').getContext('2d')!;
  }
  return scratchContext;
}

export function getColor(prop: unknown, t: number, def: unknown): string | CanvasGradient {
  if (prop === undefined || prop === null) {
    return def as string;
  }
  if (typeof prop === 'string') {
    if (prop.charAt(0) === '#' && prop.length > 7) {
      const obj = getColorObj(prop);
      return getColorString(obj as ColorObj);
    }
    return prop;
  } else if (typeof prop === 'function') {
    return (prop as (t: number) => string)(t);
  } else if (Array.isArray(prop) && prop.length === 2) {
    if (isLinearGradient(prop)) {
      return parseLinearGradient(prop as [LinearGradientDef, LinearGradientDef], t);
    }
    if (isRadialGradient(prop)) {
      return parseRadialGradient(prop as [RadialGradientDef, RadialGradientDef], t);
    }
    const c0 = getColorObj(prop[0] as string) as ColorObj;
    const c1 = getColorObj(prop[1] as string) as ColorObj;
    return interpolateColor([c0, c1], t);
  } else if (Array.isArray(prop) && prop.length) {
    return prop[Math.round(t * (prop.length - 1))] as string;
  }
  const gradient = prop as GradientDef;
  if (gradient.type === 'linearGradient') {
    const g = getScratchContext().createLinearGradient(gradient.x0, gradient.y0, gradient.x1, gradient.y1);
    for (const stop of gradient.colorStops) {
      g.addColorStop(stop.position, stop.color);
    }
    return g;
  }
  if (gradient.type === 'radialGradient') {
    const g = getScratchContext().createRadialGradient(
      gradient.x0,
      gradient.y0,
      gradient.r0,
      gradient.x1,
      gradient.y1,
      gradient.r1
    );
    for (const stop of gradient.colorStops) {
      g.addColorStop(stop.position, stop.color);
    }
    return g;
  }
  return def as string;
}

function isLinearGradient(prop: unknown[]): boolean {
  return (
    (prop[0] as GradientDef)?.type === 'linearGradient' && (prop[1] as GradientDef)?.type === 'linearGradient'
  );
}

function parseLinearGradient(prop: [LinearGradientDef, LinearGradientDef], t: number): CanvasGradient {
  const g0 = prop[0];
  const g1 = prop[1];
  const x0 = g0.x0 + (g1.x0 - g0.x0) * t;
  const y0 = g0.y0 + (g1.y0 - g0.y0) * t;
  const x1 = g0.x1 + (g1.x1 - g0.x1) * t;
  const y1 = g0.y1 + (g1.y1 - g0.y1) * t;

  const g = getScratchContext().createLinearGradient(x0, y0, x1, y1);
  interpolateStops(g, g0.colorStops, g1.colorStops, t);
  return g;
}

function isRadialGradient(prop: unknown[]): boolean {
  return (
    (prop[0] as GradientDef)?.type === 'radialGradient' && (prop[1] as GradientDef)?.type === 'radialGradient'
  );
}

function parseRadialGradient(prop: [RadialGradientDef, RadialGradientDef], t: number): CanvasGradient {
  const g0 = prop[0];
  const g1 = prop[1];
  const x0 = g0.x0 + (g1.x0 - g0.x0) * t;
  const y0 = g0.y0 + (g1.y0 - g0.y0) * t;
  const r0 = g0.r0 + (g1.r0 - g0.r0) * t;
  const x1 = g0.x1 + (g1.x1 - g0.x1) * t;
  const y1 = g0.y1 + (g1.y1 - g0.y1) * t;
  const r1 = g0.r1 + (g1.r1 - g0.r1) * t;

  const g = getScratchContext().createRadialGradient(x0, y0, r0, x1, y1, r1);
  interpolateStops(g, g0.colorStops, g1.colorStops, t);
  return g;
}

function interpolateStops(
  g: CanvasGradient,
  stops0: GradientStop[],
  stops1: GradientStop[],
  t: number
): void {
  for (let i = 0; i < stops0.length; i++) {
    const stopA = stops0[i];
    const stopB = stops1[i];
    const position = stopA.position + (stopB.position - stopA.position) * t;
    const colorA = getColorObj(stopA.color) as ColorObj;
    const colorB = getColorObj(stopB.color) as ColorObj;
    const color = interpolateColor([colorA, colorB], t);
    g.addColorStop(position, color);
  }
}

function getColorString(obj: ColorObj): string {
  return 'rgba(' + obj.r + ',' + obj.g + ',' + obj.b + ',' + obj.a / 255 + ')';
}

export function getColorObj(color: string): ColorObj | 0 {
  if (color.charAt(0) === '#') {
    if (color.length === 7) {
      // #rrggbb
      return {
        a: 255,
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16),
      };
    } else if (color.length === 9) {
      // #aarrggbb
      return {
        a: parseInt(color.substring(1, 3), 16),
        r: parseInt(color.substring(3, 5), 16),
        g: parseInt(color.substring(5, 7), 16),
        b: parseInt(color.substring(7, 9), 16),
      };
    } else {
      // #rgb
      const r = color.charAt(1);
      const g = color.charAt(2);
      const b = color.charAt(3);
      return {
        a: 255,
        r: parseInt(r + r, 16),
        g: parseInt(g + g, 16),
        b: parseInt(b + b, 16),
      };
    }
  } else if (color.substring(0, 4) === 'rgb(') {
    const s = color.indexOf('(') + 1;
    const e = color.indexOf(')');
    const channels = color.substring(s, e).split(',');
    return {
      a: 255,
      r: parseInt(channels[0], 10),
      g: parseInt(channels[1], 10),
      b: parseInt(channels[2], 10),
    };
  } else if (color.substring(0, 4) === 'rgba') {
    const s = color.indexOf('(') + 1;
    const e = color.indexOf(')');
    const channels = color.substring(s, e).split(',');
    return {
      a: parseFloat(channels[3]) * 255,
      r: parseInt(channels[0], 10),
      g: parseInt(channels[1], 10),
      b: parseInt(channels[2], 10),
    };
  } else {
    const named = namedColors[color.toLowerCase()];
    if (named != null) {
      return getColorObj(named);
    }
  }
  return 0;
}

function interpolateColor(arr: [ColorObj, ColorObj], t: number): string {
  const c0 = arr[0];
  const c1 = arr[1];
  const alpha = c0.a + (c1.a - c0.a) * t;
  const red = Math.round(c0.r + (c1.r - c0.r) * t);
  const green = Math.round(c0.g + (c1.g - c0.g) * t);
  const blue = Math.round(c0.b + (c1.b - c0.b) * t);
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha / 255 + ')';
}

const namedColors: Record<string, string> = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  grey: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370d8',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#d87093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32',
};

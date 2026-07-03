import type { Styles } from './types.js';

export function createDefaultStyles(): Styles {
  return {
    backgroundColor: '#ffffff',
    lineWidth: 5,
    strokeStyle: '#000000',
    fillStyle: '#000000',
    lineCap: 'round',
    lineJoin: 'miter',
    lineDash: [],
    miterLimit: 10,
    shadowColor: null,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    globalAlpha: 1,
    translationX: 0,
    translationY: 0,
    shake: 0,
    blendMode: 'source-over',
  };
}

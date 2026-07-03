import { describe, expect, it } from 'vitest';
import { getColor, getColorObj } from '../src/parsers/colorParser.js';

describe('colorParser.getColor', () => {
  it('passes plain CSS colors through', () => {
    expect(getColor('#ff0000', 0.5, '#000')).toBe('#ff0000');
    expect(getColor('red', 0.5, '#000')).toBe('red');
  });

  it('expands #aarrggbb to rgba()', () => {
    expect(getColor('#80ff0000', 0, '#000')).toBe('rgba(255,0,0,0.5019607843137255)');
  });

  it('interpolates a [start, end] color pair', () => {
    expect(getColor(['#000000', '#ffffff'], 0.5, '#000')).toBe('rgba(128,128,128,1)');
    expect(getColor(['#000000', '#ffffff'], 0, '#000')).toBe('rgba(0,0,0,1)');
  });

  it('interpolates named colors', () => {
    expect(getColor(['black', 'white'], 1, '#000')).toBe('rgba(255,255,255,1)');
  });

  it('indexes keyframe color arrays', () => {
    expect(getColor(['red', 'green', 'blue'], 1, '#000')).toBe('blue');
  });

  it('supports function props', () => {
    expect(getColor((t: number) => `rgba(${Math.round(t * 255)},0,0,1)`, 1, '#000')).toBe(
      'rgba(255,0,0,1)'
    );
  });

  it('falls back to default for undefined/null', () => {
    expect(getColor(undefined, 0.5, '#abc')).toBe('#abc');
    expect(getColor(null, 0.5, '#abc')).toBe('#abc');
  });
});

describe('colorParser.getColorObj', () => {
  it('parses #rgb, #rrggbb, #aarrggbb', () => {
    expect(getColorObj('#f00')).toEqual({ a: 255, r: 255, g: 0, b: 0 });
    expect(getColorObj('#00ff00')).toEqual({ a: 255, r: 0, g: 255, b: 0 });
    expect(getColorObj('#7f0000ff')).toEqual({ a: 127, r: 0, g: 0, b: 255 });
  });

  it('parses rgb()/rgba() strings', () => {
    expect(getColorObj('rgb(1,2,3)')).toEqual({ a: 255, r: 1, g: 2, b: 3 });
    expect(getColorObj('rgba(1,2,3,0.5)')).toEqual({ a: 127.5, r: 1, g: 2, b: 3 });
  });

  it('resolves named colors', () => {
    expect(getColorObj('tomato')).toEqual({ a: 255, r: 255, g: 99, b: 71 });
  });
});

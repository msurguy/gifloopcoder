import { describe, expect, it } from 'vitest';
import * as vp from '../src/parsers/valueParser.js';

describe('valueParser.getNumber — the four prop forms', () => {
  it('returns constants as-is', () => {
    expect(vp.getNumber(42, 0.5, 0)).toBe(42);
    expect(vp.getNumber(0, 0.5, 99)).toBe(0);
  });

  it('lerps [start, end] tuples', () => {
    expect(vp.getNumber([0, 100], 0, 0)).toBe(0);
    expect(vp.getNumber([0, 100], 0.5, 0)).toBe(50);
    expect(vp.getNumber([0, 100], 1, 0)).toBe(100);
    expect(vp.getNumber([100, -100], 0.25, 0)).toBe(50);
  });

  it('indexes keyframe arrays with rounding', () => {
    const frames = [10, 20, 30, 40, 50];
    expect(vp.getNumber(frames, 0, 0)).toBe(10);
    expect(vp.getNumber(frames, 1, 0)).toBe(50);
    // Math.round(0.4 * 4) = 2
    expect(vp.getNumber(frames, 0.4, 0)).toBe(30);
  });

  it('calls function props with t', () => {
    expect(vp.getNumber((t: number) => t * 200, 0.5, 0)).toBe(100);
  });

  it('falls back to default for undefined', () => {
    expect(vp.getNumber(undefined, 0.5, 7)).toBe(7);
  });
});

describe('valueParser.getString', () => {
  it('returns strings and defaults', () => {
    expect(vp.getString('round', 0.5, 'butt')).toBe('round');
    expect(vp.getString(undefined, 0.5, 'butt')).toBe('butt');
  });

  it('indexes string keyframes', () => {
    expect(vp.getString(['a', 'b', 'c'], 1, 'z')).toBe('c');
    expect(vp.getString(['a', 'b', 'c'], 0, 'z')).toBe('a');
  });

  it('supports function props', () => {
    expect(vp.getString((t: number) => (t > 0.5 ? 'big' : 'small'), 0.75, 'z')).toBe('big');
  });
});

describe('valueParser.getBool', () => {
  it('returns booleans, defaults, keyframes, and functions', () => {
    expect(vp.getBool(true, 0, false)).toBe(true);
    expect(vp.getBool(undefined, 0, true)).toBe(true);
    expect(vp.getBool([true, false], 1, false)).toBe(false);
    expect(vp.getBool((t: number) => t > 0.5, 0.9, false)).toBe(true);
  });
});

describe('valueParser.getArray', () => {
  it('rejects strings in favor of the default', () => {
    expect(vp.getArray('hello', 0.5, [1, 2])).toEqual([1, 2]);
  });

  it('lerps a pair of arrays element-wise', () => {
    expect(vp.getArray([[0, 10], [100, 20]], 0.5, [])).toEqual([50, 15]);
  });

  it('passes through a plain array (length > 1)', () => {
    expect(vp.getArray([5, 10, 15], 0.5, [])).toEqual([5, 10, 15]);
  });

  it('supports function props', () => {
    expect(vp.getArray((t: number) => [t, t * 2], 0.5, [])).toEqual([0.5, 1]);
  });
});

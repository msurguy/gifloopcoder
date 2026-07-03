import { describe, expect, it } from 'vitest';
import { Shape, type ShapeType } from '../src/shape.js';
import { createDefaultStyles } from '../src/styles.js';
import type { Interpolation, ShapeProps } from '../src/types.js';

const noopType: ShapeType = { draw() {} };

function makeShape(props: ShapeProps, interpolation: Interpolation): Shape {
  return new Shape(noopType, props, createDefaultStyles(), interpolation);
}

describe('Shape.interpolate', () => {
  it('bounce + easing: cosine ease out-and-back (0 -> 1 -> 0)', () => {
    const s = makeShape({}, { mode: 'bounce', easing: true });
    expect(s.interpolate(0)).toBeCloseTo(0, 10);
    expect(s.interpolate(0.25)).toBeCloseTo(0.5, 10);
    expect(s.interpolate(0.5)).toBeCloseTo(1, 10);
    expect(s.interpolate(0.75)).toBeCloseTo(0.5, 10);
    expect(s.interpolate(1)).toBeCloseTo(0, 10);
  });

  it('bounce without easing: linear triangle wave', () => {
    const s = makeShape({}, { mode: 'bounce', easing: false });
    expect(s.interpolate(0.25)).toBeCloseTo(0.5, 10);
    expect(s.interpolate(0.5)).toBeCloseTo(1, 10);
    expect(s.interpolate(0.75)).toBeCloseTo(0.5, 10);
  });

  it('single without easing: identity', () => {
    const s = makeShape({}, { mode: 'single', easing: false });
    expect(s.interpolate(0.3)).toBeCloseTo(0.3, 10);
  });

  it('single with easing: cosine ease 0 -> 1', () => {
    const s = makeShape({}, { mode: 'single', easing: true });
    expect(s.interpolate(0)).toBeCloseTo(0, 10);
    expect(s.interpolate(0.5)).toBeCloseTo(0.5, 10);
    expect(s.interpolate(1)).toBeCloseTo(1, 10);
  });

  it('applies phase offset', () => {
    const base = makeShape({}, { mode: 'bounce', easing: true });
    const phased = makeShape({ phase: 0.25 }, { mode: 'bounce', easing: true });
    expect(phased.interpolate(0)).toBeCloseTo(base.interpolate(0.25), 10);
  });

  it('applies speedMult', () => {
    const base = makeShape({}, { mode: 'bounce', easing: true });
    const fast = makeShape({ speedMult: 2 }, { mode: 'bounce', easing: true });
    expect(fast.interpolate(0.25)).toBeCloseTo(base.interpolate(0.5), 10);
  });
});

describe('Shape function-prop binding', () => {
  it('binds function props to the props object so `this` reads siblings', () => {
    const props: ShapeProps = {
      base: 100,
      radius: function (this: { base: number }, t: number) {
        return this.base * t;
      },
    };
    const s = makeShape(props, { mode: 'single', easing: false });
    expect(s.getNumber('radius', 0.5, 0)).toBe(50);
  });
});

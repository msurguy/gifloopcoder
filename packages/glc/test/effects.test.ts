import { describe, expect, it, vi } from 'vitest';
import { resolveScalar, resolveColor, resolveBool, hexToRgb, evalUniform, setUniform } from '../src/effects/pass.js';
import { EffectComposer, createEffects, builtinPasses } from '../src/effects/index.js';
import { effectMeta, EFFECT_CATEGORIES, defaultEffectOptions } from '../src/effects/meta.js';
import { colorMatrixPresets } from '../src/effects/passes/colorMatrix.js';
import { fractHash } from '../src/effects/passes/crt.js';

describe('resolveScalar', () => {
  it('handles the four animatable forms plus a default', () => {
    expect(resolveScalar(undefined, 0.5, 7)).toBe(7); // falls back to default
    expect(resolveScalar(3, 0.5, 0)).toBe(3); // constant
    expect(resolveScalar([0, 10], 0.25, 0)).toBe(2.5); // [start,end] lerp
    expect(resolveScalar([0, 10, 20], 1, 0)).toBe(20); // keyframes indexed by t
    expect(resolveScalar((t) => t * 100, 0.5, 0)).toBe(50); // function(t)
  });
});

describe('evalUniform', () => {
  it('passes literals through and calls functions with t', () => {
    expect(evalUniform(5, 0.5)).toBe(5);
    expect(evalUniform([1, 2, 3], 0.5)).toEqual([1, 2, 3]);
    expect(evalUniform((t) => 6 * t, 0.5)).toBe(3);
    expect(evalUniform((t) => [t, t], 0.4)).toEqual([0.4, 0.4]);
  });

  it('is deterministic for a given t (grain-style uniforms never use randomness)', () => {
    const fn = (t: number) => t * 1000;
    expect(evalUniform(fn, 0.333)).toBe(evalUniform(fn, 0.333));
  });
});

describe('setUniform', () => {
  it('dispatches to the right uniformNf by value shape', () => {
    const gl = {
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
    } as unknown as WebGL2RenderingContext;
    const loc = {} as WebGLUniformLocation;

    setUniform(gl, loc, 1);
    setUniform(gl, loc, [1, 2]);
    setUniform(gl, loc, [1, 2, 3]);
    setUniform(gl, loc, [1, 2, 3, 4]);

    expect(gl.uniform1f).toHaveBeenCalledWith(loc, 1);
    expect(gl.uniform2f).toHaveBeenCalledWith(loc, 1, 2);
    expect(gl.uniform3f).toHaveBeenCalledWith(loc, 1, 2, 3);
    expect(gl.uniform4f).toHaveBeenCalledWith(loc, 1, 2, 3, 4);
  });

  it('no-ops on a null location', () => {
    const gl = { uniform1f: vi.fn() } as unknown as WebGL2RenderingContext;
    expect(() => setUniform(gl, null, 1)).not.toThrow();
    expect(gl.uniform1f).not.toHaveBeenCalled();
  });
});

// Without a DOM/WebGL2 (the default test environment) the composer must degrade
// gracefully so headless rendering and SSR keep working.
describe('EffectComposer graceful fallback (no WebGL2)', () => {
  it('reports itself unsupported and inactive, and apply() is a safe no-op', () => {
    const composer = new EffectComposer(64, 64);
    expect(composer.supported).toBe(false);
    expect(composer.getGL()).toBeNull();
    expect(composer.isActive()).toBe(false);
    // apply() should not throw even though there is no GL context.
    expect(() => composer.apply({} as CanvasRenderingContext2D, {} as HTMLCanvasElement, 0.5)).not.toThrow();
  });
});

describe('effect metadata', () => {
  it('meta keys exactly match the pass registry', () => {
    expect(Object.keys(effectMeta).sort()).toEqual(Object.keys(builtinPasses).sort());
  });

  it('every meta entry has a known category and in-range defaults', () => {
    for (const [name, meta] of Object.entries(effectMeta)) {
      expect(EFFECT_CATEGORIES, `${name} category`).toContain(meta.category);
      expect(meta.label.length, `${name} label`).toBeGreaterThan(0);
      for (const param of meta.params) {
        if (param.kind === 'number') {
          expect(param.default, `${name}.${param.key} default in range`).toBeGreaterThanOrEqual(param.min);
          expect(param.default, `${name}.${param.key} default in range`).toBeLessThanOrEqual(param.max);
          expect(param.step, `${name}.${param.key} step`).toBeGreaterThan(0);
        } else if (param.kind === 'enum') {
          expect(param.options, `${name}.${param.key} default in options`).toContain(param.default);
        } else if (param.kind === 'color') {
          expect(param.default, `${name}.${param.key} hex default`).toMatch(/^#[0-9a-f]{6}$/i);
        }
      }
    }
  });

  it('defaultEffectOptions populates every meta param', () => {
    const options = defaultEffectOptions('crt');
    for (const param of effectMeta.crt.params) {
      expect(options[param.key]).toBe(param.default);
    }
  });
});

describe('colorMatrix presets', () => {
  it('all presets are 20-float matrices', () => {
    for (const [name, matrix] of Object.entries(colorMatrixPresets)) {
      expect(matrix.length, `${name} length`).toBe(20);
      expect(matrix.every((v) => Number.isFinite(v)), `${name} finite`).toBe(true);
    }
  });
});

describe('resolveColor', () => {
  it('parses hex strings (#rgb and #rrggbb, # optional)', () => {
    expect(resolveColor('#ff0000', 0, '#000000')).toEqual([1, 0, 0]);
    expect(resolveColor('#0f0', 0, '#000000')).toEqual([0, 1, 0]);
    expect(hexToRgb('00f')).toEqual([0, 0, 1]);
    expect(hexToRgb('zzz')).toBeNull();
  });

  it('passes [r,g,b] arrays and fn(t) through', () => {
    expect(resolveColor([0.1, 0.2, 0.3], 0.5, '#000000')).toEqual([0.1, 0.2, 0.3]);
    expect(resolveColor((t) => [t, t, t], 0.5, '#000000')).toEqual([0.5, 0.5, 0.5]);
  });

  it('falls back to the default on invalid input', () => {
    expect(resolveColor('not-a-color', 0, '#ffffff')).toEqual([1, 1, 1]);
    expect(resolveColor(undefined, 0, '#000000')).toEqual([0, 0, 0]);
  });
});

describe('resolveBool', () => {
  it('maps booleans and fn(t) to shader floats', () => {
    expect(resolveBool(true, 0, false)).toBe(1);
    expect(resolveBool(undefined, 0, true)).toBe(1);
    expect(resolveBool((t) => t > 0.5, 0.75, false)).toBe(1);
    expect(resolveBool((t) => t > 0.5, 0.25, false)).toBe(0);
  });
});

describe('deterministic time helpers', () => {
  it('fractHash is a pure function of t in [0,1)', () => {
    expect(fractHash(0.3)).toBe(fractHash(0.3));
    expect(fractHash(0.3)).not.toBe(fractHash(0.31));
    for (const t of [0, 0.25, 0.5, 0.99]) {
      expect(fractHash(t)).toBeGreaterThanOrEqual(0);
      expect(fractHash(t)).toBeLessThan(1);
    }
  });
});

describe('createEffects fallback', () => {
  it('no-ops effect additions when WebGL2 is unavailable', () => {
    let composerReady = false;
    const effects = createEffects({
      getSize: () => ({ width: 32, height: 32 }),
      onComposerReady: () => {
        composerReady = true;
      },
      requestRender: () => {},
    });

    // add() returns -1 (nothing added) and the chain stays empty.
    expect(effects.add('bloom', { strength: 1 })).toBe(-1);
    expect(effects.addShader({ fragment: 'fragColor = vec4(1.0);' })).toBe(-1);
    expect(effects.count()).toBe(0);
    expect(effects.isActive()).toBe(false);
    expect(effects.isSupported()).toBe(false);
    // The composer is still constructed (so the host can wire resize/render).
    expect(composerReady).toBe(true);
  });
});

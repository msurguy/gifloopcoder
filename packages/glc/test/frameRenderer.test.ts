import { describe, expect, it } from 'vitest';
import { getFrameCount, renderFrames, type ExportSource } from '../src/export/frameRenderer.js';

function makeSource(fps: number, duration: number): { source: ExportSource; ts: number[] } {
  const ts: number[] = [];
  const source: ExportSource = {
    canvas: {} as HTMLCanvasElement,
    render: (t) => ts.push(t),
    fps,
    duration,
    maxColors: 256,
    backgroundColor: '#ffffff',
  };
  return { source, ts };
}

describe('getFrameCount', () => {
  it('is round(duration * fps), minimum 1', () => {
    expect(getFrameCount(2, 30)).toBe(60);
    expect(getFrameCount(3, 45)).toBe(135);
    expect(getFrameCount(0.01, 30)).toBe(1);
  });
});

describe('renderFrames', () => {
  it('renders t = i/total, never reaching 1 (seamless loop)', async () => {
    const { source, ts } = makeSource(10, 1);
    const frames: number[] = [];
    await renderFrames(source, {}, (_c, i, total) => {
      frames.push(i);
      expect(total).toBe(10);
    });
    expect(ts).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    expect(frames).toHaveLength(10);
    expect(Math.max(...ts)).toBeLessThan(1);
  });

  it('is deterministic across runs', async () => {
    const run = async () => {
      const { source, ts } = makeSource(30, 2);
      await renderFrames(source, {}, () => {});
      return ts;
    };
    expect(await run()).toEqual(await run());
  });

  it('honors fps/duration overrides', async () => {
    const { source, ts } = makeSource(30, 2);
    await renderFrames(source, { fps: 5, duration: 1 }, () => {});
    expect(ts).toHaveLength(5);
  });

  it('reports progress and respects abort', async () => {
    const { source } = makeSource(10, 1);
    const controller = new AbortController();
    const progress: number[] = [];
    await expect(
      renderFrames(
        source,
        {
          signal: controller.signal,
          onProgress: (p) => {
            progress.push(p);
            if (p >= 0.5) controller.abort();
          },
        },
        () => {}
      )
    ).rejects.toThrow(/canceled/i);
    expect(progress.length).toBeLessThan(10);
  });
});

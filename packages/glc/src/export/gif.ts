// Animated GIF export via gifenc. Two palette strategies:
// - 'per-frame': quantize each frame separately (best color fidelity, larger
//   files, palette can shimmer on subtle gradients)
// - 'global': quantize once from sampled frames and reuse for every frame
//   (smaller, temporally stable output)

// gifenc ships CJS (main) + ESM (module) with no `exports` map: bundlers see
// named ESM exports, Node ESM sees only a CJS default. This interop handles both.
import * as gifencModule from 'gifenc';
const { GIFEncoder, quantize, applyPalette } =
  ((gifencModule as unknown as { default?: typeof gifencModule }).default ??
    gifencModule) as typeof gifencModule;
import {
  getFrameCount,
  renderFrames,
  throwIfAborted,
  type ExportSource,
  type FrameLoopOptions,
} from './frameRenderer.js';

export interface GifExportOptions extends FrameLoopOptions {
  maxColors?: number;
  paletteMode?: 'per-frame' | 'global' | 'auto';
  /** Enable 1-bit transparency (used automatically when backgroundColor is 'transparent'). */
  transparent?: boolean;
}

// Above this frame count, 'auto' switches to a global palette to keep file
// size and palette flicker in check.
const GLOBAL_PALETTE_FRAME_THRESHOLD = 150;

export async function exportGif(source: ExportSource, options: GifExportOptions = {}): Promise<Blob> {
  const fps = options.fps ?? source.fps;
  const duration = options.duration ?? source.duration;
  const total = getFrameCount(duration, fps);
  const maxColors = Math.min(256, Math.max(2, options.maxColors ?? source.maxColors));
  const transparent = options.transparent ?? source.backgroundColor === 'transparent';
  const format = transparent ? 'rgba4444' : 'rgb565';
  const delay = 1000 / fps;

  let paletteMode = options.paletteMode ?? 'auto';
  if (paletteMode === 'auto') {
    paletteMode = total > GLOBAL_PALETTE_FRAME_THRESHOLD ? 'global' : 'per-frame';
  }

  const gif = GIFEncoder();
  const context = source.canvas.getContext('2d')!;

  let globalPalette: number[][] | null = null;
  if (paletteMode === 'global') {
    globalPalette = buildGlobalPalette(source, total, maxColors, format, options.signal);
  }

  await renderFrames(source, options, (canvas) => {
    const { width, height } = canvas;
    const rgba = context.getImageData(0, 0, width, height).data;
    const palette = globalPalette ?? quantize(rgba, maxColors, { format });
    const index = applyPalette(rgba, palette, format);
    gif.writeFrame(index, width, height, {
      palette,
      delay,
      transparent,
      // -1 lets gifenc pick; 2 (restore to background) is required for
      // transparent GIFs so frames don't stack.
      dispose: transparent ? 2 : -1,
    });
  });

  gif.finish();
  return new Blob([gif.bytesView().slice()], { type: 'image/gif' });
}

/**
 * Builds a single palette from up to 16 sampled frames spread across the loop.
 */
function buildGlobalPalette(
  source: ExportSource,
  total: number,
  maxColors: number,
  format: 'rgb565' | 'rgba4444',
  signal?: AbortSignal
): number[][] {
  const context = source.canvas.getContext('2d')!;
  const sampleCount = Math.min(16, total);
  const { width, height } = source.canvas;
  // Cap the composite sample at ~4M pixels to bound quantization time.
  const maxTotalPixels = 4_000_000;
  const stride = Math.max(1, Math.ceil((sampleCount * width * height) / maxTotalPixels));

  const samples: Uint8ClampedArray[] = [];
  for (let s = 0; s < sampleCount; s++) {
    throwIfAborted(signal);
    const i = Math.floor((s * total) / sampleCount);
    source.render(i / total);
    const data = context.getImageData(0, 0, width, height).data;
    if (stride === 1) {
      samples.push(data);
    } else {
      const reduced = new Uint8ClampedArray(Math.ceil(data.length / 4 / stride) * 4);
      for (let p = 0, q = 0; p < data.length; p += 4 * stride, q += 4) {
        reduced[q] = data[p];
        reduced[q + 1] = data[p + 1];
        reduced[q + 2] = data[p + 2];
        reduced[q + 3] = data[p + 3];
      }
      samples.push(reduced);
    }
  }

  const combined = new Uint8Array(samples.reduce((sum, s) => sum + s.length, 0));
  let offset = 0;
  for (const s of samples) {
    combined.set(s, offset);
    offset += s.length;
  }
  return quantize(combined, maxColors, { format });
}

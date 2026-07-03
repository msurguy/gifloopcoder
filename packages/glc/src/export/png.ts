// PNG export: a single still at a given t, or the full frame sequence bundled
// into a ZIP (store-only — PNGs are already compressed) via client-zip.

import { downloadZip } from 'client-zip';
import { renderFrames, type ExportSource, type FrameLoopOptions } from './frameRenderer.js';

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, 'image/png');
  });
}

/** Renders the loop at time `t` and returns a PNG blob of that frame. */
export async function exportPng(source: ExportSource, t = 0): Promise<Blob> {
  source.render(t);
  return canvasToBlob(source.canvas);
}

/** Exports every frame of the loop as a ZIP of numbered PNG files. */
export async function exportPngSequence(
  source: ExportSource,
  options: FrameLoopOptions = {}
): Promise<Blob> {
  const files: { name: string; input: Blob }[] = [];
  await renderFrames(source, options, async (canvas, i, total) => {
    const digits = String(total - 1).length;
    const name = `frame-${String(i).padStart(Math.max(4, digits), '0')}.png`;
    files.push({ name, input: await canvasToBlob(canvas) });
  });
  return downloadZip(files).blob();
}

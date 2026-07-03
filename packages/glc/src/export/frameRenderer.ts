// Deterministic offline frame loop for exports. Unlike the realtime scheduler,
// this renders exactly round(duration * fps) frames at t = i / total (t never
// reaches 1, so the loop wraps seamlessly), independent of wall-clock timing.

export interface ExportSource {
  canvas: HTMLCanvasElement;
  render(t: number): void;
  fps: number;
  duration: number;
  maxColors: number;
  backgroundColor: string;
}

export interface FrameLoopOptions {
  fps?: number;
  duration?: number;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export function getFrameCount(duration: number, fps: number): number {
  return Math.max(1, Math.round(duration * fps));
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Export canceled', 'AbortError');
  }
}

/**
 * Renders every frame of the loop, invoking `onFrame` after each render.
 * Yields to the event loop periodically so progress UI can update.
 */
export async function renderFrames(
  source: ExportSource,
  options: FrameLoopOptions,
  onFrame: (canvas: HTMLCanvasElement, frameIndex: number, totalFrames: number) => void | Promise<void>
): Promise<void> {
  const fps = options.fps ?? source.fps;
  const duration = options.duration ?? source.duration;
  const total = getFrameCount(duration, fps);

  for (let i = 0; i < total; i++) {
    throwIfAborted(options.signal);
    const t = i / total;
    source.render(t);
    await onFrame(source.canvas, i, total);
    options.onProgress?.((i + 1) / total);
    if (i % 5 === 4) {
      await new Promise<void>((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => resolve());
        } else {
          setTimeout(resolve, 0);
        }
      });
    }
  }
}

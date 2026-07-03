// The GLC instance factory: wires model state, render list, scheduler, and the
// export pipeline into the public sketch-facing API. Backward compatible with
// the classic `onGLC(glc)` sketch contract.

import { color, type ColorLib } from './color.js';
import { createRenderList, type RenderList } from './renderList.js';
import { createScheduler, type Scheduler } from './scheduler.js';
import { createDefaultStyles } from './styles.js';
import type { Interpolation, InterpolationMode, Styles } from './types.js';
import type { ExportSource } from './export/frameRenderer.js';
import { exportGif, type GifExportOptions } from './export/gif.js';
import { exportVideo, type VideoExportOptions, type VideoExportResult } from './export/video.js';
import { exportPng, exportPngSequence } from './export/png.js';
import type { FrameLoopOptions } from './export/frameRenderer.js';

export interface GLCOptions {
  /** Element the canvas is appended to. Omit for headless use (canvas still created). */
  container?: HTMLElement;
  /** Reuse an existing canvas instead of creating one. */
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  /** Called before each rendered frame with the current t. */
  onRender?: (t: number) => void;
  /** Called when a playOnce run finishes or playback is stopped. */
  onComplete?: () => void;
}

export interface GLCModel {
  interpolation: Interpolation;
  maxColors: number;
  w: number;
  h: number;
  styles: Styles;
  scheduler: Scheduler;
  playOnce(): void;
  loop(): void;
  getDuration(): number;
  setDuration(value: number): void;
  getFPS(): number;
  setFPS(value: number): void;
  getIsRunning(): boolean;
}

export interface GLC {
  w: number;
  h: number;
  model: GLCModel;
  renderList: RenderList;
  styles: Styles;
  color: ColorLib;
  canvasEl: HTMLCanvasElement;

  size(width: number, height: number): void;
  playOnce(): void;
  loop(): void;
  stop(): void;
  pause(): void;
  /** Seek the playhead to t (0..1); renders immediately when paused. */
  seek(t: number): void;
  getT(): number;
  isRunning(): boolean;
  /** Render a specific t without touching playback state. */
  renderAt(t: number): void;
  /** Remove all shapes from the render list. */
  reset(): void;
  getDuration(): number;
  setDuration(value: number): void;
  getFPS(): number;
  setFPS(value: number): void;
  setMode(value: InterpolationMode): void;
  getMode(): InterpolationMode;
  setEasing(value: boolean): void;
  getEasing(): boolean;
  setMaxColors(value: number): void;
  getMaxColors(): number;
  /** Subscribe to render ticks; returns an unsubscribe function. */
  onFrame(cb: (t: number) => void): () => void;

  exportGif(options?: GifExportOptions): Promise<Blob>;
  exportVideo(options?: VideoExportOptions): Promise<VideoExportResult>;
  exportPng(t?: number): Promise<Blob>;
  exportPngSequence(options?: FrameLoopOptions): Promise<Blob>;
}

export function createGLC(options: GLCOptions = {}): GLC {
  const styles = createDefaultStyles();
  const interpolation: Interpolation = { mode: 'bounce', easing: true };
  const scheduler = createScheduler();
  const renderList = createRenderList(options.canvas);
  const frameListeners = new Set<(t: number) => void>();

  const width = options.width ?? 400;
  const height = options.height ?? 400;

  const model: GLCModel = {
    interpolation,
    maxColors: 256,
    w: width,
    h: height,
    styles,
    scheduler,
    playOnce: () => scheduler.playOnce(),
    loop: () => scheduler.loop(),
    getDuration: () => scheduler.getDuration(),
    setDuration: (value) => void scheduler.setDuration(value),
    getFPS: () => scheduler.getFPS(),
    setFPS: (value) => void scheduler.setFPS(value),
    getIsRunning: () => scheduler.isRunning(),
  };

  function onRender(t: number): void {
    options.onRender?.(t);
    renderList.render(t);
    for (const cb of frameListeners) {
      cb(t);
    }
  }

  function onComplete(): void {
    options.onComplete?.();
  }

  renderList.init(model.w, model.h, styles, interpolation);
  scheduler.init(onRender, onComplete);

  const canvasEl = renderList.getCanvas();
  if (options.container) {
    options.container.appendChild(canvasEl);
  }

  function makeExportSource(): ExportSource {
    return {
      canvas: canvasEl,
      render: (t: number) => renderList.render(t),
      fps: scheduler.getFPS(),
      duration: scheduler.getDuration(),
      maxColors: model.maxColors,
      backgroundColor: styles.backgroundColor,
    };
  }

  /** Pauses realtime playback around an export, then restores it. */
  async function withPausedPlayback<T>(fn: () => Promise<T>): Promise<T> {
    const wasRunning = scheduler.isRunning();
    const wasLooping = scheduler.isLooping();
    const t = scheduler.getT();
    if (wasRunning) {
      scheduler.pause();
    }
    try {
      return await fn();
    } finally {
      scheduler.seek(t);
      if (wasRunning) {
        if (wasLooping) {
          scheduler.loop();
        } else {
          scheduler.resume();
        }
      }
    }
  }

  const glc: GLC = {
    w: model.w,
    h: model.h,
    model,
    renderList,
    styles,
    color,
    canvasEl,

    size(w: number, h: number) {
      this.w = model.w = w;
      this.h = model.h = h;
      renderList.size(w, h);
    },
    playOnce: () => scheduler.playOnce(),
    loop: () => scheduler.loop(),
    stop: () => scheduler.stop(),
    pause: () => scheduler.pause(),
    seek: (t: number) => scheduler.seek(t),
    getT: () => scheduler.getT(),
    isRunning: () => scheduler.isRunning(),
    renderAt: (t: number) => renderList.render(t),
    reset: () => {
      renderList.clear();
      renderList.render(0);
    },
    getDuration: () => scheduler.getDuration(),
    setDuration: (value: number) => void scheduler.setDuration(value),
    getFPS: () => scheduler.getFPS(),
    setFPS: (value: number) => void scheduler.setFPS(value),
    setMode: (value: InterpolationMode) => {
      interpolation.mode = value;
    },
    getMode: () => interpolation.mode,
    setEasing: (value: boolean) => {
      interpolation.easing = value;
    },
    getEasing: () => interpolation.easing,
    setMaxColors: (value: number) => {
      model.maxColors = value;
    },
    getMaxColors: () => model.maxColors,
    onFrame: (cb: (t: number) => void) => {
      frameListeners.add(cb);
      return () => frameListeners.delete(cb);
    },

    exportGif: (opts?: GifExportOptions) => withPausedPlayback(() => exportGif(makeExportSource(), opts)),
    exportVideo: (opts?: VideoExportOptions) =>
      withPausedPlayback(() => exportVideo(makeExportSource(), opts)),
    exportPng: (t?: number) => withPausedPlayback(() => exportPng(makeExportSource(), t ?? scheduler.getT())),
    exportPngSequence: (opts?: FrameLoopOptions) =>
      withPausedPlayback(() => exportPngSequence(makeExportSource(), opts)),
  };

  return glc;
}

/**
 * Legacy constructor-style shim matching the original standalone API:
 * `var glc = new GLC(wrapperEl, renderCallback, completeCallback)`.
 */
export function GLC(
  this: unknown,
  canvasWrapper: HTMLElement,
  renderCallback?: () => void,
  completeCallback?: () => void
): GLC {
  return createGLC({
    container: canvasWrapper,
    onRender: renderCallback ? () => renderCallback() : undefined,
    onComplete: completeCallback,
  });
}

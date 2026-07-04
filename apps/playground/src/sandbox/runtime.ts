// Runs INSIDE the sandboxed iframe. Owns the GLC instance, executes user
// sketch code, and performs exports locally so the canvas never has to cross
// the origin boundary — only finished bytes do (as transferable ArrayBuffers).

import { createGLC, detectExportSupport, type GLCInstance } from 'gifloopcoder';
import type { HostMessage, SandboxMessage, SketchSettings } from './protocol';
import { extensionForFormat } from './protocol';

let glc: GLCInstance | null = null;
let exportController: AbortController | null = null;

function post(message: SandboxMessage, transfer?: Transferable[]): void {
  window.parent.postMessage(message, '*', transfer ?? []);
}

function patchConsole(): void {
  const levels = ['log', 'info', 'warn', 'error'] as const;
  for (const level of levels) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      original(...args);
      post({ type: 'console', level, text: args.map(stringify).join(' ') });
    };
  }
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function applySettings(instance: GLCInstance, settings: SketchSettings): void {
  instance.setFPS(settings.fps);
  instance.setDuration(settings.duration);
  instance.setMode(settings.mode);
  instance.setEasing(settings.easing);
  instance.setMaxColors(settings.maxColors);
  instance.size(settings.w, settings.h);
}

function currentSettings(instance: GLCInstance): SketchSettings {
  return {
    fps: instance.getFPS(),
    duration: instance.getDuration(),
    mode: instance.getMode(),
    easing: instance.getEasing(),
    w: instance.w,
    h: instance.h,
    maxColors: instance.getMaxColors(),
  };
}

function run(id: number, code: string, settings: SketchSettings, autoplay: 'loop' | 'once' | 'none'): void {
  const stage = document.getElementById('stage')!;
  // Fresh instance per run; drop the old canvas.
  if (glc) {
    glc.stop();
    stage.innerHTML = '';
  }
  glc = createGLC({ container: stage, width: settings.w, height: settings.h });
  applySettings(glc, settings);
  glc.onFrame((t) => post({ type: 'frame', t, running: glc!.isRunning() }));

  try {
    // The classic GLC sketch contract: the code defines onGLC(glc) and any
    // top-level statements run immediately. `new Function` gives user code its
    // own scope inside this disposable sandbox realm.
    const wrapped = new Function(
      'glc',
      `"use strict";\n${code}\n;if (typeof onGLC === 'function') { onGLC(glc); }`
    );
    wrapped(glc);
  } catch (err) {
    post({ type: 'runError', id, message: err instanceof Error ? err.message : String(err) });
    return;
  }

  // The sketch may have changed fps/duration/size/mode via glc.* calls —
  // report effective settings back so the UI reflects them.
  post({ type: 'runOk', id, settings: currentSettings(glc) });

  // Sketches usually call glc.loop() themselves; only force playback when
  // asked and nothing is running yet.
  if (autoplay !== 'none' && !glc.isRunning()) {
    if (autoplay === 'loop') glc.loop();
    else glc.playOnce();
  }
  if (!glc.isRunning()) {
    glc.renderAt(0);
    post({ type: 'frame', t: 0, running: false });
  }
}

async function runExport(
  id: number,
  format: 'gif' | 'webm' | 'mp4' | 'png' | 'png-sequence',
  options: { paletteMode?: 'per-frame' | 'global' | 'auto'; transparent?: boolean; t?: number } = {}
): Promise<void> {
  if (!glc) {
    post({ type: 'exportError', id, message: 'Nothing to export — run a sketch first.' });
    return;
  }
  exportController?.abort();
  exportController = new AbortController();
  const signal = exportController.signal;
  const onProgress = (progress: number) => post({ type: 'exportProgress', id, progress });

  try {
    let blob: Blob;
    let mimeType: string;
    switch (format) {
      case 'gif': {
        blob = await glc.exportGif({
          signal,
          onProgress,
          paletteMode: options.paletteMode,
          transparent: options.transparent,
        });
        mimeType = 'image/gif';
        break;
      }
      case 'webm':
      case 'mp4': {
        const result = await glc.exportVideo({ format, signal, onProgress });
        blob = result.blob;
        mimeType = result.mimeType;
        break;
      }
      case 'png': {
        blob = await glc.exportPng(options.t);
        mimeType = 'image/png';
        break;
      }
      case 'png-sequence': {
        blob = await glc.exportPngSequence({ signal, onProgress });
        mimeType = 'application/zip';
        break;
      }
    }
    const buffer = await blob.arrayBuffer();
    const filename = `glc-loop.${extensionForFormat(format, mimeType)}`;
    post({ type: 'exportDone', id, buffer, mimeType, filename }, [buffer]);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      post({ type: 'exportError', id, message: 'Export canceled' });
    } else {
      post({ type: 'exportError', id, message: err instanceof Error ? err.message : String(err) });
    }
  } finally {
    exportController = null;
  }
}

async function snapshot(id: number, t: number, maxSize = 240): Promise<void> {
  if (!glc) return;
  const wasRunning = glc.isRunning();
  if (wasRunning) glc.pause();
  glc.renderAt(t);
  const source = glc.canvasEl;
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
  const thumb = document.createElement('canvas');
  thumb.width = Math.round(source.width * scale);
  thumb.height = Math.round(source.height * scale);
  thumb.getContext('2d')!.drawImage(source, 0, 0, thumb.width, thumb.height);
  post({ type: 'snapshotDone', id, dataUrl: thumb.toDataURL('image/png') });
  if (wasRunning) glc.loop();
}

function onMessage(event: MessageEvent<HostMessage>): void {
  const msg = event.data;
  if (!msg || typeof msg !== 'object' || !('type' in msg)) return;
  switch (msg.type) {
    case 'run':
      run(msg.id, msg.code, msg.settings, msg.autoplay);
      break;
    case 'play':
      if (glc) {
        glc.stop();
        if (msg.mode === 'loop') glc.loop();
        else glc.playOnce();
      }
      break;
    case 'pause':
      if (glc) {
        glc.pause();
        post({ type: 'frame', t: glc.getT(), running: false });
      }
      break;
    case 'stop':
      if (glc) {
        glc.stop();
        glc.renderAt(0);
        post({ type: 'frame', t: 0, running: false });
      }
      break;
    case 'seek':
      glc?.pause();
      glc?.seek(msg.t);
      post({ type: 'frame', t: msg.t, running: false });
      break;
    case 'setParam':
      if (glc) {
        if (msg.key === 'fps') glc.setFPS(msg.value as number);
        else if (msg.key === 'duration') glc.setDuration(msg.value as number);
        else if (msg.key === 'mode') glc.setMode(msg.value as 'bounce' | 'single');
        else if (msg.key === 'easing') glc.setEasing(msg.value as boolean);
        else if (msg.key === 'maxColors') glc.setMaxColors(msg.value as number);
        if (!glc.isRunning()) glc.renderAt(glc.getT());
      }
      break;
    case 'resize':
      if (glc) {
        glc.size(msg.w, msg.h);
        glc.renderAt(glc.getT());
      }
      break;
    case 'export':
      void runExport(msg.id, msg.format, msg.options);
      break;
    case 'cancelExport':
      exportController?.abort();
      break;
    case 'snapshot':
      void snapshot(msg.id, msg.t, msg.maxSize);
      break;
    case 'detectSupport':
      void detectExportSupport().then((support) =>
        post({
          type: 'supportDetected',
          id: msg.id,
          support: {
            gif: support.gif,
            png: support.png,
            webm: support.webm,
            mp4: support.mp4,
            mkv: support.mkv,
            codecs: support.codecs,
          },
        })
      );
      break;
  }
}

patchConsole();
window.addEventListener('message', onMessage);
window.addEventListener('error', (event) => {
  post({ type: 'console', level: 'error', text: event.message });
});
post({ type: 'ready' });

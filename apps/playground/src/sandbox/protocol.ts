// postMessage protocol between the playground app and the sandboxed iframe.
// The iframe has an opaque origin (sandbox="allow-scripts" without
// allow-same-origin), so all messages use targetOrigin '*' and binary results
// cross the boundary as transferable ArrayBuffers.

export interface SketchSettings {
  fps: number;
  duration: number;
  mode: 'bounce' | 'single';
  easing: boolean;
  w: number;
  h: number;
  maxColors: number;
}

export const DEFAULT_SETTINGS: SketchSettings = {
  fps: 30,
  duration: 2,
  mode: 'bounce',
  easing: true,
  w: 400,
  h: 400,
  maxColors: 256,
};

export type ExportFormat = 'gif' | 'webm' | 'mp4' | 'png' | 'png-sequence';

export interface ExportRequestOptions {
  paletteMode?: 'per-frame' | 'global' | 'auto';
  transparent?: boolean;
  /** For PNG stills: the t to render. */
  t?: number;
}

// parent -> iframe
export type HostMessage =
  | { type: 'run'; id: number; code: string; settings: SketchSettings; autoplay: 'loop' | 'once' | 'none' }
  | { type: 'play'; mode: 'loop' | 'once' }
  | { type: 'pause' }
  | { type: 'stop' }
  | { type: 'seek'; t: number }
  | { type: 'setParam'; key: 'fps' | 'duration' | 'mode' | 'easing' | 'maxColors'; value: number | string | boolean }
  | { type: 'resize'; w: number; h: number }
  | { type: 'export'; id: number; format: ExportFormat; options?: ExportRequestOptions }
  | { type: 'cancelExport' }
  | { type: 'snapshot'; id: number; t: number; maxSize?: number }
  | { type: 'detectSupport'; id: number };

export interface ExportSupportInfo {
  gif: boolean;
  png: boolean;
  webm: boolean;
  mp4: boolean;
  mkv: boolean;
  codecs: Partial<Record<'webm' | 'mp4' | 'mkv', string>>;
}

// iframe -> parent
export type SandboxMessage =
  | { type: 'ready' }
  | { type: 'frame'; t: number; running: boolean }
  | { type: 'runOk'; id: number; settings: SketchSettings }
  | { type: 'runError'; id: number; message: string }
  | { type: 'console'; level: 'log' | 'info' | 'warn' | 'error'; text: string }
  | { type: 'exportProgress'; id: number; progress: number }
  | { type: 'exportDone'; id: number; buffer: ArrayBuffer; mimeType: string; filename: string }
  | { type: 'exportError'; id: number; message: string }
  | { type: 'snapshotDone'; id: number; dataUrl: string }
  | { type: 'supportDetected'; id: number; support: ExportSupportInfo };

export function extensionForFormat(format: ExportFormat, mimeType?: string): string {
  switch (format) {
    case 'gif':
      return 'gif';
    case 'png':
      return 'png';
    case 'png-sequence':
      return 'zip';
    case 'mp4':
      return 'mp4';
    case 'webm':
      return mimeType?.includes('matroska') ? 'mkv' : 'webm';
  }
}

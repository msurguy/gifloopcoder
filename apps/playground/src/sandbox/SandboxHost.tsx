// Parent-side wrapper for the sandboxed iframe. The iframe runs user code in
// an opaque origin (sandbox="allow-scripts", no allow-same-origin) and is
// reloaded before every run so each sketch gets a pristine realm.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ExportFormat,
  ExportRequestOptions,
  ExportSupportInfo,
  HostMessage,
  SandboxMessage,
  SketchSettings,
} from './protocol';

export interface ExportResult {
  buffer: ArrayBuffer;
  mimeType: string;
  filename: string;
}

export interface RunResult {
  ok: boolean;
  settings?: SketchSettings;
  error?: string;
}

export interface SandboxAPI {
  run(code: string, settings: SketchSettings, autoplay: 'loop' | 'once' | 'none'): Promise<RunResult>;
  play(mode: 'loop' | 'once'): void;
  pause(): void;
  stop(): void;
  seek(t: number): void;
  setParam(key: 'fps' | 'duration' | 'mode' | 'easing' | 'maxColors', value: number | string | boolean): void;
  resize(w: number, h: number): void;
  exportMedia(
    format: ExportFormat,
    options?: ExportRequestOptions,
    onProgress?: (p: number) => void
  ): Promise<ExportResult>;
  cancelExport(): void;
  snapshot(t: number, maxSize?: number): Promise<string>;
  detectSupport(): Promise<ExportSupportInfo>;
}

export interface SandboxFrameProps {
  onFrame?: (t: number, running: boolean) => void;
  onConsole?: (level: 'log' | 'info' | 'warn' | 'error', text: string) => void;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  onProgress?: (p: number) => void;
}

export const SandboxFrame = forwardRef<SandboxAPI, SandboxFrameProps>(function SandboxFrame(
  { onFrame, onConsole, style, className, title },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const nextIdRef = useRef(1);
  const pendingRef = useRef(new Map<number, Pending>());
  const pendingRunRef = useRef<{ msg: HostMessage; pending: Pending } | null>(null);
  // Bumping the key remounts the iframe -> fresh realm for the next run.
  const [frameKey, setFrameKey] = useState(0);

  const callbacksRef = useRef({ onFrame, onConsole });
  callbacksRef.current = { onFrame, onConsole };

  const post = useCallback((msg: HostMessage, transfer?: Transferable[]) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*', transfer ?? []);
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent<SandboxMessage>) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const msg = event.data;
      if (!msg || typeof msg !== 'object' || !('type' in msg)) return;

      switch (msg.type) {
        case 'ready': {
          readyRef.current = true;
          const queued = pendingRunRef.current;
          if (queued) {
            pendingRunRef.current = null;
            const id = nextIdRef.current++;
            (queued.msg as { id: number }).id = id;
            pendingRef.current.set(id, queued.pending);
            post(queued.msg);
          }
          break;
        }
        case 'frame':
          callbacksRef.current.onFrame?.(msg.t, msg.running);
          break;
        case 'console':
          callbacksRef.current.onConsole?.(msg.level, msg.text);
          break;
        case 'runOk':
          pendingRef.current.get(msg.id)?.resolve({ ok: true, settings: msg.settings });
          pendingRef.current.delete(msg.id);
          break;
        case 'runError':
          pendingRef.current.get(msg.id)?.resolve({ ok: false, error: msg.message });
          pendingRef.current.delete(msg.id);
          break;
        case 'exportProgress':
          pendingRef.current.get(msg.id)?.onProgress?.(msg.progress);
          break;
        case 'exportDone':
          pendingRef.current
            .get(msg.id)
            ?.resolve({ buffer: msg.buffer, mimeType: msg.mimeType, filename: msg.filename });
          pendingRef.current.delete(msg.id);
          break;
        case 'exportError':
          pendingRef.current.get(msg.id)?.reject(new Error(msg.message));
          pendingRef.current.delete(msg.id);
          break;
        case 'snapshotDone':
          pendingRef.current.get(msg.id)?.resolve(msg.dataUrl);
          pendingRef.current.delete(msg.id);
          break;
        case 'supportDetected':
          pendingRef.current.get(msg.id)?.resolve(msg.support);
          pendingRef.current.delete(msg.id);
          break;
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [post]);

  const request = useCallback(
    <T,>(msg: HostMessage & { id: number }, onProgress?: (p: number) => void): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        pendingRef.current.set(msg.id, { resolve: resolve as (v: unknown) => void, reject, onProgress });
        post(msg);
      });
    },
    [post]
  );

  useImperativeHandle(
    ref,
    (): SandboxAPI => ({
      run(code, settings, autoplay) {
        // Reject anything still in flight from the old realm, then reload.
        for (const pending of pendingRef.current.values()) {
          pending.reject(new Error('Sandbox reloaded'));
        }
        pendingRef.current.clear();
        readyRef.current = false;
        return new Promise<RunResult>((resolve, reject) => {
          pendingRunRef.current = {
            msg: { type: 'run', id: 0, code, settings, autoplay },
            pending: { resolve: resolve as (v: unknown) => void, reject },
          };
          setFrameKey((k) => k + 1);
        });
      },
      play: (mode) => post({ type: 'play', mode }),
      pause: () => post({ type: 'pause' }),
      stop: () => post({ type: 'stop' }),
      seek: (t) => post({ type: 'seek', t }),
      setParam: (key, value) => post({ type: 'setParam', key, value }),
      resize: (w, h) => post({ type: 'resize', w, h }),
      exportMedia(format, options, onProgress) {
        const id = nextIdRef.current++;
        return request<ExportResult>({ type: 'export', id, format, options }, onProgress);
      },
      cancelExport: () => post({ type: 'cancelExport' }),
      snapshot(t, maxSize) {
        const id = nextIdRef.current++;
        return request<string>({ type: 'snapshot', id, t, maxSize });
      },
      detectSupport() {
        const id = nextIdRef.current++;
        return request<ExportSupportInfo>({ type: 'detectSupport', id });
      },
    }),
    [post, request]
  );

  const src = useMemo(() => `${import.meta.env.BASE_URL}sandbox.html`, []);

  return (
    <iframe
      key={frameKey}
      ref={iframeRef}
      src={src}
      sandbox="allow-scripts"
      title={title ?? 'GLC animation preview'}
      className={className}
      style={{ border: 'none', width: '100%', height: '100%', display: 'block', ...style }}
    />
  );
});

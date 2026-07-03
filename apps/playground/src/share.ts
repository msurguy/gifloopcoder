// Share-by-URL: sketch code + settings compressed with lz-string into the
// hash fragment (#/s/<payload>), so shared links carry the whole project.

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { SketchSettings } from './sandbox/protocol';
import { DEFAULT_SETTINGS } from './sandbox/protocol';

export interface SharePayload {
  v: 1;
  code: string;
  settings: SketchSettings;
  title?: string;
}

export function encodeShare(code: string, settings: SketchSettings, title?: string): string {
  const payload: SharePayload = { v: 1, code, settings, title };
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(encoded: string): SharePayload | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<SharePayload>;
    if (typeof parsed.code !== 'string') return null;
    return {
      v: 1,
      code: parsed.code,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
    };
  } catch {
    return null;
  }
}

export function shareUrl(code: string, settings: SketchSettings, title?: string): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/s/${encodeShare(code, settings, title)}`;
}

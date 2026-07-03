// Detects which export formats this browser can actually encode. GIF and PNG
// are pure JS / canvas APIs and always work; WebM/MP4/MKV depend on WebCodecs
// encoder support, which varies by browser and platform.

import type { VideoCodec } from 'mediabunny';
import { resolveVideoCodec, type VideoFormat } from './video.js';

export interface ExportSupport {
  gif: true;
  png: true;
  webm: boolean;
  mp4: boolean;
  mkv: boolean;
  codecs: Partial<Record<VideoFormat, VideoCodec>>;
}

export async function detectExportSupport(width = 400, height = 400): Promise<ExportSupport> {
  const support: ExportSupport = {
    gif: true,
    png: true,
    webm: false,
    mp4: false,
    mkv: false,
    codecs: {},
  };

  if (typeof VideoEncoder === 'undefined') {
    return support;
  }

  const formats: VideoFormat[] = ['webm', 'mp4', 'mkv'];
  await Promise.all(
    formats.map(async (format) => {
      try {
        const codec = await resolveVideoCodec(format, width, height);
        if (codec) {
          support[format] = true;
          support.codecs[format] = codec;
        }
      } catch {
        // treat any probe failure as unsupported
      }
    })
  );

  return support;
}

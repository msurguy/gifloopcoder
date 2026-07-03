// WebM / MP4 / MKV export via mediabunny (WebCodecs-backed). Frames are
// rendered deterministically and fed to a CanvasSource; encoding happens
// hardware-accelerated where available.

import {
  BufferTarget,
  CanvasSource,
  MkvOutputFormat,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
  getFirstEncodableVideoCodec,
  type OutputFormat,
  type Quality,
  type VideoCodec,
} from 'mediabunny';
import { renderFrames, type ExportSource, type FrameLoopOptions } from './frameRenderer.js';

export type VideoFormat = 'webm' | 'mp4' | 'mkv';

export interface VideoExportOptions extends FrameLoopOptions {
  format?: VideoFormat;
  /** Explicit codec; defaults to the first encodable codec preferred for the format. */
  codec?: VideoCodec;
  /** Bitrate in bits per second, or a mediabunny Quality constant. */
  bitrate?: number | Quality;
}

export interface VideoExportResult {
  blob: Blob;
  mimeType: string;
  codec: VideoCodec;
}

const CODEC_PREFERENCE: Record<VideoFormat, VideoCodec[]> = {
  webm: ['vp9', 'vp8'],
  mp4: ['avc', 'hevc', 'av1'],
  mkv: ['vp9', 'avc', 'vp8'],
};

function createFormat(format: VideoFormat): OutputFormat {
  switch (format) {
    case 'mp4':
      return new Mp4OutputFormat();
    case 'mkv':
      return new MkvOutputFormat();
    case 'webm':
    default:
      return new WebMOutputFormat();
  }
}

export async function resolveVideoCodec(
  format: VideoFormat,
  width: number,
  height: number
): Promise<VideoCodec | null> {
  const outputFormat = createFormat(format);
  const supported = outputFormat.getSupportedVideoCodecs();
  const preferred = CODEC_PREFERENCE[format].filter((c) => supported.includes(c));
  const ordered = [...preferred, ...supported.filter((c) => !preferred.includes(c))];
  const codec = await getFirstEncodableVideoCodec(ordered, { width, height });
  return codec;
}

export async function exportVideo(
  source: ExportSource,
  options: VideoExportOptions = {}
): Promise<VideoExportResult> {
  const format = options.format ?? 'webm';
  const fps = options.fps ?? source.fps;
  const { width, height } = source.canvas;

  const codec = options.codec ?? (await resolveVideoCodec(format, width, height));
  if (!codec) {
    throw new Error(
      `No encodable video codec available for ${format.toUpperCase()} in this browser. ` +
        'Try GIF or PNG export instead.'
    );
  }

  const outputFormat = createFormat(format);
  const target = new BufferTarget();
  const output = new Output({ format: outputFormat, target });
  const videoSource = new CanvasSource(source.canvas, {
    codec,
    bitrate: options.bitrate ?? QUALITY_HIGH,
  });
  output.addVideoTrack(videoSource, { frameRate: fps });
  await output.start();

  try {
    await renderFrames(source, options, async (_canvas, i) => {
      await videoSource.add(i / fps, 1 / fps);
    });
  } catch (err) {
    await output.cancel();
    throw err;
  }

  await output.finalize();
  const mimeType = outputFormat.mimeType;
  return {
    blob: new Blob([target.buffer!], { type: mimeType }),
    mimeType,
    codec,
  };
}

# Exporting

Once your animation looks good in the preview, the Export media button in the header opens the export dialog. From there you can render your loop out in several formats: animated GIF, WebM or MP4 video, a single PNG still, or the full frame sequence as a ZIP of PNGs.

One important thing to know up front: exports don't just record the preview as it plays. Every export renders its frames deterministically — exactly `round(duration × fps)` frames, with frame `i` rendered at `t = i / total`. Since `t` never quite reaches 1, the last frame leads straight back into the first, so exported loops are seamless. And because the frames are computed rather than captured, the output is always identical regardless of how fast (or slow) the preview happened to be playing.

## Animated GIF

GIF export is built on the [gifenc](https://github.com/mattdesl/gifenc) encoder. GIFs are limited to a palette of at most 256 colors, so every frame has to be quantized down to a palette. There are two strategies for this, and the export dialog lets you pick:

- **Per-frame palette** — each frame gets its own palette, quantized from that frame alone. This gives the best color fidelity, but produces larger files, and on subtle gradients the palette can "shimmer" slightly from frame to frame.
- **Global palette** — one palette is built from frames sampled across the whole loop, and reused for every frame. The output is smaller and temporally stable, at the cost of a little color accuracy on any one frame.

The default is automatic: shorter animations use a per-frame palette, and longer ones (over 150 frames) switch to a global palette to keep file size and palette flicker in check.

The max colors setting (in the settings panel, or `glc.setMaxColors(num)` in code) caps the palette size, from 2 up to 256. Lowering it can shrink the file dramatically — see [Tips](#/docs/tips) for more on GIF size optimization.

GIFs also support 1-bit transparency. To export a GIF with a transparent background, set the background color to the special value "transparent" in your sketch:

```js
glc.styles.backgroundColor = "transparent";
```

Anywhere the canvas is left unpainted will be transparent in the exported GIF. Remember it's 1-bit — a pixel is either fully opaque or fully transparent, so anti-aliased edges against transparency can look a bit crunchy. That's a GIF thing, not a glc thing.

## WebM and MP4 Video

The playground can also export real video: WebM (VP9, falling back to VP8) and MP4 (H.264). Encoding is done with the browser's built-in WebCodecs API, hardware-accelerated where available, so it's fast. For the same visual quality, a video file is far smaller than a GIF — if you're posting somewhere that accepts video, it's almost always the better choice.

The catch is that WebCodecs encoder support varies by browser and platform. The export dialog probes what your browser can actually encode and disables the formats that aren't available. GIF and PNG export are pure JavaScript and canvas APIs, so they always work everywhere.

## PNG Still and PNG Sequence

Two more options round things out:

- **PNG still** — saves a single frame as a PNG, at the current position of the timeline scrubber. Scrub to the `t` you want, then export.
- **PNG sequence** — renders every frame of the loop and bundles them into a ZIP of numbered PNG files (`frame-0000.png`, `frame-0001.png`, ...). This is the escape hatch: take the frames into ffmpeg, After Effects, or any other tool and assemble whatever you want.

## Programmatic Export

If you're using the library standalone (via `npm install gifloopcoder`), all of the above is available directly on the `glc` instance. Every method renders the same deterministic frame loop the playground uses and resolves to a result you can download or process further.

```js
// Animated GIF - resolves to a Blob
const gifBlob = await glc.exportGif({
    maxColors: 64,              // 2-256, defaults to the instance setting
    paletteMode: "global"       // "per-frame" | "global" | "auto" (default)
});

// Video - resolves to { blob, mimeType, codec }
const { blob, mimeType, codec } = await glc.exportVideo({
    format: "webm"              // "webm" | "mp4"
});

// A single PNG frame at a given t (defaults to the current playhead)
const pngBlob = await glc.exportPng(0.5);

// Every frame as a ZIP of numbered PNGs
const zipBlob = await glc.exportPngSequence();
```

All of the export methods also accept `fps`, `duration`, an `onProgress` callback (called with a 0-1 fraction), and an AbortSignal as `signal`, so you can wire up progress bars and cancel buttons.

To find out ahead of time which video formats the current browser can encode, use `detectExportSupport`:

```js
import { detectExportSupport } from 'gifloopcoder';

const support = await detectExportSupport();
// { gif: true, png: true, webm: true, mp4: false, mkv: true, codecs: { webm: "vp9", ... } }
```

`gif` and `png` are always true. The video flags reflect what WebCodecs can actually encode on this browser, and `codecs` tells you which codec would be used for each format. This is exactly what the playground's export dialog uses to decide which options to enable.

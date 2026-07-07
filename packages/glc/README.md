# gifloopcoder

Code looping animations in the browser and export them as **GIF, WebM, MP4, or PNG**.

GIF Loop Coder (GLC) is Keith Peters' (bit101) animation library, modernized as a
TypeScript ES-module package: 22 shape types, a seamless-loop interpolation engine, a
28-effect WebGL post-processing chain, and a deterministic export pipeline (GIF via
[gifenc](https://github.com/mattdesl/gifenc), WebM/MP4 via
[mediabunny](https://mediabunny.dev)/WebCodecs, PNG stills and ZIP sequences).

**Try it in the browser playground: <https://msurguy.github.io/gifloopcoder/>**

## Install

```bash
npm install gifloopcoder
```

## Quick start

```js
import { createGLC } from 'gifloopcoder';

const glc = createGLC({ container: document.querySelector('#app') });

glc.renderList.addCircle({
  x: glc.w / 2,
  y: glc.h / 2,
  radius: [20, 150],          // animates 20 → 150 → 20, seamlessly
  fillStyle: ['gold', 'tomato'],
});

glc.loop();
```

Any property can be a constant, a `[from, to]` pair, a keyframe array, or a `function(t)`.
GLC interpolates over a normalized time `t` (0 → 1) and loops it seamlessly.

## Deterministic exports

Exports pause playback, render every frame at a fixed time step, and resume — so a GIF
and a WebM of the same sketch are frame-for-frame identical and loop cleanly.

```js
const gif = await glc.exportGif();                       // Blob
const { blob } = await glc.exportVideo({ format: 'webm' });
const png = await glc.exportPng();                       // current frame, Blob
const zip = await glc.exportPngSequence();               // ZIP of the full loop
```

## Post-processing effects

A lazily-created WebGL2 chain adds effects on top of the rendered frame (and into the
export). 28 built-ins — `bloom`, `glitch`, `crt`, `chromaticAberration`, `pixelate`,
`vignette`, `filmGrain`, `dot`, `twist`, and more — plus custom GLSL passes.

```js
glc.effects.add('bloom', { strength: 0.8 });
glc.effects.add('chromaticAberration', { amount: 4 });

// custom fragment shader:
glc.effects.addShader({ fragment: `/* GLSL */`, uniforms: { intensity: 0.5 } });
```

Effects degrade to a no-op when WebGL2 is unavailable — check `glc.effects.isSupported()`.

## Legacy compatibility

The original standalone constructor still works:

```js
var glc = new GLC(document.getElementById('sketch'));
```

## Credits & license

Created by [Keith Peters](https://github.com/bit101); modernized and packaged by
[Maks Surguy](https://github.com/msurguy). MIT licensed.

Source, docs, and the full playground: <https://github.com/msurguy/gifloopcoder>

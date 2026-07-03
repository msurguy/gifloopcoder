# GIF L∞P Coder

Code looping animations in the browser and export them as **GIF, WebM, MP4, or PNG**.

GIF Loop Coder (GLC) is Keith Peters' (bit101) animation library, modernized: the original
AMD-era engine and its standalone repackage are combined here into a TypeScript library, a
React playground, and documentation — deployed as a static site on GitHub Pages.

**Try it: <https://msurguy.github.io/gifloopcoder/>**

## What's in this repo

| Path | What it is |
|---|---|
| [`packages/glc`](packages/glc) | The `gifloopcoder` library — TypeScript ES modules, 22 shape types, and an export pipeline (GIF via [gifenc](https://github.com/mattdesl/gifenc), WebM/MP4 via [mediabunny](https://mediabunny.dev)/WebCodecs, PNG stills and ZIP sequences) |
| [`apps/playground`](apps/playground) | The browser playground — React + [Astryx](https://astryx.atmeta.com/) UI, CodeMirror editor, sandboxed sketch execution, example gallery, local projects, share-by-URL, multi-format export, and the docs |
| [`.claude/skills/glc-sketch`](.claude/skills/glc-sketch/SKILL.md) | A skill file that teaches AI assistants to write GLC sketches |

## Writing a sketch

```js
function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    list.addCircle({
        x: width / 2,
        y: height / 2,
        radius: [20, 150],          // animates 20 -> 150 -> 20, seamlessly
        fillStyle: ["gold", "tomato"]
    });
}
```

Any property can be a constant, a `[from, to]` pair, a keyframe array, or a `function(t)`.
GLC interpolates over a normalized time `t` (0→1) and loops it seamlessly. See the
[docs](https://msurguy.github.io/gifloopcoder/#/docs/intro) for the full tour.

## Using the library directly

```bash
npm install gifloopcoder
```

```js
import { createGLC } from 'gifloopcoder';

const glc = createGLC({ container: document.querySelector('#app') });
glc.renderList.addStar({ rotation: [0, 72], outerRadius: [40, 90] });
glc.loop();

// deterministic, seamless exports:
const gif = await glc.exportGif();                       // Blob
const { blob } = await glc.exportVideo({ format: 'webm' });
```

The legacy constructor `new GLC(wrapperElement)` from the old standalone build still works.

## Development

```bash
npm install
npm run dev        # playground dev server (builds the sandbox bundle first)
npm test           # library unit tests
npm run build      # library + playground production build
npm run e2e        # Playwright end-to-end tests (needs a Chromium install)
```

The site deploys to GitHub Pages automatically on pushes to `master` via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Credits & license

Created by [Keith Peters](https://github.com/bit101), standalone packaging by
[Maks Surguy](https://github.com/msurguy). MIT licensed — see [LICENSE](LICENSE).

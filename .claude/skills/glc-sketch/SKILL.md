---
name: glc-sketch
description: Write GIF Loop Coder (GLC) animation sketches — seamlessly looping canvas animations exported as GIF/WebM/MP4. Use when creating, editing, or debugging GLC sketches, playground share links, or code that uses the gifloopcoder library.
---

# Writing GLC Sketches

GIF Loop Coder animates shapes on a canvas over a normalized time value `t` that runs 0 → 1
per cycle. You declare shapes with animated properties; GLC interpolates and loops them
seamlessly. Sketches run in the playground (`apps/playground`) or against the library
(`packages/glc`, npm package `gifloopcoder`).

## Sketch contract

A sketch defines a global `onGLC` function. This exact shape is required:

```js
function onGLC(glc) {
    glc.loop();                    // start looping playback
    // glc.size(400, 400);         // canvas size (default 400x400)
    // glc.setDuration(2);         // seconds per cycle (default 2)
    // glc.setFPS(30);             // default 30
    // glc.setMode("bounce");      // "bounce" (default) or "single"
    // glc.setEasing(true);        // sine easing (default true)
    // glc.setMaxColors(256);      // GIF palette size
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        color = glc.color;

    list.addCircle({ x: width / 2, y: height / 2, radius: [20, 100] });
}
```

Library usage outside the playground:

```js
import { createGLC } from 'gifloopcoder';
const glc = createGLC({ container: document.getElementById('app'), width: 400, height: 400 });
glc.renderList.addCircle({ radius: [20, 100] });
glc.loop();
// exports: await glc.exportGif(); await glc.exportVideo({ format: 'webm' | 'mp4' });
```

## The four property value forms (the core trick)

Every shape property accepts any of:

| Form | Example | Meaning |
|---|---|---|
| constant | `radius: 50` | static value |
| 2-tuple | `radius: [20, 100]` | lerp from start to end over t |
| keyframe array (3+) | `fillStyle: ["red", "gold", "blue"]` | indexed by `Math.round(t * (len-1))` — discrete steps, no blending |
| function | `radius: function(t) { return 50 + Math.sin(t * Math.PI * 2) * 20; }` | called with eased t each frame |

Colors interpolate in any CSS format and can mix formats: `["#f00", "rgba(0,0,255,0.5)"]`.
Booleans "animate" by switching at the midpoint. Function props are bound to the props
object, so `this.otherProp` reads sibling properties.

## Loop-safety rules (CRITICAL for seamless loops)

- **bounce mode (default):** t goes 0 → 1 → 0 (eased by a cosine wave). Any `[a, b]` tuple
  automatically returns to its start — everything loops seamlessly. Prefer bounce unless you
  know what you're doing.
- **single mode:** t goes 0 → 1 then jumps back to 0. The end state MUST visually equal the
  start state or the loop pops. Safe patterns: full rotations (`rotation: [0, 360]`), hue
  cycles (`color.animHSV(0, 360, ...)`), objects that move exactly one grid-cell/pattern
  period, `function(t)` props built from `Math.sin/cos(t * Math.PI * 2 * k)`.
- Function props: use whole multiples of `Math.PI * 2` in bounce-independent math so the
  value at t=0 equals the value at t→1.

## Global settings and styles

Defaults on `glc.styles` (per-shape props override them):

```
backgroundColor "#ffffff"   lineWidth 5        strokeStyle "#000000"  fillStyle "#000000"
lineCap "round"             lineJoin "miter"   lineDash []            miterLimit 10
shadowColor null            shadowOffsetX/Y 0  shadowBlur 0           globalAlpha 1
translationX/Y 0            shake 0            blendMode "source-over"
```

Set `glc.styles.backgroundColor = "black"` (or `"transparent"` for transparent GIFs) before
adding shapes. Every style is also a per-shape animatable prop, plus these universal props:
`fill` (bool), `stroke` (bool), `phase` (0..1 time offset), `speedMult` (cycles per loop —
use integers in loops so it stays seamless).

## Shape catalog (22 add methods on glc.renderList)

Angles are degrees. Each method takes one props object; all props optional.

| Method | Own props (defaults) | Default draw |
|---|---|---|
| `addCircle` | x 100, y 100, radius 50, startAngle 0, endAngle 360, drawFromCenter false, rotation 0 | fill |
| `addOval` | x, y, rx 50, ry 50, startAngle, endAngle, drawFromCenter, rotation | fill |
| `addRect` | x, y, w 100, h 100, rotation, drawFromCenter true | fill |
| `addPoly` | x, y, radius 50, sides 5, rotation | fill |
| `addStar` | x, y, innerRadius 25, outerRadius 50, points 5, rotation | fill |
| `addHeart` | x, y, w 50, h 50, rotation | fill |
| `addGear` | x, y, radius 50, teeth 10, toothHeight 10, toothAngle 0.3, hub 10, rotation | fill |
| `addArrow` | x, y, w 100, h 100, pointPercent 0.5, shaftPercent 0.5, rotation | fill |
| `addCube` | x, y, z 0, size 100, rotationX/Y/Z 0 | stroke (wireframe 3D) |
| `addText` | x, y, text "hello", fontSize 20, fontFamily "sans-serif", fontWeight, fontStyle, textAlign "center", textBaseline "middle", letterSpacing 0, rotation | fill |
| `addLine` | x0 0, y0 0, x1 100, y1 100 | stroke |
| `addRay` | x, y, angle 0, length 100 | stroke |
| `addGrid` | x 0, y 0, w 100, h 100, gridSize 20 | stroke |
| `addCurve` | x0, y0, x1, y1, x2, y2 (quadratic control) | stroke |
| `addBezierCurve` | x0..y3 (cubic) | stroke |
| `addPath` | path [x0,y0,x1,y1,...], startPercent 0, endPercent 1 | stroke |
| `addSpiral` | x, y, innerRadius 10, outerRadius 90, turns 6, res 1, rotation | stroke |
| `addSegment` | x0, y0, x1, y1, segmentLength 50 — a dash traveling the line as t advances | stroke |
| `addRaySegment` | x, y, angle, length 100, segmentLength 50 | stroke |
| `addArcSegment` | x, y, radius, startAngle, endAngle, arc 20 (segment sweep), rotation | stroke |
| `addCurveSegment` | like addCurve + percent 0.1 (visible fraction) | stroke |
| `addBezierSegment` | like addBezierCurve + percent 0.1 | stroke |

The `*Segment` shapes animate INTRINSICALLY with t (a segment travels along the full path
over one cycle) — they look best in single mode or with phase offsets.

## Color helpers (`glc.color`)

`rgb(r,g,b)`, `rgba(r,g,b,a)`, `hsv(h,s,v)`, `hsva`, `gray(n)`, `num(0xff0000)`,
`randomRGB(min,max)`, `randomGray`, `randomHSV(...)`,
`animHSV(h0,h1,s0,s1,v0,v1)` / `animHSVA(...)` — return a `function(t)` cycling through HSV,
`createLinearGradient(x0,y0,x1,y1)` / `createRadialGradient(x0,y0,r0,x1,y1,r1)` — gradient
objects (call `.addColorStop(pos, color)`); a `[gradientA, gradientB]` tuple interpolates
both geometry and stops.

## Patterns that make good loops

**Grid of phased shapes** — the workhorse pattern:

```js
function onGLC(glc) {
    glc.loop();
    glc.styles.backgroundColor = "black";
    var list = glc.renderList, width = glc.w, height = glc.h;
    var size = 40;
    for (var x = size / 2; x < width; x += size) {
        for (var y = size / 2; y < height; y += size) {
            list.addRect({
                x: x, y: y, w: [size * 0.9, 4], h: [size * 0.9, 4],
                rotation: [0, 90],
                fillStyle: glc.color.animHSV(x + y, x + y + 90, 1, 1, 1, 1),
                phase: (x + y) / (width + height)   // diagonal wave
            });
        }
    }
}
```

**Orbiting with function props:**

```js
function onGLC(glc) {
    glc.loop();
    glc.setMode("single");
    glc.setEasing(false);
    var list = glc.renderList, width = glc.w, height = glc.h;
    for (var i = 0; i < 12; i++) {
        (function(n) {
            list.addCircle({
                radius: 10,
                x: function(t) { return width / 2 + Math.cos((t + n / 12) * Math.PI * 2) * 120; },
                y: function(t) { return height / 2 + Math.sin((t + n / 12) * Math.PI * 2) * 120; },
                fillStyle: glc.color.hsv(n * 30, 1, 1)
            });
        })(i);
    }
}
```

**Seamless single-mode rotation:**

```js
function onGLC(glc) {
    glc.loop();
    glc.setMode("single");
    glc.setEasing(false);
    var list = glc.renderList;
    list.addPoly({ x: 200, y: 200, radius: 100, sides: 5, rotation: [0, 72] }); // 360/5
}
```

Rotate by `360 / sides` (or a multiple) so the end frame equals the start frame.

**Text & emoji patterns:**

```js
// Typewriter reveal — text: fn(t) slicing a string, textAlign: 'left' keeps
// the anchor fixed while the string grows (default 'center' would re-center
// every frame). Use single mode so it doesn't "un-type" on the way back.
list.addText({
    x: 20, y: 100, textAlign: "left",
    text: function(t) { return "hello world".slice(0, Math.round(t * 11)); }
});

// Per-letter stagger — one addText per character, phase offsets each letter's
// timeline. Position letters yourself (no auto-layout across separate calls).
var word = "WAVY", letterWidth = 45, startX = width / 2 - (word.length - 1) * letterWidth / 2;
for (var i = 0; i < word.length; i++) {
    list.addText({
        x: startX + i * letterWidth, y: [height / 2 + 30, height / 2 - 30],
        text: word[i], textAlign: "center", phase: i / word.length
    });
}
```

Emoji are just Unicode text — pass them straight through the `text` prop, no special
handling needed. Color emoji glyphs ignore `fillStyle` and look broken with
`stroke: true`; animate them via position/rotation/fontSize/globalAlpha instead, and
leave `stroke` at its default (`false`).

## Pitfalls

- Sketch never calls `glc.loop()` or `glc.playOnce()` → static frame. Almost always call
  `glc.loop()` first.
- Non-cyclic values in single mode → visible jump at the loop point.
- `var` capture in loops: wrap function props in an IIFE (sketches are classic JS) or use `let`.
- Keyframe arrays of length 2 are treated as lerp tuples, not two discrete frames.
- `phase` shifts where a shape starts in the cycle (0..1); `speedMult` multiplies cycle count —
  non-integer speedMult breaks the loop seam in single mode.
- Heavy shape counts (1000s) or big canvases make GIF export slow; WebM/MP4 export handles
  them better.
- Transparent GIFs: set `glc.styles.backgroundColor = "transparent"` AND enable the
  transparency option on export.
- `drawFromCenter` defaults differ: true for rect, false for circle/oval.
- Don't hand-roll text centering by offsetting `x`/`y` — `addText` has native `textAlign`/
  `textBaseline` props for this.

More context: docs pages in `apps/playground/src/content/docs/` and runnable examples in
`apps/playground/src/examples/sketches/`.

# Post-Processing Effects

GLC applies **shader-based post-processing** to the whole frame after your shapes
draw — like Three.js's EffectComposer or PixiJS filters. Effects run on a WebGL2
layer and are baked into every export (GIF, PNG, video), so what you see is what
you get. Many effects are direct ports of the excellent
[pixi-filters](https://github.com/pixijs/filters) collection (MIT).

Build a chain in code with `glc.effects`, or visually in the **Effects panel**
(add from the dropdown, reorder, tweak sliders — it updates live).

The panels and your code stay in sync: edits in the Effects panel **and** the
animation settings (size, FPS, duration, mode, easing, max colors) are written
into a marked `onGLCPanel(glc)` block at the end of the sketch. It runs right
after `onGLC`, so panel values win over inline calls, and loading or running
code with that block repopulates the panels. Because everything lives in the
code, share links, saved projects, and copy/paste carry your settings and
effects. Edits inside the block are overwritten the next time you touch a
panel — anything you write yourself inside `onGLC` is yours and is never
modified.

## Quick start

```js
function onGLC(glc) {
    glc.loop();
    glc.renderList.addCircle({ x: glc.w/2, y: glc.h/2, radius: [60, 150], fillStyle: "gold" });

    glc.effects.add("bloom", { strength: 0.9 });
    glc.effects.add("crt", { curvature: 2 });        // applied in order
}
```

## Animatable parameters

Every numeric parameter accepts the same four forms as shape props:

```js
glc.effects.add("twist", { angle: [0, 3.5] });                      // tuple: lerps over the loop
glc.effects.add("pixelate", { size: function (t) { return 4 + t * 30; } }); // function of t
glc.effects.add("vignette", { amount: 0.5 });                       // constant
```

Colors are hex strings (`"#ff8800"`) or `[r, g, b]` arrays (0..1), enums are
strings, flags are booleans. A few structural parameters are baked when the
effect is added and can't animate (marked † below): loop sample counts like
`quality`, `distance`, `maxKernelSize`.

**Determinism:** effects never use `Math.random`. Time-driven effects default to
loop-friendly phases (`crt`, `reflection` advance one full cycle per loop;
`shockwave`'s wave expands over one loop; `glitch` re-rolls its bands 8 times per
loop). Exports are reproducible and wrap seamlessly — except `godray`, whose
noise field isn't periodic in time (its default is a static `time: 0`).

## Built-in effects

### Color

| Effect | Parameters (defaults) |
| --- | --- |
| `adjustment` | `gamma` 1, `saturation` 1, `contrast` 1, `brightness` 1, `red`/`green`/`blue` 1, `alpha` 1 |
| `colorMatrix` | `preset` 'sepia' — one of blackAndWhite, sepia, vintage, polaroid, kodachrome, technicolor, browni, lsd, negative, predator; `amount` 1 (0 = original); or a custom `matrix` (20 floats) |
| `hslAdjustment` | `hue` 0 (degrees; `[0, 360]` = seamless hue spin), `saturation` 0 (−1..1), `lightness` 0 (−1..1), `colorize` false, `alpha` 1 |

### Blur

| Effect | Parameters (defaults) |
| --- | --- |
| `blur` | `strength` 4 px, `quality`† 3 (kawase iterations) |
| `motionBlur` | `velocityX` 20, `velocityY` 0 (px), `kernelSize` 5, `offset` 0 |
| `radialBlur` | `angle` 12°, `centerX`/`centerY` 0.5, `kernelSize` 9, `radius` −1 (px, −1 = whole frame) |
| `tiltShift` | `focusStart` 0.35, `focusEnd` 0.65 (sharp band on Y), `blur` 8 px, `gradient` 0.3 |
| `zoomBlur` | `strength` 0.1, `centerX`/`centerY` 0.5, `innerRadius` 0 px, `maxKernelSize`† 32 |

### Distort

| Effect | Parameters (defaults) |
| --- | --- |
| `bulgePinch` | `centerX`/`centerY` 0.5, `radius` 100 px, `strength` 1 (−1 pinch .. 1 bulge) |
| `glitch` | `slices` 8, `offset` 0.05 (fraction of width), `direction` 0°, `rgbOffset` 2 px, `density` 0.6, `seed` (default: steps 8× per loop) |
| `reflection` | `mirror` true, `boundary` 0.5, `amplitudeStart` 0 / `amplitudeEnd` 20 px, `wavelengthStart` 30 / `wavelengthEnd` 100 px, `alphaStart`/`alphaEnd` 1, `time` (default t·2π, seamless) |
| `shockwave` | `centerX`/`centerY` 0.5, `time` (default = loop t), `speed` 500, `amplitude` 30, `wavelength` 160, `brightness` 1.25, `radius` −1 |
| `twist` | `radius` 200 px, `angle` 4, `offsetX`/`offsetY` 0.5 |

### Stylize

| Effect | Parameters (defaults) |
| --- | --- |
| `ascii` | `size` 8 px character cells |
| `crossHatch` | `spacing` 10 px |
| `dot` | `scale` 1, `angle` 5, `grayscale` true — classic halftone |
| `dropShadow` | `offsetX`/`offsetY` 4 px, `color` '#000000', `alpha` 0.5, `blur` 3, `quality`† 2. Great with transparent backgrounds |
| `emboss` | `strength` 5 |
| `outline` | `thickness` 1 px, `color` '#000000', `alpha` 1, `quality`† 0.25, `knockout` false |
| `pixelate` | `size` 10 px blocks |

### Retro

| Effect | Parameters (defaults) |
| --- | --- |
| `chromaticAberration` | `amount` 3 px (radial channel split) |
| `crt` | `curvature` 1, `lineWidth` 1, `lineContrast` 0.25, `verticalLine` false, `noise` 0.2, `noiseSize` 1, `vignetting` 0.3, `vignettingAlpha` 1, `vignettingBlur` 0.3, `time` (default t·2π), `seed` (deterministic hash of t) |
| `filmGrain` | `amount` 0.08 |
| `oldFilm` | `sepia` 0.3, `noise` 0.3, `noiseSize` 1, `scratch` 0.5, `scratchDensity` 0.3, `scratchWidth` 1, `vignetting` 0.3, `seed` (deterministic hash of t) |
| `rgbSplit` | `redX` −10/`redY` 0, `greenX` 0/`greenY` 10, `blueX`/`blueY` 0 (px, independent per channel) |

### Light

| Effect | Parameters (defaults) |
| --- | --- |
| `bloom` | `strength` 0.8, `threshold` 0.6, `radius` 3 |
| `glow` | `distance`† 10 px, `outerStrength` 4, `innerStrength` 0, `color` '#ffffff', `alpha` 1, `quality`† 0.15, `knockout` false |
| `godray` | `angle` 30°, `parallel` true (or `centerX`/`centerY` point source), `gain` 0.5, `lacunarity` 2.5, `alpha` 1, `time` 0 |
| `vignette` | `amount` 0.5, `radius` 0.75, `softness` 0.45 |

## Effect gallery

Every built-in effect applied to the same base scene, at its default
settings (a few no-op-at-default effects use representative values so the
preview shows something). This section is generated — regenerate after
changing effects with `npm run gen:effect-shots` from `apps/playground`.

![The base scene, with no effect applied](docs-images/effects/baseline.png)

*The shared base scene — every image below applies one effect to it.*

### Color

**Adjustment** · `adjustment`

![Adjustment](docs-images/effects/adjustment.png)

**Color matrix** · `colorMatrix`

![Color matrix](docs-images/effects/colorMatrix.png)

**HSL adjust** · `hslAdjustment`

![HSL adjust](docs-images/effects/hslAdjustment.png)

### Blur

**Blur** · `blur`

![Blur](docs-images/effects/blur.png)

**Motion blur** · `motionBlur`

![Motion blur](docs-images/effects/motionBlur.png)

**Radial blur** · `radialBlur`

![Radial blur](docs-images/effects/radialBlur.png)

**Tilt shift** · `tiltShift`

![Tilt shift](docs-images/effects/tiltShift.png)

**Zoom blur** · `zoomBlur`

![Zoom blur](docs-images/effects/zoomBlur.png)

### Distort

**Bulge / pinch** · `bulgePinch`

![Bulge / pinch](docs-images/effects/bulgePinch.png)

**Glitch** · `glitch`

![Glitch](docs-images/effects/glitch.png)

**Reflection** · `reflection`

![Reflection](docs-images/effects/reflection.png)

**Shockwave** · `shockwave`

![Shockwave](docs-images/effects/shockwave.png)

**Twist** · `twist`

![Twist](docs-images/effects/twist.png)

### Stylize

**ASCII** · `ascii`

![ASCII](docs-images/effects/ascii.png)

**Cross hatch** · `crossHatch`

![Cross hatch](docs-images/effects/crossHatch.png)

**Halftone dot** · `dot`

![Halftone dot](docs-images/effects/dot.png)

**Drop shadow** · `dropShadow`

![Drop shadow](docs-images/effects/dropShadow.png)

**Emboss** · `emboss`

![Emboss](docs-images/effects/emboss.png)

**Outline** · `outline`

![Outline](docs-images/effects/outline.png)

**Pixelate** · `pixelate`

![Pixelate](docs-images/effects/pixelate.png)

### Retro

**Chromatic aberration** · `chromaticAberration`

![Chromatic aberration](docs-images/effects/chromaticAberration.png)

**CRT** · `crt`

![CRT](docs-images/effects/crt.png)

**Film grain** · `filmGrain`

![Film grain](docs-images/effects/filmGrain.png)

**Old film** · `oldFilm`

![Old film](docs-images/effects/oldFilm.png)

**RGB split** · `rgbSplit`

![RGB split](docs-images/effects/rgbSplit.png)

### Light

**Bloom** · `bloom`

![Bloom](docs-images/effects/bloom.png)

**Glow** · `glow`

![Glow](docs-images/effects/glow.png)

**God rays** · `godray`

![God rays](docs-images/effects/godray.png)

**Vignette** · `vignette`

![Vignette](docs-images/effects/vignette.png)

## Custom GLSL passes

Drop down to a raw fragment shader with `addShader`. In scope: `uTexture` (the
current frame), `vUv` (0..1), `uResolution`, `uTime` (loop t), plus your
uniforms. Assign to `fragColor`.

```js
glc.effects.addShader({
    fragment:
        "vec4 c = texture(uTexture, vUv);" +
        "float scan = 0.9 + 0.1 * sin(vUv.y * uResolution.y * 1.5);" +
        "fragColor = vec4(c.rgb * scan, c.a);",
    uniforms: { }   // numbers, [x,y(,z,w)] vectors, or function(t)
});
```

## Controlling the chain

```js
glc.effects.count();           // number of effects
glc.effects.remove(0);         // remove by index
glc.effects.clear();           // remove all
glc.effects.setEnabled(false); // bypass without removing
glc.effects.isSupported();     // false when the browser lacks WebGL2
```

## Notes

- Effects apply **in the order added** — `pixelate` then `bloom` glows the
  blocks; `bloom` then `pixelate` pixelates the glow.
- Edge behavior: the frame is the whole world, so outlines/shadows/glows are
  clipped at the canvas border (unlike Pixi, there's no padding area).
- If WebGL2 isn't available, effects are skipped gracefully and the animation
  renders as pure 2D.
- See the gallery's **Post FX** examples: Bloom, Retro TV, Glitch City, Halftone
  Print, Underwater, Warp Zone, and Color Lab.

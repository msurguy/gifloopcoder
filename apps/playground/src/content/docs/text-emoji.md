# Text & Emoji

Text is just another shape — `addText` draws a string using the browser's own
canvas text rendering, the same engine used for every other piece of text on
the web. That means emoji work automatically: an emoji is just a Unicode
character, so you can drop one straight into a `text` property and it renders
exactly like any other glyph. There's no separate emoji API to learn.

This section covers the properties that make text easier to animate well, a
couple of patterns for animating text itself, and a few emoji-specific quirks
worth knowing about.

## Alignment and Spacing

By default, `addText` centers a string horizontally and vertically around its
`x`/`y` position (`textAlign: "center"`, `textBaseline: "middle"`). That's a
sensible default for a label that doesn't change, but it becomes a problem the
moment the string's length changes during the animation — a growing or
shrinking string will re-center itself every frame, which usually isn't what
you want.

Three properties give you control over this:

```js
glc.renderList.addText({
    x: 20,
    y: 50,
    text: "left-aligned",
    textAlign: "left",       // "left", "center", "right", "start", "end"
    textBaseline: "middle",  // "top", "middle", "alphabetic", "bottom", ...
    letterSpacing: 2         // extra pixels between characters
});
```

Set `textAlign: "left"` any time the text's anchor point (`x`, `y`) should
stay fixed while the content grows or shrinks — the typewriter effect below
depends on this.

## Typewriter Effect

A classic reveal effect: type out a string one character at a time, then reset.
The trick is a `text` property that's a function of `t`, slicing a fixed
string down to a length proportional to `t`:

```js
function onGLC(glc) {
    glc.loop();
    glc.setMode("single");
    var list = glc.renderList,
        message = "hello, gifloopcoder!";

    list.addText({
        x: 20,
        y: 100,
        textAlign: "left",
        text: function(t) {
            return message.slice(0, Math.round(t * message.length));
        }
    });
}
```

`single` mode is the natural fit here — in `bounce` mode the string would type
itself out and then "un-type" on the way back, which can look glitchy unless
that's the effect you're going for. See [Tips](#/docs/tips) for more on
single-mode animation and how to avoid a visible jump at the loop seam.

## Per-Letter Stagger

To animate individual letters — a wave, a staggered fade-in, letters popping
in one at a time — split the string yourself and create one `addText` per
character, using `phase` to offset each letter's timeline. This is the same
`phase`-in-a-loop technique described in the [Tips](#/docs/tips) section,
applied to text:

```js
function onGLC(glc) {
    glc.loop();
    var list = glc.renderList,
        word = "WAVY",
        letterWidth = 45,
        startX = glc.w / 2 - (word.length - 1) * letterWidth / 2;

    for (var i = 0; i < word.length; i++) {
        list.addText({
            x: startX + i * letterWidth,
            y: [glc.h / 2 + 30, glc.h / 2 - 30],
            text: word[i],
            fontSize: 60,
            textAlign: "center",
            phase: i / word.length
        });
    }
}
```

Because each letter is its own shape, it can animate any property
independently — position, rotation, color, font size — exactly like any other
shape in a staggered group.

## Emoji Notes

A few things that are useful to know when animating emoji specifically:

- **Color emoji ignore `fillStyle`.** Most emoji are full-color glyphs baked
  into the system emoji font, so setting `fillStyle` has no visible effect on
  them (it only recolors monochrome/text-style glyphs). Animate emoji via
  position, `rotation`, `fontSize`, and `globalAlpha` instead of color.
- **Avoid `stroke: true` on emoji.** `strokeText` traces an outline around the
  glyph's path, which tends to look broken on multi-color emoji. Leave
  `stroke` at its default (`false`) and rely on `fill` (also the default).
- **Emoji rendering can vary slightly across operating systems and browsers**,
  since each platform ships its own emoji font. An animation that looks great
  while you're editing it may render with a subtly different emoji style once
  exported and viewed elsewhere — this is expected and not a bug in your
  sketch.
- Every other technique on this page — orbiting with function props, phase
  stagger, scale/bounce pulses — works on emoji exactly the same way it works
  on regular text, since they're drawn by the same `addText` shape.

## More Examples

The playground's Examples gallery has several sketches built around the
techniques on this page: **Typewriter**, **Letter Wave**, **Kinetic Title**,
**Emoji Orbit**, and **Emoji Bounce**. Open any of them from the Examples
dialog to see the full source.

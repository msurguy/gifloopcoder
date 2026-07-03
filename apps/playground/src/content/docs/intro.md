# Introduction to GIF Loop Coder (GLC)

I highly recommend you read through this first section to get an idea of how the program works and how to code objects and animations.

Then you can use the [Objects](#/docs/objects), [Styles](#/docs/styles), [Property Types](#/docs/properties), [Exporting](#/docs/export) and [Tips](#/docs/tips) sections as a reference as needed.

## Getting Started

GIF Loop Coder (glc) is a JavaScript-based tool for creating looping animated gifs.

You write your sketch directly in the playground's code editor — the left pane of the app. A sketch is simply a function named `onGLC` that receives a `glc` object:

```js
function onGLC(glc) {
    // ...
}
```

That `glc` object is all you need to work with the GLC library. You write code to add animated objects to a render list, hit Run, and the animation appears in the live preview on the right.

When you open the playground, the editor is prefilled with a starter template that looks like this:

```js
function onGLC(glc) {
    glc.loop();
    // glc.size(400, 400);
    // glc.setDuration(5);
    // glc.setFPS(20);
    // glc.setMode("single");
    // glc.setEasing(false);
    // glc.setMaxColors(256);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    // your code goes here:



}
```

You can see that the template calls `glc.loop();` This will cause the animation to auto-play when the sketch runs. And you'll see several other methods there, commented out. Those will be discussed a bit later. One I'll mention immediately is the `size` method. By default, GLC makes a 400x400 pixel animation. You can change that with this method, passing in a new width and height.

Animations are created by adding objects to the `glc.renderList`. Rather than typing that out each time, the template creates a short alias called `list` to make adding objects easier.

You'll also see that `glc.w` and `glc.h`, which represent the width and the height of the current sketch, are aliased to `width` and `height`, again for ease of typing.

You can also use the GLC library standalone, in your own page or app, without the playground at all. Install it with `npm install gifloopcoder` and create an instance yourself:

```js
import { createGLC } from 'gifloopcoder';

const glc = createGLC({ container: document.getElementById('app') });
const list = glc.renderList;
list.addCircle({ radius: [20, 100] });
glc.loop();
```

Everything documented here — objects, styles, property types, exports — works the same way in both places.

So, your sketch should be running, but you need to add at least one object to have anything interesting to see.

## Adding Objects

The `glc.renderList`, which we have aliased to `list`, has a number of "add" methods for adding objects. Let's start by adding a circle.

```js
function onGLC(glc) {
    var list = glc.renderList;

    glc.loop();
    // glc.size(400, 400);
    // glc.setDuration(5);
    // glc.setFPS(20);
    // glc.setMode("single");
    // glc.setEasing(false);
    // glc.setMaxColors(256);

    // your code goes here:

    list.addCircle();

}
```

Now, there are many properties that go into defining a rendered circle: position, radius, stroked or filled or both? Stroke color and width, solid or dashed, fill color, drop shadow parameters. Circles are drawn in HTML5 using the `arc` method, so we also need to know the start and end angle of that arc. But we don't have to specify anything at all here because glc has defaults for everything. You only need define what you want to be different from the default.

When you run this, you should see your circle right away.

![A default circle](docs-images/1.2.png)

Now that we have a circle, let's customize it by setting some of its properties. This is all done declaratively, by passing in an object to the `addCircle` method. Let's set the x and y position so that the circle is centered on the canvas.

```js
list.addCircle({
    x: 200,
    y: 200
});
```

![A centered circle](docs-images/1.3.png)

Now let's change its radius, and give it a stroke. Then a stroke and fill style (color).

```js
list.addCircle({
    x: 200,
    y: 200,
    radius: 100,
    stroke: true,
    strokeStyle: "#ff0000",
    fillStyle: "yellow"
});
```

![A styled circle](docs-images/1.4.png)

Notice that I set one style using a hex string, and the other using a CSS named color. Just about any standard color string will work. There's more on that in the [Property Types](#/docs/properties) section.

Now that we've seen how to add an object, let's look at how to animate it.

## Animating

Animation in glc is done through changing an object from one state to another over time. By state, I mean that the values of one or more of its properties are changed. So, rather than assigning a single value to a property, we animate it by assigning *two* properties to it. And we do that by assigning an array to that property. For example, to animate the radius of this circle, we just pass in an array, like so:

```js
list.addCircle({
    x: 200,
    y: 200,
    radius: [20, 100],
    stroke: true,
    strokeStyle: "#ff0000",
    fillStyle: "yellow"
});
```

Now you should be able to see the circle animating. You can use the stop button to stop it, and the scrubber under the animation to examine the animation frame-by-frame.

![An animating circle](docs-images/1.5.gif)

You can animate almost any property of any object. Even colors in any format - hex strings, rgb or rgba strings or even CSS named colors. You can even mix and match formats. It's all good!

```js
list.addCircle({
    x: 200,
    y: 200,
    radius: [20, 100],
    stroke: true,
    strokeStyle: ["#f00", "#0000ff"],
    fillStyle: ["rgb(255, 255, 0)", "green"]
});
```

![Animating colors](docs-images/1.6.gif)

Here, the stroke will animate from red to blue, while the fill animates from yellow to green. You can even animate booleans!

```js
list.addCircle({
    x: 200,
    y: 200,
    radius: [20, 100],
    stroke: [true, false],
    strokeStyle: ["#f00", "#0000ff"],
    fillStyle: ["rgb(255, 255, 0)", "green"]
});
```

![Animating a boolean](docs-images/1.7.gif)

Of course, there is no way to smoothly ramp up and down from true to false, so the object will get the first value for the first part of the animation and then switch over to the second boolean value. Here that means that the circle will be stroked when its radius is between 20 and 60 and unstroked when it's between 60 and 100.

Check the other sections of this documentation to find out the different types of objects you can add, the different types of properties you can assign to them and how to animate them. Next up, we'll take a closer look at the user interface.

## The Playground Interface

The playground is split into two main areas: the code editor on the left, where you write your sketch, and the live preview on the right, where the animation runs.

Under the preview is the transport bar. It has buttons to loop the animation continuously, play it once through, or stop it, plus a timeline scrubber. The scrubber shows the current `t` value and lets you drag through the animation manually, frame by frame.

Next to the preview is the settings panel, where you can adjust:

- The width and height of the animation.
- The duration — how long one full cycle of the animation lasts, in seconds.
- The fps — the frame rate of the animation, in frames per second.
- The mode — "bounce" or "single". Modes will be explained a bit more below.
- The max colors — how many colors will be used in an exported GIF. GIFs have a maximum of 256 colors. But often you can set the max colors much lower and still have your animation look good. This can make a dramatic difference in file size.
- The easing switch — gives the animation an ease-in and ease-out if on. Otherwise, it performs a straight linear interpolation.

Below the editor is a console drawer that shows anything your sketch logs, along with any errors it throws.

In the header you'll find the main actions: Run compiles and runs the code in the editor; Examples opens a gallery of example sketches; Docs opens this documentation; Projects lets you save and reopen sketches; Import/Export .js moves sketch files in and out of the playground; Share creates a shareable link to your sketch; and Export media renders your animation out as a GIF, video or PNG (see the [Exporting](#/docs/export) section).

You can control several of these settings from the code you write. You've already seen that you can call `glc.loop()` to have your animation start looping as soon as the sketch runs. Alternately, you could `glc.playOnce()`. Here are all the available commands:

- `glc.loop()` - loops the animation continuously when the sketch runs.
- `glc.playOnce()` - plays the animation through one time when the sketch runs.
- `glc.size(w, h)` - sets the animation size.
- `glc.setFPS(num)` - sets the frame rate of the animation.
- `glc.setDuration(num)` - sets the duration of the animation.
- `glc.setMode(mode)` - sets the interpolation mode ("bounce" or "single").
- `glc.setEasing(bool)` - sets easing on or off.
- `glc.setMaxColors(num)` - sets the maximum number of colors in your animation.

These are all very useful when you are going back and forth between the code and the settings a lot, and you want to have your animation play at a particular rate and duration, mode and easing. Just set it once in the code rather than having to tweak the UI each time you re-run.

## Animation Playback and Rendering

At the very core of a glc animation is a single property, `t` that interpolates from 0 to 1. It's at 0 at the start of the animation and 1 at the end. And an ever-increasing fraction in between.

First lets look at what happens when mode is set to "bounce". Say you've assigned an array of two values to a property, such as `x: [100, 300]` to a circle's x position. glc will animate that circle so that it increases from an x of 100, up to 300, and then back down to 100 again. That's one cycle of an animation.

![Bounce mode](docs-images/1.8.gif)

So, when `t` = 0, `x` will get 100. As `t` increases, the x position will start moving from the 100, towards its second value, 300. When `t` reaches 0.5, it's half way through the animation, and `x` will be 300. As `t` increases from 0.5 to 1.0, the x position of the circle will start moving back downwards toward the first value, 100.

If easing is on in the settings panel, then `t` will change on a curve defined by a sine wave, so it starts increasing slowly, then speeds up, and then slows down as it reaches the end. If easing is off, it just linearly moves from 0 to 1.

![Bounce mode without easing](docs-images/1.9.gif)

You can see this very clearly by using the scrubber in the transport bar. The value shown there is the `t` value. When the slider is full left, `t` is 0 and your animation will be at the starting state. As you drag right, `t` increases and your animation moves towards the ending state. It should reach that end state just as the slider hits the midpoint at `t` = 0.5, then start moving back to the starting point as you continue to drag right to `t` = 1.

Now, when the mode is set to "single", we have a very different operation. Here, the animation only goes from its start state at `t` = 0 to its end state at `t` = 1. You can see this very clearly as well by using the scrubber. First with easing:

![Single mode with easing](docs-images/1.10.gif)

And then without easing:

![Single mode without easing](docs-images/1.11.gif)

Most animations look best in bounce mode because they will automatically loop very smoothly. If you simply move an object in single mode, it will move from its start position to the end position and then suddenly jump back to the start position and start over. To make a good looking single mode animation requires some extra work, usually additional objects to make the overall start state of the animation look exactly the same as the end state. But if done correctly, these can look really great.

There is more information on how to do this in the [Tips](#/docs/tips) section.

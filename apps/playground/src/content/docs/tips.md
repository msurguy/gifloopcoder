# Tips and Advanced Use

## Single Mode Animations

When you first make a simple animation and see it playing smoothly back and forth in bounce mode, and then switch over to single mode, you'll likely not be very happy with the results. If you are moving an object from, say, 0 to 100 pixels on the x-axis. You're going to see it smoothly glide over to 100, and then instantly jump back to 0. Over and over. Yuck.

So initially, you might think that single mode is useless. But, once you know how to work around this, it's very powerful and can create a totally different type of animation. The trick is that you want the end state to *look* like the the start state. This often involves using multiple objects. Let's look at an example

First I'll set up a circle. This will be centered vertically, and move from -25 on the x-axis to the center of the canvas horizontally. Because the radius is 25-pixels, that means it's going to start out off screen, and move to center screen, and then disappear.

```js
function onGLC(glc) {
    glc.loop();
    glc.size(400, 200);
    // glc.setDuration(5);
    // glc.setFPS(20);
    // glc.setMode("single");
    // glc.setEasing(false);
    // glc.setMaxColors(256);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    list.addCircle({
        x: [-25, 200],
        y: 200,
        radius: 25
    });

    glc.loop();
}
```

![One circle in single mode](docs-images/5.1.gif)

So, at the end of the animation we have a circle sitting at the center of the screen. But when it starts the next cycle, there's nothing there. To handle that, we put the same type of object in that position at the start of the animation. And we have that move OFF the screen.

```js
function onGLC(glc) {
    glc.loop();
    glc.size(400, 200);
    // glc.setDuration(5);
    // glc.setFPS(20);
    // glc.setMode("single");
    // glc.setEasing(false);
    // glc.setMaxColors(256);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    list.addCircle({
        x: [-25, 200],
        y: 100,
        radius: 25
    });
    list.addCircle({
        x: [200, 425],
        y: 100,
        radius: 25
    });

    glc.loop();
}
```

![Two circles in single mode](docs-images/5.2.gif)

That's much better. You can even chain several objects together like this, and animate other properties as well. Just remember that the end state of one object has to match up with the start state of another, or the start or end needs to be off screen or invisible.

```js
function onGLC(glc) {
    glc.loop();
    glc.size(400, 200);
    // glc.setDuration(5);
    // glc.setFPS(20);
    // glc.setMode("single");
    // glc.setEasing(false);
    // glc.setMaxColors(256);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h;

    list.addCircle({
        x: [-25, 150],
        y: [0, 175],
        radius: 25,
        fillStyle: [0xff0000, 0x00ff00]
    });
    list.addCircle({
        x: [150, 300],
        y: [175, 25],
        radius: 25,
        fillStyle: [0x00ff00, 0x0000ff]
    });
    list.addCircle({
        x: [300, 425],
        y: [25, 200],
        radius: 25,
        fillStyle: [0x0000ff, 0xff0000]
    });

    glc.loop();
}
```

![Chained circles in single mode](docs-images/5.3.gif)

Once you get the idea of this, it opens up the doors to all kinds of different animations.

## GIF Size and Optimization

When you are making an animated gif, you are basically making a bunch of images and assembling them into a single file that can be played back later. The animated gif format takes care of a lot of optimizing to try to get the size as small as possible, but there are some things you might want to consider when making gifs.

First of all, consider the frame rate, length and physical size of your animation. While glc will make animations up to 60 fps, there's probably no reason to do so. This will inflate the file size dramatically, and not really look any better. Play with the fps setting and see how low you can set it while still looking good.

The duration is what it is. If you want a 10 second animation, just realize that it's going to have twice as many frames as a 5 second animation. And it's going to be larger.

The maximum colors setting can have a big effect on the size of your animation. By default, GLC creates GIFs with 256 colors. This is often way more than you need. Try changing this to a lower number and re-exporting your gif. You may find that the lower setting looks just as good as the higher one while giving you a much smaller file size.

And for size, try to make the animation as small as you can. Not meaning that to make everything tiny, but if your animation only covers the center 100 pixels of the canvas, there's no reason to make it 400 pixels tall. Crop it to the size of the moving objects.

Also keep in mind that the playground can export WebM and MP4 video as well as GIF — for the same visual quality, these are far smaller files, so if you don't specifically need a GIF, consider exporting video instead. See the [Exporting](#/docs/export) section for details.

If you've done all you can and you still feel the animation is too heavy, there are a number of animated gif optimization tools. Some are web-based - you upload the gif, it optimizes it and you download the optimized version. Others are executable programs you download. Some of these can dramatically reduce file size with very little noticeable change in quality. Do a search and try some of them out.

## Phase and SpeedMult

There are actually two more advanced properties that I've withheld from you until now: `phase` and `speedMult`.

As described earlier, glc works by increasing an internal `t` variable from 0 to 1 and basing all its object animations from that. You've seen this `t` variable in the timeline scrubber and in the custom functions used for setting properties. Because everything is based on `t`, every object is perfectly in sync. This is good, as it results in perfectly loopable animations. However, it can make some more advanced effects more difficult. Both of these properties affect how `t` can be altered before being applied to your animation.

First, `phase`. Judicious use of the `phase` property can provide you with an easy way of creating much more intricate animations, very simply.

Here, I've set up 5 circles with a simple x-axis animation. They are spaced out on the y-axis via a for loop.

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

    for(var i = 0; i < 5; i++) {
        list.addCircle({
            x: [50, 350],
            y: 50 + i * 75,
            radius: 25,
        });
    }

    glc.loop();
}
```

![Circles in sync](docs-images/5.4.gif)

Now this is fine, but they're all moving exactly in sync, which is rather boring. Say you wanted them to all move back and forth exactly as they are, but you wanted them all to start at different times, so they were out of sync. That would be pretty tough, though you could get it working with a custom function property. However, with the `phase` property, it's a piece of cake.

Setting the `phase` property for an object changes the `t` value that it uses for its animations. If you set `phase` to 0.25 for an object, then, while all other objects were at a `t` of 0, it would get a `t` of 0.25. When all other objects got to `t` = 0.75, it would be at 1, and when the others got to 1, that object's `t` would already be moving backwards and would be back to 0.75. It just shifts the whole timeline.

So, say I gave each one of these circles a different `phase`, and spaced them out using the for loop i variable...

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

    for(var i = 0; i < 5; i++) {
        list.addCircle({
            x: [50, 350],
            y: 50 + i * 75,
            radius: 25,
            phase: i * 0.2
        });
    }

    glc.loop();
}
```

![Circles with phase](docs-images/5.5.gif)

Now, this is WAY more interesting! And, it only took one line of code! And, it doesn't break the looping of the animation at all. This is just the tip of the iceberg as far as what you can do with the `phase` property. Explore it.

Before you ask, no, it's NOT possible to animate the `phase` value. It can only be a single value. Animating the thing that's animating the things... I don't know. I think the universe would implode or something.

Then, there's the `speedMult` property. This essentially multiplies the `t` value by some amount, but just for that one object that it's being applied to. It lets you speed up the animation for a single object. In the following example, four circles are created. They all animate from the left side of the canvas to the right and back.

```js
function onGLC(glc) {
    glc.loop();
    glc.size(200, 200);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        color = glc.color;

    list.addCircle({
        x: [25, 175],
        y: 25,
        radius: 25
    });
    list.addCircle({
        x: [25, 175],
        y: 75,
        radius: 25,
        speedMult: 2
    });
    list.addCircle({
        x: [25, 175],
        y: 125,
        radius: 25,
        speedMult: 3
    });
    list.addCircle({
        x: [25, 175],
        y: 175,
        radius: 25,
        speedMult: 4
    });
}
```

Other than the y position of each of these circles, the main difference is the `speedMult` property. On the first one, it is not assigned at all, which defaults to one. So that circle moves back and forth at a normal speed. The second circle has a `speedMult` of 2, so it will move back and forth twice for every single trip the first circle makes. The next two circles have a `speedMult` of 3 and 4, so those move even faster. Here's what you get:

![Circles with speedMult](docs-images/5.6.gif)

Be careful with this one. Assigning `speedMult` small integer values, such as 2, 3, 4, like we did here, will maintain the smooth looping aspect that comes automatically in GLC. But you can assign any number you want - floating point numbers, super high numbers, negative values. Some of these values will break your animation. But, in the right combinations, may create new, interesting effects. Experiment away.

## GIF or JIF?

The "g" in "gif" is pronounced exactly the same way it is in "git" and "gin".

# Gif Loop Coder library

GLC lirary can be used to create animations like these:

![From GifLoopCoder's Tumblr](http://45.media.tumblr.com/c1f10ae3e2f5d2d5f9866a7373bbba9b/tumblr_nyshbnUNIi1shpedgo1_400.gif)

![From GifLoopCoder's Tumblr](http://49.media.tumblr.com/551b4b27fdc2fabc01c11a4fda1ffbba/tumblr_nyk7efApif1sr8cguo1_400.gif)

![From GifLoopCoder's Tumblr](http://45.media.tumblr.com/4a0b2c4d4f7a6436799e4bd827598c30/tumblr_nyprotgWwe1tjryj4o1_400.gif)

## Installation
This is a standalone version of Keith Peters' [GifLoopCoder](http://www.gifloopcoder.com/) library to be used on your websites. It does not include the GIF export functionality but rather allows you to drop the library on [Codepen](http://codepen.io/msurguy/pen/WrNxdN), JSFiddle, or any other website to quickly prototype your animations that can be then exported from original GLC tool.

You can either download the library with NPM or use a free CDN:

### Using a CDN:

```html
<script src="https://cdn.rawgit.com/msurguy/gifloopcoder/0.0.1/dist/glc.min.js"></script>
```

### Installation with NPM:

`npm install -s gifloopcoder`

or you can download this repo and get the `glc.min.js` file in "/dist" folder

## Usage

When you have the GLC library on the page you can use it as follows: create an element that will contain the animation canvas, for example a `<div id='sketch'></div>` and place it in your HTML page. Then initialize a new GLC object, passing that canvas container that you created earlier. That's it. You can now use GLC as you would use `onGLC` function in Keith Peters' GLC tool:

```html
<div id="sketch"></div>
...
<script src="/path/to/glc.min.js"></script>
<script>
    var canvasWrapper = document.getElementById('sketch');
    var glc = new GLC(canvasWrapper);

    glc.loop();
    glc.size(540,540);
    glc.setFPS(33);
    glc.setDuration(3);
    glc.styles.backgroundColor = "white"


    var list = glc.renderList,
       width = glc.w,
       height = glc.h;

    // your GLC code goes here:

    var n = 6;
    var rad = (width/n)/2;

    for (var j=0; j<n; j++) {
        for (var i=0; i<n; i++) {
            list.addPoly({
                x: rad + i*rad*2,
                y: rad + j*rad*2,
                radius: [rad*.9, rad*.4],
                sides: [6,3],
                rotation: [0,180],
                fillStyle: ["#ffc500", "#c21500"],
                phase: .75+ .25/(-n*n)*(i*n+j)
            });
        }
    }

</script>
```

## License

MIT

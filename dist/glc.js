(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GLC = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {

  function rgba(r, g, b, a) {
    var clr = Object.create(color);
    clr.setRGBA(r, g, b, a);
    return clr.toString();
  }

  function rgb(r, g, b) {
    return rgba(r, g, b, 1);
  }

  function randomRGB(min, max) {
    min = min || 0;
    max = max || 256;
    return rgb(
      Math.floor(min + Math.random() * (max - min)),
      Math.floor(min + Math.random() * (max - min)),
      Math.floor(min + Math.random() * (max - min))
    );
  }

  function randomGray(min, max) {
    min = min || 0;
    max = max || 256;
    return gray(Math.floor(min + Math.random() * (max - min)));
  }

  function gray(shade) {
    return rgb(shade, shade, shade);
  }

  function num(num) {
    var red = num >> 16,
      green = num >> 8 & 0xff,
      blue = num & 0xff;
    return rgb(red, green, blue);
  }

  function randomHSV(minH, maxH, minS, maxS, minV, maxV) {
    var h = minH + Math.random() * (maxH - minH),
      s = minS + Math.random() * (maxS - minS),
      v = minV + Math.random() * (maxV - minV);
    return hsv(h, s, v);
  }

  function hsva(h, s, v, a) {
    var r, g, b,
      i = Math.floor(h / 60),
      f = h / 60 - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return rgba(
      Math.floor(r * 255),
      Math.floor(g * 255),
      Math.floor(b * 255),
      a
    );
  }

  function hsv(h, s, v) {
    return hsva(h, s, v, 1);
  }

  function animHSVA(startH, endH, startS, endS, startV, endV, startA, endA) {
    return function(t) {
      var h = startH + t * (endH - startH),
        s = startS + t * (endS - startS),
        v = startV + t * (endV - startV),
        a = startA + t * (endA - startA);
      return hsva(h, s, v, a);
    }
  }

  function animHSV(startH, endH, startS, endS, startV, endV) {
    return animHSVA(startH, endH, startS, endS, startV, endV, 1, 1);
  }





  /////////////////////
  // gradients
  /////////////////////
  function createLinearGradient(x0, y0, x1, y1) {
    var g = {
      type: "linearGradient",
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1,
      colorStops: [],
      addColorStop: function(position, color) {
        this.colorStops.push({
          position: position,
          color: color
        });
      }
    };
    return g;
  }

  function createRadialGradient(x0, y0, r0, x1, y1, r1) {
    var g = {
      type: "radialGradient",
      x0: x0,
      y0: y0,
      r0: r0,
      x1: x1,
      y1: y1,
      r1: r1,
      colorStops: [],
      addColorStop: function(position, color) {
        this.colorStops.push({
          position: position,
          color: color
        });
      }
    };
    return g;
  }

  var color = {
    r: 255,
    g: 255,
    b: 255,
    a: 1,

    setRGBA: function(r, g, b, a) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
      return this;
    },

    toString: function() {
      return "rgba(" + Math.floor(this.r) + "," + Math.floor(this.g) + "," + Math.floor(this.b) + "," + this.a + ")";
    }
  };

  return {
    rgb: rgb,
    rgba: rgba,
    randomRGB: randomRGB,
    randomGray: randomGray,
    gray: gray,
    num: num,
    hsv: hsv,
    hsva: hsva,
    animHSV: animHSV,
    animHSVA: animHSVA,
    randomHSV: randomHSV,
    createLinearGradient: createLinearGradient,
    createRadialGradient: createRadialGradient
  };
};
},{}],2:[function(require,module,exports){
module.exports = function() {
  var context = document.createElement("canvas").getContext("2d");

  function getColor(prop, t, def) {
    if(prop === undefined) {
      return def;
    }
    if(typeof(prop) === "string") {
      if(prop.charAt(0) === "#" && prop.length > 7) {
        var obj = getColorObj(prop);
        return getColorString(obj);
      }
      return prop;
    }
    else if(typeof(prop) === "function") {
      return prop(t);
    }
    else if(prop && prop.length === 2) {
      if(isLinearGradient(prop)) {
        return parseLinearGradient(prop, t);
      }
      if(isRadialGradient(prop)) {
        return parseRadialGradient(prop, t);
      }
      var c0 = getColorObj(prop[0]),
        c1 = getColorObj(prop[1]);
      return interpolateColor([c0, c1], t);
    }
    else if(prop && prop.length) {
      return  prop[Math.round(t * (prop.length - 1))];
    }
    if(prop.type === "linearGradient") {
      var g = context.createLinearGradient(prop.x0, prop.y0, prop.x1, prop.y1);
      for(var i = 0; i < prop.colorStops.length; i++) {
        var stop = prop.colorStops[i];
        g.addColorStop(stop.position, stop.color);
      }
      return g;
    }
    if(prop.type === "radialGradient") {
      var g = context.createRadialGradient(prop.x0, prop.y0, prop.r0, prop.x1, prop.y1, prop.r1);
      for(var i = 0; i < prop.colorStops.length; i++) {
        var stop = prop.colorStops[i];
        g.addColorStop(stop.position, stop.color);
      }
      return g;
    }
    return def;
  }

  function isLinearGradient(prop) {
    return prop[0].type === "linearGradient" && prop[1].type === "linearGradient";
  }

  function parseLinearGradient(prop, t) {
    var g0 = prop[0],
      g1 = prop[1],
      x0 = g0.x0 + (g1.x0 - g0.x0) * t,
      y0 = g0.y0 + (g1.y0 - g0.y0) * t,
      x1 = g0.x1 + (g1.x1 - g0.x1) * t,
      y1 = g0.y1 + (g1.y1 - g0.y1) * t;

    var g = context.createLinearGradient(x0, y0, x1, y1);
    for(var i = 0; i < g0.colorStops.length; i++) {
      var stopA = g0.colorStops[i],
        stopB = g1.colorStops[i],
        position = stopA.position + (stopB.position - stopA.position) * t,
        colorA = getColorObj(stopA.color),
        colorB = getColorObj(stopB.color),
        color = interpolateColor([colorA, colorB], t);
      g.addColorStop(position, color);
    }
    return g;
  }

  function isRadialGradient(prop) {
    return prop[0].type === "radialGradient" && prop[1].type === "radialGradient";
  }

  function parseRadialGradient(prop, t) {
    var g0 = prop[0],
      g1 = prop[1],
      x0 = g0.x0 + (g1.x0 - g0.x0) * t,
      y0 = g0.y0 + (g1.y0 - g0.y0) * t,
      r0 = g0.r0 + (g1.r0 - g0.r0) * t,
      x1 = g0.x1 + (g1.x1 - g0.x1) * t,
      y1 = g0.y1 + (g1.y1 - g0.y1) * t,
      r1 = g0.r1 + (g1.r1 - g0.r1) * t;

    var g = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    for(var i = 0; i < g0.colorStops.length; i++) {
      var stopA = g0.colorStops[i],
        stopB = g1.colorStops[i],
        position = stopA.position + (stopB.position - stopA.position) * t,
        colorA = getColorObj(stopA.color),
        colorB = getColorObj(stopB.color),
        color = interpolateColor([colorA, colorB], t);
      g.addColorStop(position, color);
    }
    return g;
  }

  function getColorString(obj) {
    return "rgba(" + obj.r + "," + obj.g + "," + obj.b + "," + (obj.a / 255) + ")";
  }

  function getColorObj(color) {
    if(color.charAt(0) === "#") {
      if(color.length === 7) { // #rrggbb
        return {
          a: 255,
          r: parseInt(color.substring(1, 3), 16),
          g: parseInt(color.substring(3, 5), 16),
          b: parseInt(color.substring(5, 7), 16)
        }
      }
      else if(color.length === 9) { // #aarrggbb
        return {
          a: parseInt(color.substring(1, 3), 16),
          r: parseInt(color.substring(3, 5), 16),
          g: parseInt(color.substring(5, 7), 16),
          b: parseInt(color.substring(7, 9), 16)
        }
      }
      else { // #rgb
        var r = color.charAt(1),
          g = color.charAt(2),
          b = color.charAt(3);

        return {
          a: 255,
          r: parseInt(r + r, 16),
          g: parseInt(g + g, 16),
          b: parseInt(b + b, 16)
        }
      }
    }
    else if(color.substring(0, 4) === "rgb(") {
      var s = color.indexOf("(") + 1,
        e = color.indexOf(")"),
        channels = color.substring(s, e).split(",");
      return {
        a: 255,
        r: parseInt(channels[0], 10),
        g: parseInt(channels[1], 10),
        b: parseInt(channels[2], 10)
      }
    }
    else if(color.substring(0, 4) === "rgba") {
      var s = color.indexOf("(") + 1,
        e = color.indexOf(")"),
        channels = color.substring(s, e).split(",");
      return {
        a: parseFloat(channels[3]) * 255,
        r: parseInt(channels[0], 10),
        g: parseInt(channels[1], 10),
        b: parseInt(channels[2], 10)
      }
    }
    else {
      color = color.toLowerCase();
      if(namedColors[color] != null) {
        return getColorObj(namedColors[color]);
      }
    }
    return 0;
  }

  function interpolateColor(arr, t) {
    var c0 = arr[0],
      c1 = arr[1];

    var alpha = c0.a + (c1.a - c0.a) * t,
      red = Math.round(c0.r + (c1.r - c0.r) * t),
      green = Math.round(c0.g + (c1.g - c0.g) * t),
      blue = Math.round(c0.b + (c1.b - c0.b) * t);
    return "rgba(" + red + "," + green + "," + blue + "," + (alpha / 255) + ")";
  }

  var namedColors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    grey: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  };

  return {
    getColor: getColor
  };
};
},{}],3:[function(require,module,exports){
module.exports = function() {
  return {

    getNumber: function(prop, t, def) {
      if(typeof(prop) === "number") {
        return prop;
      }
      else if(typeof(prop) === "function") {
        return prop(t);
      }
      else if(prop && prop.length === 2) {
        var start = prop[0],
          end = prop[1];
        return start + (end - start) * t;
      }
      else if(prop && prop.length) {
        return prop[Math.round(t * (prop.length - 1))];
      }
      return def;
    },


    getString: function(prop, t, def) {
      if(prop === undefined) {
        return def;
      }
      else if(typeof(prop) === "string") {
        return prop;
      }
      else if(typeof(prop) === "function") {
        return prop(t);
      }
      else if(prop && prop.length) {
        return prop[Math.round(t * (prop.length - 1))];
      }
      return prop;
    },

    getBool: function(prop, t, def) {
      if(prop === undefined) {
        return def;
      }
      else if(typeof(prop) === "function") {
        return prop(t);
      }
      else if(prop && prop.length) {
        return prop[Math.round(t * (prop.length - 1))];
      }
      return prop;
    },

    getArray: function(prop, t, def) {
      // string will have length, but is useless
      if(typeof(prop) === "string") {
        return def;
      }
      else if(typeof(prop) === "function") {
        return prop(t);
      }
      else if(prop && (prop.length == 2) && prop[0].length && prop[1].length) {
        // we seem to have an array of arrays
        var arr0 = prop[0],
          arr1 = prop[1],
          len = Math.min(arr0.length, arr1.length),
          result = [];

        for(var i = 0; i < len; i++) {
          var v0 = arr0[i],
            v1 = arr1[i];
          result.push(v0 + (v1 - v0) * t);
        }
        return result;

      }
      else if(prop && prop.length > 1) {
        return prop;
      }
      return def;
    },

    getObject: function(prop, t, def) {
      if(prop === undefined) {
        return def;
      }
      else if(typeof(prop) === "function") {
        return prop(t);
      }
      else if(prop && prop.length) {
        return prop[Math.round(t * (prop.length - 1))];
      }
      return prop;
    }

  }
};
},{}],4:[function(require,module,exports){
var Model = require('./model');
var RenderList = require('./renderList');

var colorLib = require('./libs/color')();
var shapeList = require('./shapeList');

module.exports = function(canvasWrapper, renderCallback, completeCallback){
  var model = new Model();
  var renderList = new RenderList();

  function onRender(t) {
    if (typeof renderCallback === 'function'){
      renderCallback();
    }
    renderList.render(t);
  }

  function onComplete() {
    if (typeof completeCallback === 'function'){
      completeCallback();
    }
  }

  // Initialize render list
  renderList.init(model.w, model.h, model.styles, model.interpolation);

  // Add all shapes from the shape list
  for (var key in shapeList) {
    if (shapeList.hasOwnProperty(key)) {
      var shapeName = key;
      renderList['add' + shapeName[0].toUpperCase() + shapeName.slice(1)] = (function(shapeName, shapeList){
        return function(props){
          renderList.addShape(shapeList[shapeName], props);
        }
      })(shapeName, shapeList);
    }
  }

  // Initialize scheduler
  model.scheduler.init(onRender, onComplete);
  var canvasEl = canvasWrapper.appendChild(renderList.getCanvas());

  return {
    w: model.w,
    h: model.h,
    model : model,
    renderList: renderList,
    size: function(width, height) {
      this.w = model.w = width;
      this.h = model.h = height;
      renderList.size(model.w, model.h);
    },
    styles : model.styles,
    playOnce: function(){
      return model.playOnce();
    },
    loop: function() {
      return model.loop();
    },
    getDuration : function(){
      return model.getDuration();
    },
    setFPS: function(value){
      model.setFPS(value);
    },
    setDuration: function(value) {
      model.setDuration(value);
    },
    setMode: function(value) {
      model.interpolation.mode = value;
    },
    setEasing: function (value) {
      model.interpolation.easing = value;
    },
    setMaxColors: function(value) {
      model.maxColors = value;
    },
    color: colorLib,
    canvasEl : canvasEl
  };
};
},{"./libs/color":1,"./model":5,"./renderList":6,"./shapeList":9}],5:[function(require,module,exports){
/**
 * A simple model for the Canvas renderer
 * @type {{init, loop, playOnce, stop, isRunning, setDuration, getDuration, setFPS, getFPS}|*}
 */
var Scheduler = require('./scheduler');

module.exports = function(){
  var scheduler = new Scheduler();

  var styles = {
    backgroundColor: "#ffffff",
    lineWidth: 5,
    strokeStyle: "#000000",
    fillStyle: "#000000",
    lineCap: "round",
    lineJoin: "miter",
    lineDash: [],
    miterLimit: 10,
    shadowColor: null,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    globalAlpha: 1,
    translationX: 0,
    translationY: 0,
    shake: 0,
    blendMode: "source-over"
  };

  return {
    interpolation: {
      mode: "bounce",
      easing: true
    },
    maxColors: 256,
    w: 400,
    h: 400,
    capture: false,
    styles: styles,
    scheduler : scheduler,
    playOnce : function() {
      return scheduler.playOnce();
    },
    loop : function() {
      return scheduler.loop();
    },
    getDuration: function() {
      return scheduler.getDuration();
    },
    setDuration: function(value) {
      scheduler.setDuration(value);
    },
    getFPS: function() {
      return scheduler.getFPS();
    },
    setFPS: function(value) {
      scheduler.setFPS(value);
    },
    getIsRunning: function() {
      return scheduler.isRunning();
    }
  }
};
},{"./scheduler":7}],6:[function(require,module,exports){
var Shape = require('./shape');

module.exports = function(){
  var shape = new Shape();

  var canvas = null,
    context = null,
    width = 0,
    height = 0,
    list = [],
    styles = null;

  function init(w, h, stylesValue, interpolation) {
    canvas = document.createElement("canvas");
    width = canvas.width = w;
    height = canvas.height = h;
    context = canvas.getContext("2d");
    styles = stylesValue;
    shape.styles = styles;
    shape.interpolation = interpolation;
  }

  function size(w, h) {
    width = canvas.width = w;
    height = canvas.height = h;
  }

  function addShape(newShape, props) {
    var item = shape.create(newShape, props);
    list.push(item);
    render(0);
  }

  function clear() {
    list.length = 0;
  }

  function render(t) {
    if(styles.backgroundColor === "transparent") {
      context.clearRect(0, 0, width, height);
    }
    else {
      context.fillStyle = styles.backgroundColor;
      context.fillRect(0, 0, width, height);
    }
    for(var i = 0; i < list.length; i++) {
      list[i].render(context, t);
    }
  }

  function getCanvas() {
    return canvas;
  }

  function getContext() {
    return context;
  }

  return {
    init: init,
    size: size,
    getCanvas: getCanvas,
    getContext: getContext,
    addShape: addShape,
    clear: clear,
    render: render
  };
};
},{"./shape":8}],7:[function(require,module,exports){
module.exports = function() {
  var t = 0,
    duration = 2,
    fps = 30,
    running = false,
    looping = false,
    renderCallback = null,
    completeCallback = null;

  function init(onRender, onComplete) {
    renderCallback = onRender;
    completeCallback = onComplete;
  }

  function render() {
    if(running) {
      if(renderCallback) {
        renderCallback(t);
      }
      advance();
      setTimeout(onTimeout, 1000 / fps);
    }
    else if(completeCallback) {
      completeCallback();
    }
  }

  function onTimeout() {
    requestAnimationFrame(render);
  }

  function advance() {
    var numFrames = duration * fps,
      speed = 1 / numFrames;
    t += speed;
    if(Math.round(t * 10000) / 10000 >= 1) {
      if(looping) {
        t -= 1;
      }
      else {
        t = 0;
        stop();
      }
    }
  }

  function loop() {
    if(!running) {
      t = 0;
      looping = true;
      running = true;
      render();
    }
  }

  function stop() {
    running = false;
    looping = false;
    t = 0;
  }

  function playOnce() {
    if(!running) {
      t = 0;
      looping = false;
      running = true;
      render();
    }
  }

  function isRunning() {
    return running;
  }

  function setDuration(value) {
    duration = value;
    return duration;
  }

  function getDuration() {
    return duration;
  }

  function setFPS(value) {
    fps = value;
    return fps;
  }

  function getFPS() {
    return fps;
  }

  return {
    init: init,
    loop: loop,
    playOnce: playOnce,
    stop: stop,
    isRunning: isRunning,
    setDuration: setDuration,
    getDuration: getDuration,
    setFPS: setFPS,
    getFPS: getFPS
  };
};
},{}],8:[function(require,module,exports){
/**
 * Shape prototype object
 * @type {{getNumber, getString, getBool, getArray, getObject}|*}
 */
var valueParser = require('./libs/valueParser')();
var colorParser = require('./libs/colorParser')();

module.exports = function() {

  return {
    styles: null,
    interpolation: null,

    create: function (type, props) {
      var obj = Object.create(this);
      obj.init(type, props || {});
      return obj;
    },

    init: function (type, props) {
      this.props = props;
      for(var prop in props) {
        var p = props[prop];
        if(typeof p === "function") {
          props[prop] = p.bind(props);
        }
      }
      this.draw = type.draw;
    },

    render: function (context, time) {
      var t = this.interpolate(time);

      this.startDraw(context, t);
      this.draw(context, t);
      this.endDraw(context, t);
    },

    interpolate: function (t) {
      t *= this.props.speedMult || 1;
      t += this.props.phase || 0;

      switch (this.interpolation.mode) {
        case "bounce":
          if (this.interpolation.easing) {
            var a = t * Math.PI * 2;
            return 0.5 - Math.cos(a) * 0.5;
          }
          else {
            t = t % 1;
            return t < 0.5 ? t * 2 : t = (1 - t) * 2;
          }
          break;

        case "single":
          if (t > 1) {
            t %= 1;
          }
          if (this.interpolation.easing) {
            var a = t * Math.PI;
            return 0.5 - Math.cos(a) * 0.5;
          }
          else {
            return t;
          }
      }

    },

    startDraw: function (context, t) {
      context.save();
      context.lineWidth = this.getNumber("lineWidth", t, this.styles.lineWidth);
      context.strokeStyle = this.getColor("strokeStyle", t, this.styles.strokeStyle);
      context.fillStyle = this.getColor("fillStyle", t, this.styles.fillStyle);
      context.lineCap = this.getString("lineCap", t, this.styles.lineCap);
      context.lineJoin = this.getString("lineJoin", t, this.styles.lineJoin);
      context.miterLimit = this.getString("miterLimit", t, this.styles.miterLimit);
      context.globalAlpha = this.getNumber("globalAlpha", t, this.styles.globalAlpha);
      context.translate(this.getNumber("translationX", t, this.styles.translationX), this.getNumber("translationY", t, this.styles.translationY));
      context.globalCompositeOperation = this.getString("blendMode", t, this.styles.blendMode);
      var shake = this.getNumber("shake", t, this.styles.shake);
      context.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);

      var lineDash = this.getArray("lineDash", t, this.styles.lineDash);
      if (lineDash) {
        context.setLineDash(lineDash);
      }
      context.beginPath();
    },

    drawFillAndStroke: function (context, t, doFill, doStroke) {
      var fill = this.getBool("fill", t, doFill),
        stroke = this.getBool("stroke", t, doStroke);

      context.save();
      if (fill) {
        this.setShadowParams(context, t);
        context.fill();
      }
      context.restore();
      if (stroke) {
        if (!fill) {
          this.setShadowParams(context, t);
        }
        context.stroke();
      }
    },

    setShadowParams: function (context, t) {
      context.shadowColor = this.getColor("shadowColor", t, this.styles.shadowColor);
      context.shadowOffsetX = this.getNumber("shadowOffsetX", t, this.styles.shadowOffsetX);
      context.shadowOffsetY = this.getNumber("shadowOffsetY", t, this.styles.shadowOffsetY);
      context.shadowBlur = this.getNumber("shadowBlur", t, this.styles.shadowBlur);
    },

    endDraw: function (context) {
      context.restore();
    },

    getNumber: function (prop, t, def) {
      return valueParser.getNumber(this.props[prop], t, def);
    },

    getColor: function (prop, t, def) {
      return colorParser.getColor(this.props[prop], t, def);
    },

    getString: function (prop, t, def) {
      return valueParser.getString(this.props[prop], t, def);
    },

    getBool: function (prop, t, def) {
      return valueParser.getBool(this.props[prop], t, def);
    },

    getArray: function (prop, t, def) {
      return valueParser.getArray(this.props[prop], t, def);
    },

    getObject: function (prop, t, def) {
      return valueParser.getObject(this.props[prop], t, def);
    },

    getPosition: function (prop, t, def) {
      return valueParser.getPosition(this.props[prop], t, def);
    }
  }
};

},{"./libs/colorParser":2,"./libs/valueParser":3}],9:[function(require,module,exports){
/**
 * Include all default shapes
 * @type {{draw}|*}
 */
var circle          = require('./shapes/circle')();
var heart           = require('./shapes/heart')();
var arrow           = require('./shapes/arrow')();
var arcSegment      = require('./shapes/arcSegment')();
var bezierCurve     = require('./shapes/bezierCurve')();
var bezierSegment   = require('./shapes/bezierSegment')();
var cube            = require('./shapes/cube')();
var curve           = require('./shapes/curve')();
var curveSegment    = require('./shapes/curveSegment')();
var gear            = require('./shapes/gear')();
var line            = require('./shapes/line')();
var oval            = require('./shapes/oval')();
var path            = require('./shapes/path')();
var poly            = require('./shapes/poly')();
var raySegment      = require('./shapes/raySegment')();
var rect            = require('./shapes/rect')();
var segment         = require('./shapes/segment')();
var spiral          = require('./shapes/spiral')();
var star            = require('./shapes/star')();
var text            = require('./shapes/text')();

module.exports = {
  circle : circle,
  arrow : arrow,
  arcSegment: arcSegment,
  bezierCurve : bezierCurve,
  bezierSegment : bezierSegment,
  cube : cube,
  curve : curve,
  curveSegment : curveSegment,
  gear : gear,
  line : line,
  oval : oval,
  path: path,
  poly : poly,
  raySegment : raySegment,
  rect : rect,
  segment : segment,
  spiral : spiral,
  star : star,
  text : text,
  heart : heart
};
},{"./shapes/arcSegment":10,"./shapes/arrow":11,"./shapes/bezierCurve":12,"./shapes/bezierSegment":13,"./shapes/circle":14,"./shapes/cube":15,"./shapes/curve":16,"./shapes/curveSegment":17,"./shapes/gear":18,"./shapes/heart":19,"./shapes/line":20,"./shapes/oval":21,"./shapes/path":22,"./shapes/poly":23,"./shapes/raySegment":24,"./shapes/rect":25,"./shapes/segment":26,"./shapes/spiral":27,"./shapes/star":28,"./shapes/text":29}],10:[function(require,module,exports){
module.exports = function(){
	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				radius = this.getNumber("radius", t, 50),
				startAngle = this.getNumber("startAngle", t, 0),
				endAngle = this.getNumber("endAngle", t, 360);

			if(startAngle > endAngle) {
				var temp = startAngle;
				startAngle = endAngle;
				endAngle = temp;
			}
			var arc = this.getNumber("arc", t, 20),
				start = startAngle - 1,
				end = startAngle + t * (endAngle - startAngle + arc);

			if(end > startAngle + arc) {
				start = end - arc;
			}
			if(end > endAngle) {
				end = endAngle + 1;
			}

			context.translate(x, y);
			context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);
			context.arc(0, 0, radius, start * Math.PI / 180, end * Math.PI / 180);

			this.drawFillAndStroke(context, t, false, true);		
		}
	}
};

},{}],11:[function(require,module,exports){
module.exports = function(){
	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				w = this.getNumber("w", t, 100),
				h = this.getNumber("h", t, 100),
				pointPercent = this.getNumber("pointPercent", t, 0.5),
				shaftPercent = this.getNumber("shaftPercent", t, 0.5);
				
			context.translate(x, y);
			context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);

			// context.translate(-w / 2, 0);

			context.moveTo(-w / 2, -h * shaftPercent * 0.5);
			context.lineTo(w / 2 - w * pointPercent, -h * shaftPercent * 0.5);
			context.lineTo(w / 2 - w * pointPercent, -h * 0.5);
			context.lineTo(w / 2, 0);
			context.lineTo(w / 2 - w * pointPercent, h * 0.5);
			context.lineTo(w / 2 - w * pointPercent, h * shaftPercent * 0.5);
			context.lineTo(-w / 2, h * shaftPercent * 0.5);
			context.lineTo(-w / 2, -h * shaftPercent * 0.5);

			this.drawFillAndStroke(context, t, true, false);
		}
	}
};
},{}],12:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x0 = this.getNumber("x0", t, 50),
				y0 = this.getNumber("y0", t, 10),
				x1 = this.getNumber("x1", t, 200),
				y1 = this.getNumber("y1", t, 100),
				x2 = this.getNumber("x2", t, 0),
				y2 = this.getNumber("y2", t, 100),
				x3 = this.getNumber("x3", t, 150),
				y3 = this.getNumber("y3", t, 10);

		    context.moveTo(x0, y0);
		    context.bezierCurveTo(x1, y1, x2, y2, x3, y3);

			this.drawFillAndStroke(context, t, false, true);	
		}
	}
};

},{}],13:[function(require,module,exports){
module.exports = function(){

	function bezier(t, v0, v1, v2, v3) {
		return (1 - t) * (1 - t) * (1 - t) * v0 + 3 * (1 - t) * (1 - t) * t * v1 + 3 * (1 - t) * t * t * v2 + t * t * t * v3;
	}

	return {
		draw: function(context, t) {
			var x0 = this.getNumber("x0", t, 50),
				y0 = this.getNumber("y0", t, 10),
				x1 = this.getNumber("x1", t, 200),
				y1 = this.getNumber("y1", t, 100),
				x2 = this.getNumber("x2", t, 0),
				y2 = this.getNumber("y2", t, 100),
				x3 = this.getNumber("x3", t, 150),
				y3 = this.getNumber("y3", t, 10),
				percent = this.getNumber("percent", t, 0.1),
				t1 = t * (1 + percent),
				t0 = t1 - percent,
				res = 0.01,
				x,
				y;

			t1 = Math.min(t1, 1.001);
			t0 = Math.max(t0, -0.001);

			for(var i = t0; i < t1; i += res) {
				x = bezier(i, x0, x1, x2, x3);
				y = bezier(i, y0, y1, y2, y3);
				if(i === t0) {
				    context.moveTo(x, y);
				}
				else {
		    		context.lineTo(x, y);
				}
			}
			x = bezier(t1, x0, x1, x2, x3);
			y = bezier(t1, y0, y1, y2, y3);
	   		context.lineTo(x, y);

			this.drawFillAndStroke(context, t, false, true);
		}
	}
};

},{}],14:[function(require,module,exports){
module.exports = function(){
  return {
    draw: function(context, t) {
      var x = this.getNumber("x", t, 100),
        y = this.getNumber("y", t, 100),
        radius = this.getNumber("radius", t, 50),
        startAngle = this.getNumber("startAngle", t, 0),
        endAngle = this.getNumber("endAngle", t, 360),
        drawFromCenter = this.getBool("drawFromCenter", t, false);

      context.translate(x, y);
      context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);
      if(drawFromCenter) {
        context.moveTo(0, 0);
      }
      context.arc(0, 0, radius, startAngle * Math.PI / 180, endAngle * Math.PI / 180);
      if(drawFromCenter) {
        context.closePath();
      }

      this.drawFillAndStroke(context, t, true, false);
    }
  }
};
},{}],15:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				z = this.getNumber("z", t, 0),
				size = this.getNumber("size", t, 100),
				rotationX = this.getNumber("rotationX", t, 0) * Math.PI / 180,
				rotationY = this.getNumber("rotationY", t, 0) * Math.PI / 180,
				rotationZ = this.getNumber("rotationZ", t, 0) * Math.PI / 180;

			var points = makePoints();
			scale(points, size / 2);
			rotateX(points, rotationX);
			rotateY(points, rotationY);
			rotateZ(points, rotationZ);
			project(points, z);

			context.lineJoin = this.getString("lineJoin", t, "round");
			context.lineWidth = this.getNumber("lineWidth", t, 1);

			context.translate(x, y);

			context.moveTo(points[0].sx, points[0].sy);
			context.lineTo(points[1].sx, points[1].sy);
			context.lineTo(points[2].sx, points[2].sy);
			context.lineTo(points[3].sx, points[3].sy);
			context.lineTo(points[0].sx, points[0].sy);

			context.moveTo(points[4].sx, points[4].sy);
			context.lineTo(points[5].sx, points[5].sy);
			context.lineTo(points[6].sx, points[6].sy);
			context.lineTo(points[7].sx, points[7].sy);
			context.lineTo(points[4].sx, points[4].sy);

			context.moveTo(points[0].sx, points[0].sy);
			context.lineTo(points[4].sx, points[4].sy);

			context.moveTo(points[1].sx, points[1].sy);
			context.lineTo(points[5].sx, points[5].sy);

			context.moveTo(points[2].sx, points[2].sy);
			context.lineTo(points[6].sx, points[6].sy);

			context.moveTo(points[3].sx, points[3].sy);
			context.lineTo(points[7].sx, points[7].sy);

			this.setShadowParams(context, t);
			context.stroke();		
		}
	}
	
	function scale(points, size) {
		for(var i = 0; i < points.length; i++) {
			var p = points[i];
			p.x *= size;
			p.y *= size;
			p.z *= size;
		}
	}

	function rotateX(points, angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		for(var i = 0; i < points.length; i++) {
			var p = points[i],
				y = p.y * cos - p.z * sin,
				z = p.z * cos + p.y * sin;
			p.y = y;
			p.z = z;
		}
	}

	function rotateY(points, angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		for(var i = 0; i < points.length; i++) {
			var p = points[i],
				x = p.x * cos - p.z * sin,
				z = p.z * cos + p.x * sin;
			p.x = x;
			p.z = z;
		}
	}

	function rotateZ(points, angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		for(var i = 0; i < points.length; i++) {
			var p = points[i],
				x = p.x * cos - p.y * sin,
				y = p.y * cos + p.x * sin;
			p.x = x;
			p.y = y;
		}
	}

	function project(points, z) {
		var fl = 300;
		for(var i = 0; i < points.length; i++) {
			var p = points[i],
				scale = fl / (fl + p.z + z);
			p.sx = p.x * scale;
			p.sy = p.y * scale;
		}
	}

	function makePoints() {
		return [
			{
				x: -1,
				y: -1,
				z: -1
			},
			{
				x: 1,
				y: -1,
				z: -1
			},
			{
				x: 1,
				y: 1,
				z: -1
			},
			{
				x: -1,
				y: 1,
				z: -1
			},
			{
				x: -1,
				y: -1,
				z: 1
			},
			{
				x: 1,
				y: -1,
				z: 1
			},
			{
				x: 1,
				y: 1,
				z: 1
			},
			{
				x: -1,
				y: 1,
				z: 1
			}
		];
	}
};

},{}],16:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x0 = this.getNumber("x0", t, 20),
				y0 = this.getNumber("y0", t, 10),
				x1 = this.getNumber("x1", t, 100),
				y1 = this.getNumber("y1", t, 200),
				x2 = this.getNumber("x2", t, 180),
				y2 = this.getNumber("y2", t, 10);

		    context.moveTo(x0, y0);
		    context.quadraticCurveTo(x1, y1, x2, y2);

			this.drawFillAndStroke(context, t, false, true);
		}
	}
};

},{}],17:[function(require,module,exports){
module.exports = function(){

	function quadratic(t, v0, v1, v2) {
		return (1 - t) * (1 - t) * v0 + 2 * (1 - t) * t * v1 + t * t * v2;
	}

	return {
		draw: function(context, t) {
			var x0 = this.getNumber("x0", t, 20),
				y0 = this.getNumber("y0", t, 20),
				x1 = this.getNumber("x1", t, 100),
				y1 = this.getNumber("y1", t, 200),
				x2 = this.getNumber("x2", t, 180),
				y2 = this.getNumber("y2", t, 20),
				percent = this.getNumber("percent", t, 0.1),
				t1 = t * (1 + percent),
				t0 = t1 - percent,
				res = 0.01,
				x,
				y;

			t1 = Math.min(t1, 1);
			t0 = Math.max(t0, 0);

			for(var i = t0; i < t1; i += res) {
				x = quadratic(i, x0, x1, x2);
				y = quadratic(i, y0, y1, y2);
				if(i === t0) {
				    context.moveTo(x, y);
				}
				else {
		    		context.lineTo(x, y);
				}
			}
			x = quadratic(t1, x0, x1, x2);
			y = quadratic(t1, y0, y1, y2);
	   		context.lineTo(x, y);

			this.drawFillAndStroke(context, t, false, true);		}
	}
};

},{}],18:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				radius = this.getNumber("radius", t, 50),
				toothHeight = this.getNumber("toothHeight", t, 10),
				hub = this.getNumber("hub", t, 10),
				rotation = this.getNumber("rotation", t, 0) * Math.PI / 180,
				teeth = this.getNumber("teeth", t, 10),
				toothAngle = this.getNumber("toothAngle", t, 0.3),
				face = 0.5 - toothAngle / 2,
				side = 0.5 - face,
				innerRadius = radius - toothHeight;

			context.translate(x, y);
			context.rotate(rotation);
			context.save();
			context.moveTo(radius, 0);
			var angle = Math.PI * 2 / teeth;

			for(var i = 0; i < teeth; i++) {
				context.rotate(angle * face);
				context.lineTo(radius, 0);
				context.rotate(angle * side);
				context.lineTo(innerRadius, 0);
				context.rotate(angle * face);
				context.lineTo(innerRadius, 0);
				context.rotate(angle * side);
				context.lineTo(radius, 0);
			}
			context.lineTo(radius, 0);
			context.restore();

			context.moveTo(hub, 0);
			context.arc(0, 0, hub, 0, Math.PI * 2, true);

			this.drawFillAndStroke(context, t, true, false);
		}
	}
};

},{}],19:[function(require,module,exports){
module.exports = function() {
  return {
    draw: function(context, t) {
      var x = this.getNumber("x", t, 100),
        y = this.getNumber("y", t, 100),
        w = this.getNumber("w", t, 50),
        h = this.getNumber("h", t, 50);

      var x0 = 0,
        y0 = -.25,
        x1 = .2,
        y1 = -.8,
        x2 = 1.1,
        y2 = -.2,
        x3 = 0,
        y3 = .5;

      context.save();
      context.translate(x, y);
      context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);
      context.save();
      context.scale(w, h);
      context.moveTo(x0, y0);
      context.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      context.bezierCurveTo(-x2, y2, -x1, y1, -x0, y0);
      context.restore();
      this.drawFillAndStroke(context, t, true, false);
      context.restore();
    }
  }
};
},{}],20:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x0 = this.getNumber("x0", t, 0),
				y0 = this.getNumber("y0", t, 0),
				x1 = this.getNumber("x1", t, 100),
				y1 = this.getNumber("y1", t, 100);
				
			context.moveTo(x0, y0);
			context.lineTo(x1, y1);

			this.drawFillAndStroke(context, t, false, true);		
		}
	}
};

},{}],21:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				rx = this.getNumber("rx", t, 50),
				ry = this.getNumber("ry", t, 50),
				startAngle = this.getNumber("startAngle", t, 0),
				endAngle = this.getNumber("endAngle", t, 360),
				drawFromCenter = this.getBool("drawFromCenter", t, false);

			context.translate(x, y);
			context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);
			context.save();
			context.scale(rx / 100, ry / 100);
			if(drawFromCenter) {
				context.moveTo(0, 0);
			}
			context.arc(0, 0, 100, startAngle * Math.PI / 180, endAngle * Math.PI / 180);
			if(drawFromCenter) {
				context.closePath();
			}
			context.restore();

			this.drawFillAndStroke(context, t, true, false);
		}
	}
};

},{}],22:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var path = this.getArray("path", t, []),
				startPercent = this.getNumber("startPercent", t, 0),
				endPercent = this.getNumber("endPercent", t, 1),
				startPoint = Math.floor(path.length / 2 * startPercent),
				endPoint = Math.floor(path.length / 2 * endPercent),
				startIndex = startPoint * 2,
				endIndex = endPoint * 2;

			if(startIndex > endIndex) {
				var temp = startIndex;
				startIndex = endIndex;
				endIndex = temp;
			}

		    context.moveTo(path[startIndex], path[startIndex + 1]);

		    for(var i = startIndex + 2; i < endIndex - 1; i += 2) {
		    	context.lineTo(path[i], path[i + 1]);
		    }

			this.drawFillAndStroke(context, t, false, true);		}
	}
};

},{}],23:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				radius = this.getNumber("radius", t, 50),
				rotation = this.getNumber("rotation", t, 0) * Math.PI / 180,
				sides = this.getNumber("sides", t, 5);

			context.translate(x, y);
			context.rotate(rotation);
			context.moveTo(radius, 0);
			for(var i = 1; i < sides; i++) {
				var angle = Math.PI * 2 / sides * i;
				context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
			}
			context.lineTo(radius, 0);

			this.drawFillAndStroke(context, t, true, false);
		}
	}
};
		

},{}],24:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				angle = this.getNumber("angle", t, 0) * Math.PI / 180,
				length = this.getNumber("length", t, 100),
				segmentLength = this.getNumber("segmentLength", t, 50),				
		    	start = -0.01,
		    	end = (length + segmentLength) * t;

		    if(end > segmentLength) {
		      start = end - segmentLength;
		    }
		    if(end > length) {
		      end = length + 0.01;
		    }

		    context.translate(x, y);
		    context.rotate(angle);
			context.moveTo(start, 0);
			context.lineTo(end, 0);

			this.drawFillAndStroke(context, t, false, true);
		}
	}
};

},{}],25:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				w = this.getNumber("w", t, 100),
				h = this.getNumber("h", t, 100);
				
			context.translate(x, y);
			context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);
			if(this.getBool("drawFromCenter", t, true)) {
				context.rect(-w * 0.5, -h * 0.5, w, h);
			}
			else {
				context.rect(0, 0, w, h);
			}

			this.drawFillAndStroke(context, t, true, false);
		}
	}
};

},{}],26:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x0 = this.getNumber("x0", t, 0),
				y0 = this.getNumber("y0", t, 0),
				x1 = this.getNumber("x1", t, 100),
				y1 = this.getNumber("y1", t, 100),
				segmentLength = this.getNumber("segmentLength", t, 50),
				dx = x1 - x0,
			    dy = y1 - y0,
			    angle = Math.atan2(dy, dx),
			    dist = Math.sqrt(dx * dx + dy * dy),
		    	start = -0.01,
		    	end = (dist + segmentLength) * t;

		    if(end > segmentLength) {
		      start = end - segmentLength;
		    }
		    if(end > dist) {
		      end = dist + 0.01;
		    }

		    context.translate(x0, y0);
		    context.rotate(angle);
			context.moveTo(start, 0);
			context.lineTo(end, 0);

			this.drawFillAndStroke(context, t, false, true);
		}
	}
};

},{}],27:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, "100"),
				y = this.getNumber("y", t, "100"),
				innerRadius = this.getNumber("innerRadius", t, 10),
				outerRadius = this.getNumber("outerRadius", t, 90),
				turns = this.getNumber("turns", t, 6),
				res = this.getNumber("res", t, 1) * Math.PI / 180,
				fullAngle = Math.PI * 2 * turns;

			context.translate(x, y);
			context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);


			if(fullAngle > 0) {
				for(var a = 0; a < fullAngle; a += res) {
					var r = innerRadius + (outerRadius - innerRadius) * a / fullAngle;
					context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
				}
			}
			else {
				for(var a = 0; a > fullAngle; a -= res) {
					var r = innerRadius + (outerRadius - innerRadius) * a / fullAngle;
					context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
				}
			}
			this.drawFillAndStroke(context, t, false, true);
		}
	};

};
},{}],28:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				innerRadius = this.getNumber("innerRadius", t, 25),
				outerRadius = this.getNumber("outerRadius", t, 50),
				rotation = this.getNumber("rotation", t, 0) * Math.PI / 180,
				points = this.getNumber("points", t, 5);

			context.translate(x, y);
			context.rotate(rotation);
			context.moveTo(outerRadius, 0);
			for(var i = 1; i < points * 2; i++) {
				var angle = Math.PI * 2 / points / 2 * i,
					r = i % 2 ? innerRadius : outerRadius;
				context.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
			}
			context.lineTo(outerRadius, 0);


			this.drawFillAndStroke(context, t, true, false);	
		}
	}
};

},{}],29:[function(require,module,exports){
module.exports = function(){

	return {
		draw: function(context, t) {
			var x = this.getNumber("x", t, 100),
				y = this.getNumber("y", t, 100),
				text = this.getString("text", t, "hello"),
				fontSize = this.getNumber("fontSize", t, 20),
				fontWeight = this.getString("fontWeight", t, "normal");
				fontFamily = this.getString("fontFamily", t, "sans-serif");
				fontStyle = this.getString("fontStyle", t, "normal");

			context.font = fontWeight + " " + fontStyle + " " + fontSize + "px " + fontFamily;
			var width = context.measureText(text).width;
			context.translate(x, y);
			context.rotate(this.getNumber("rotation", t, 0) * Math.PI / 180);
			var shadowsSet = false;
			context.save();
			if(this.getBool("fill", t, true)) {
				this.setShadowParams(context, t);
				shadowsSet = true;
				context.fillText(text, -width / 2, fontSize * 0.4);
			}
			context.restore();
			if(this.getBool("stroke", t, false)) {
				if(!shadowsSet) {
					this.setShadowParams(context, t);
				}
				context.strokeText(text, -width / 2, fontSize * 0.4);
			}
		}
	}
};

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWJzL2NvbG9yLmpzIiwibGlicy9jb2xvclBhcnNlci5qcyIsImxpYnMvdmFsdWVQYXJzZXIuanMiLCJtYWluLmpzIiwibW9kZWwuanMiLCJyZW5kZXJMaXN0LmpzIiwic2NoZWR1bGVyLmpzIiwic2hhcGUuanMiLCJzaGFwZUxpc3QuanMiLCJzaGFwZXMvYXJjU2VnbWVudC5qcyIsInNoYXBlcy9hcnJvdy5qcyIsInNoYXBlcy9iZXppZXJDdXJ2ZS5qcyIsInNoYXBlcy9iZXppZXJTZWdtZW50LmpzIiwic2hhcGVzL2NpcmNsZS5qcyIsInNoYXBlcy9jdWJlLmpzIiwic2hhcGVzL2N1cnZlLmpzIiwic2hhcGVzL2N1cnZlU2VnbWVudC5qcyIsInNoYXBlcy9nZWFyLmpzIiwic2hhcGVzL2hlYXJ0LmpzIiwic2hhcGVzL2xpbmUuanMiLCJzaGFwZXMvb3ZhbC5qcyIsInNoYXBlcy9wYXRoLmpzIiwic2hhcGVzL3BvbHkuanMiLCJzaGFwZXMvcmF5U2VnbWVudC5qcyIsInNoYXBlcy9yZWN0LmpzIiwic2hhcGVzL3NlZ21lbnQuanMiLCJzaGFwZXMvc3BpcmFsLmpzIiwic2hhcGVzL3N0YXIuanMiLCJzaGFwZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgZnVuY3Rpb24gcmdiYShyLCBnLCBiLCBhKSB7XG4gICAgdmFyIGNsciA9IE9iamVjdC5jcmVhdGUoY29sb3IpO1xuICAgIGNsci5zZXRSR0JBKHIsIGcsIGIsIGEpO1xuICAgIHJldHVybiBjbHIudG9TdHJpbmcoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJnYihyLCBnLCBiKSB7XG4gICAgcmV0dXJuIHJnYmEociwgZywgYiwgMSk7XG4gIH1cblxuICBmdW5jdGlvbiByYW5kb21SR0IobWluLCBtYXgpIHtcbiAgICBtaW4gPSBtaW4gfHwgMDtcbiAgICBtYXggPSBtYXggfHwgMjU2O1xuICAgIHJldHVybiByZ2IoXG4gICAgICBNYXRoLmZsb29yKG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSksXG4gICAgICBNYXRoLmZsb29yKG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSksXG4gICAgICBNYXRoLmZsb29yKG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFuZG9tR3JheShtaW4sIG1heCkge1xuICAgIG1pbiA9IG1pbiB8fCAwO1xuICAgIG1heCA9IG1heCB8fCAyNTY7XG4gICAgcmV0dXJuIGdyYXkoTWF0aC5mbG9vcihtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdyYXkoc2hhZGUpIHtcbiAgICByZXR1cm4gcmdiKHNoYWRlLCBzaGFkZSwgc2hhZGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbnVtKG51bSkge1xuICAgIHZhciByZWQgPSBudW0gPj4gMTYsXG4gICAgICBncmVlbiA9IG51bSA+PiA4ICYgMHhmZixcbiAgICAgIGJsdWUgPSBudW0gJiAweGZmO1xuICAgIHJldHVybiByZ2IocmVkLCBncmVlbiwgYmx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiByYW5kb21IU1YobWluSCwgbWF4SCwgbWluUywgbWF4UywgbWluViwgbWF4Vikge1xuICAgIHZhciBoID0gbWluSCArIE1hdGgucmFuZG9tKCkgKiAobWF4SCAtIG1pbkgpLFxuICAgICAgcyA9IG1pblMgKyBNYXRoLnJhbmRvbSgpICogKG1heFMgLSBtaW5TKSxcbiAgICAgIHYgPSBtaW5WICsgTWF0aC5yYW5kb20oKSAqIChtYXhWIC0gbWluVik7XG4gICAgcmV0dXJuIGhzdihoLCBzLCB2KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhzdmEoaCwgcywgdiwgYSkge1xuICAgIHZhciByLCBnLCBiLFxuICAgICAgaSA9IE1hdGguZmxvb3IoaCAvIDYwKSxcbiAgICAgIGYgPSBoIC8gNjAgLSBpLFxuICAgICAgcCA9IHYgKiAoMSAtIHMpLFxuICAgICAgcSA9IHYgKiAoMSAtIGYgKiBzKSxcbiAgICAgIHQgPSB2ICogKDEgLSAoMSAtIGYpICogcyk7XG4gICAgc3dpdGNoIChpICUgNikge1xuICAgICAgY2FzZSAwOiByID0gdiwgZyA9IHQsIGIgPSBwOyBicmVhaztcbiAgICAgIGNhc2UgMTogciA9IHEsIGcgPSB2LCBiID0gcDsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHIgPSBwLCBnID0gdiwgYiA9IHQ7IGJyZWFrO1xuICAgICAgY2FzZSAzOiByID0gcCwgZyA9IHEsIGIgPSB2OyBicmVhaztcbiAgICAgIGNhc2UgNDogciA9IHQsIGcgPSBwLCBiID0gdjsgYnJlYWs7XG4gICAgICBjYXNlIDU6IHIgPSB2LCBnID0gcCwgYiA9IHE7IGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmdiYShcbiAgICAgIE1hdGguZmxvb3IociAqIDI1NSksXG4gICAgICBNYXRoLmZsb29yKGcgKiAyNTUpLFxuICAgICAgTWF0aC5mbG9vcihiICogMjU1KSxcbiAgICAgIGFcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gaHN2KGgsIHMsIHYpIHtcbiAgICByZXR1cm4gaHN2YShoLCBzLCB2LCAxKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFuaW1IU1ZBKHN0YXJ0SCwgZW5kSCwgc3RhcnRTLCBlbmRTLCBzdGFydFYsIGVuZFYsIHN0YXJ0QSwgZW5kQSkge1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaCA9IHN0YXJ0SCArIHQgKiAoZW5kSCAtIHN0YXJ0SCksXG4gICAgICAgIHMgPSBzdGFydFMgKyB0ICogKGVuZFMgLSBzdGFydFMpLFxuICAgICAgICB2ID0gc3RhcnRWICsgdCAqIChlbmRWIC0gc3RhcnRWKSxcbiAgICAgICAgYSA9IHN0YXJ0QSArIHQgKiAoZW5kQSAtIHN0YXJ0QSk7XG4gICAgICByZXR1cm4gaHN2YShoLCBzLCB2LCBhKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhbmltSFNWKHN0YXJ0SCwgZW5kSCwgc3RhcnRTLCBlbmRTLCBzdGFydFYsIGVuZFYpIHtcbiAgICByZXR1cm4gYW5pbUhTVkEoc3RhcnRILCBlbmRILCBzdGFydFMsIGVuZFMsIHN0YXJ0ViwgZW5kViwgMSwgMSk7XG4gIH1cblxuXG5cblxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBncmFkaWVudHNcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIGZ1bmN0aW9uIGNyZWF0ZUxpbmVhckdyYWRpZW50KHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgdmFyIGcgPSB7XG4gICAgICB0eXBlOiBcImxpbmVhckdyYWRpZW50XCIsXG4gICAgICB4MDogeDAsXG4gICAgICB5MDogeTAsXG4gICAgICB4MTogeDEsXG4gICAgICB5MTogeTEsXG4gICAgICBjb2xvclN0b3BzOiBbXSxcbiAgICAgIGFkZENvbG9yU3RvcDogZnVuY3Rpb24ocG9zaXRpb24sIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY29sb3JTdG9wcy5wdXNoKHtcbiAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgY29sb3I6IGNvbG9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGc7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSYWRpYWxHcmFkaWVudCh4MCwgeTAsIHIwLCB4MSwgeTEsIHIxKSB7XG4gICAgdmFyIGcgPSB7XG4gICAgICB0eXBlOiBcInJhZGlhbEdyYWRpZW50XCIsXG4gICAgICB4MDogeDAsXG4gICAgICB5MDogeTAsXG4gICAgICByMDogcjAsXG4gICAgICB4MTogeDEsXG4gICAgICB5MTogeTEsXG4gICAgICByMTogcjEsXG4gICAgICBjb2xvclN0b3BzOiBbXSxcbiAgICAgIGFkZENvbG9yU3RvcDogZnVuY3Rpb24ocG9zaXRpb24sIGNvbG9yKSB7XG4gICAgICAgIHRoaXMuY29sb3JTdG9wcy5wdXNoKHtcbiAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgY29sb3I6IGNvbG9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGc7XG4gIH1cblxuICB2YXIgY29sb3IgPSB7XG4gICAgcjogMjU1LFxuICAgIGc6IDI1NSxcbiAgICBiOiAyNTUsXG4gICAgYTogMSxcblxuICAgIHNldFJHQkE6IGZ1bmN0aW9uKHIsIGcsIGIsIGEpIHtcbiAgICAgIHRoaXMuciA9IHI7XG4gICAgICB0aGlzLmcgPSBnO1xuICAgICAgdGhpcy5iID0gYjtcbiAgICAgIHRoaXMuYSA9IGE7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwicmdiYShcIiArIE1hdGguZmxvb3IodGhpcy5yKSArIFwiLFwiICsgTWF0aC5mbG9vcih0aGlzLmcpICsgXCIsXCIgKyBNYXRoLmZsb29yKHRoaXMuYikgKyBcIixcIiArIHRoaXMuYSArIFwiKVwiO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHJnYjogcmdiLFxuICAgIHJnYmE6IHJnYmEsXG4gICAgcmFuZG9tUkdCOiByYW5kb21SR0IsXG4gICAgcmFuZG9tR3JheTogcmFuZG9tR3JheSxcbiAgICBncmF5OiBncmF5LFxuICAgIG51bTogbnVtLFxuICAgIGhzdjogaHN2LFxuICAgIGhzdmE6IGhzdmEsXG4gICAgYW5pbUhTVjogYW5pbUhTVixcbiAgICBhbmltSFNWQTogYW5pbUhTVkEsXG4gICAgcmFuZG9tSFNWOiByYW5kb21IU1YsXG4gICAgY3JlYXRlTGluZWFyR3JhZGllbnQ6IGNyZWF0ZUxpbmVhckdyYWRpZW50LFxuICAgIGNyZWF0ZVJhZGlhbEdyYWRpZW50OiBjcmVhdGVSYWRpYWxHcmFkaWVudFxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIikuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gIGZ1bmN0aW9uIGdldENvbG9yKHByb3AsIHQsIGRlZikge1xuICAgIGlmKHByb3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG4gICAgaWYodHlwZW9mKHByb3ApID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpZihwcm9wLmNoYXJBdCgwKSA9PT0gXCIjXCIgJiYgcHJvcC5sZW5ndGggPiA3KSB7XG4gICAgICAgIHZhciBvYmogPSBnZXRDb2xvck9iaihwcm9wKTtcbiAgICAgICAgcmV0dXJuIGdldENvbG9yU3RyaW5nKG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcDtcbiAgICB9XG4gICAgZWxzZSBpZih0eXBlb2YocHJvcCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIHByb3AodCk7XG4gICAgfVxuICAgIGVsc2UgaWYocHJvcCAmJiBwcm9wLmxlbmd0aCA9PT0gMikge1xuICAgICAgaWYoaXNMaW5lYXJHcmFkaWVudChwcm9wKSkge1xuICAgICAgICByZXR1cm4gcGFyc2VMaW5lYXJHcmFkaWVudChwcm9wLCB0KTtcbiAgICAgIH1cbiAgICAgIGlmKGlzUmFkaWFsR3JhZGllbnQocHJvcCkpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlUmFkaWFsR3JhZGllbnQocHJvcCwgdCk7XG4gICAgICB9XG4gICAgICB2YXIgYzAgPSBnZXRDb2xvck9iaihwcm9wWzBdKSxcbiAgICAgICAgYzEgPSBnZXRDb2xvck9iaihwcm9wWzFdKTtcbiAgICAgIHJldHVybiBpbnRlcnBvbGF0ZUNvbG9yKFtjMCwgYzFdLCB0KTtcbiAgICB9XG4gICAgZWxzZSBpZihwcm9wICYmIHByb3AubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gIHByb3BbTWF0aC5yb3VuZCh0ICogKHByb3AubGVuZ3RoIC0gMSkpXTtcbiAgICB9XG4gICAgaWYocHJvcC50eXBlID09PSBcImxpbmVhckdyYWRpZW50XCIpIHtcbiAgICAgIHZhciBnID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudChwcm9wLngwLCBwcm9wLnkwLCBwcm9wLngxLCBwcm9wLnkxKTtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwcm9wLmNvbG9yU3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHN0b3AgPSBwcm9wLmNvbG9yU3RvcHNbaV07XG4gICAgICAgIGcuYWRkQ29sb3JTdG9wKHN0b3AucG9zaXRpb24sIHN0b3AuY29sb3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGc7XG4gICAgfVxuICAgIGlmKHByb3AudHlwZSA9PT0gXCJyYWRpYWxHcmFkaWVudFwiKSB7XG4gICAgICB2YXIgZyA9IGNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQocHJvcC54MCwgcHJvcC55MCwgcHJvcC5yMCwgcHJvcC54MSwgcHJvcC55MSwgcHJvcC5yMSk7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcHJvcC5jb2xvclN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzdG9wID0gcHJvcC5jb2xvclN0b3BzW2ldO1xuICAgICAgICBnLmFkZENvbG9yU3RvcChzdG9wLnBvc2l0aW9uLCBzdG9wLmNvbG9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnO1xuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNMaW5lYXJHcmFkaWVudChwcm9wKSB7XG4gICAgcmV0dXJuIHByb3BbMF0udHlwZSA9PT0gXCJsaW5lYXJHcmFkaWVudFwiICYmIHByb3BbMV0udHlwZSA9PT0gXCJsaW5lYXJHcmFkaWVudFwiO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VMaW5lYXJHcmFkaWVudChwcm9wLCB0KSB7XG4gICAgdmFyIGcwID0gcHJvcFswXSxcbiAgICAgIGcxID0gcHJvcFsxXSxcbiAgICAgIHgwID0gZzAueDAgKyAoZzEueDAgLSBnMC54MCkgKiB0LFxuICAgICAgeTAgPSBnMC55MCArIChnMS55MCAtIGcwLnkwKSAqIHQsXG4gICAgICB4MSA9IGcwLngxICsgKGcxLngxIC0gZzAueDEpICogdCxcbiAgICAgIHkxID0gZzAueTEgKyAoZzEueTEgLSBnMC55MSkgKiB0O1xuXG4gICAgdmFyIGcgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KHgwLCB5MCwgeDEsIHkxKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZzAuY29sb3JTdG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN0b3BBID0gZzAuY29sb3JTdG9wc1tpXSxcbiAgICAgICAgc3RvcEIgPSBnMS5jb2xvclN0b3BzW2ldLFxuICAgICAgICBwb3NpdGlvbiA9IHN0b3BBLnBvc2l0aW9uICsgKHN0b3BCLnBvc2l0aW9uIC0gc3RvcEEucG9zaXRpb24pICogdCxcbiAgICAgICAgY29sb3JBID0gZ2V0Q29sb3JPYmooc3RvcEEuY29sb3IpLFxuICAgICAgICBjb2xvckIgPSBnZXRDb2xvck9iaihzdG9wQi5jb2xvciksXG4gICAgICAgIGNvbG9yID0gaW50ZXJwb2xhdGVDb2xvcihbY29sb3JBLCBjb2xvckJdLCB0KTtcbiAgICAgIGcuYWRkQ29sb3JTdG9wKHBvc2l0aW9uLCBjb2xvcik7XG4gICAgfVxuICAgIHJldHVybiBnO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNSYWRpYWxHcmFkaWVudChwcm9wKSB7XG4gICAgcmV0dXJuIHByb3BbMF0udHlwZSA9PT0gXCJyYWRpYWxHcmFkaWVudFwiICYmIHByb3BbMV0udHlwZSA9PT0gXCJyYWRpYWxHcmFkaWVudFwiO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VSYWRpYWxHcmFkaWVudChwcm9wLCB0KSB7XG4gICAgdmFyIGcwID0gcHJvcFswXSxcbiAgICAgIGcxID0gcHJvcFsxXSxcbiAgICAgIHgwID0gZzAueDAgKyAoZzEueDAgLSBnMC54MCkgKiB0LFxuICAgICAgeTAgPSBnMC55MCArIChnMS55MCAtIGcwLnkwKSAqIHQsXG4gICAgICByMCA9IGcwLnIwICsgKGcxLnIwIC0gZzAucjApICogdCxcbiAgICAgIHgxID0gZzAueDEgKyAoZzEueDEgLSBnMC54MSkgKiB0LFxuICAgICAgeTEgPSBnMC55MSArIChnMS55MSAtIGcwLnkxKSAqIHQsXG4gICAgICByMSA9IGcwLnIxICsgKGcxLnIxIC0gZzAucjEpICogdDtcblxuICAgIHZhciBnID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudCh4MCwgeTAsIHIwLCB4MSwgeTEsIHIxKTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZzAuY29sb3JTdG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN0b3BBID0gZzAuY29sb3JTdG9wc1tpXSxcbiAgICAgICAgc3RvcEIgPSBnMS5jb2xvclN0b3BzW2ldLFxuICAgICAgICBwb3NpdGlvbiA9IHN0b3BBLnBvc2l0aW9uICsgKHN0b3BCLnBvc2l0aW9uIC0gc3RvcEEucG9zaXRpb24pICogdCxcbiAgICAgICAgY29sb3JBID0gZ2V0Q29sb3JPYmooc3RvcEEuY29sb3IpLFxuICAgICAgICBjb2xvckIgPSBnZXRDb2xvck9iaihzdG9wQi5jb2xvciksXG4gICAgICAgIGNvbG9yID0gaW50ZXJwb2xhdGVDb2xvcihbY29sb3JBLCBjb2xvckJdLCB0KTtcbiAgICAgIGcuYWRkQ29sb3JTdG9wKHBvc2l0aW9uLCBjb2xvcik7XG4gICAgfVxuICAgIHJldHVybiBnO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q29sb3JTdHJpbmcob2JqKSB7XG4gICAgcmV0dXJuIFwicmdiYShcIiArIG9iai5yICsgXCIsXCIgKyBvYmouZyArIFwiLFwiICsgb2JqLmIgKyBcIixcIiArIChvYmouYSAvIDI1NSkgKyBcIilcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvbG9yT2JqKGNvbG9yKSB7XG4gICAgaWYoY29sb3IuY2hhckF0KDApID09PSBcIiNcIikge1xuICAgICAgaWYoY29sb3IubGVuZ3RoID09PSA3KSB7IC8vICNycmdnYmJcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhOiAyNTUsXG4gICAgICAgICAgcjogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDEsIDMpLCAxNiksXG4gICAgICAgICAgZzogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDMsIDUpLCAxNiksXG4gICAgICAgICAgYjogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDUsIDcpLCAxNilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZihjb2xvci5sZW5ndGggPT09IDkpIHsgLy8gI2FhcnJnZ2JiXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYTogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDEsIDMpLCAxNiksXG4gICAgICAgICAgcjogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDMsIDUpLCAxNiksXG4gICAgICAgICAgZzogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDUsIDcpLCAxNiksXG4gICAgICAgICAgYjogcGFyc2VJbnQoY29sb3Iuc3Vic3RyaW5nKDcsIDkpLCAxNilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7IC8vICNyZ2JcbiAgICAgICAgdmFyIHIgPSBjb2xvci5jaGFyQXQoMSksXG4gICAgICAgICAgZyA9IGNvbG9yLmNoYXJBdCgyKSxcbiAgICAgICAgICBiID0gY29sb3IuY2hhckF0KDMpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYTogMjU1LFxuICAgICAgICAgIHI6IHBhcnNlSW50KHIgKyByLCAxNiksXG4gICAgICAgICAgZzogcGFyc2VJbnQoZyArIGcsIDE2KSxcbiAgICAgICAgICBiOiBwYXJzZUludChiICsgYiwgMTYpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZihjb2xvci5zdWJzdHJpbmcoMCwgNCkgPT09IFwicmdiKFwiKSB7XG4gICAgICB2YXIgcyA9IGNvbG9yLmluZGV4T2YoXCIoXCIpICsgMSxcbiAgICAgICAgZSA9IGNvbG9yLmluZGV4T2YoXCIpXCIpLFxuICAgICAgICBjaGFubmVscyA9IGNvbG9yLnN1YnN0cmluZyhzLCBlKS5zcGxpdChcIixcIik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhOiAyNTUsXG4gICAgICAgIHI6IHBhcnNlSW50KGNoYW5uZWxzWzBdLCAxMCksXG4gICAgICAgIGc6IHBhcnNlSW50KGNoYW5uZWxzWzFdLCAxMCksXG4gICAgICAgIGI6IHBhcnNlSW50KGNoYW5uZWxzWzJdLCAxMClcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZihjb2xvci5zdWJzdHJpbmcoMCwgNCkgPT09IFwicmdiYVwiKSB7XG4gICAgICB2YXIgcyA9IGNvbG9yLmluZGV4T2YoXCIoXCIpICsgMSxcbiAgICAgICAgZSA9IGNvbG9yLmluZGV4T2YoXCIpXCIpLFxuICAgICAgICBjaGFubmVscyA9IGNvbG9yLnN1YnN0cmluZyhzLCBlKS5zcGxpdChcIixcIik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhOiBwYXJzZUZsb2F0KGNoYW5uZWxzWzNdKSAqIDI1NSxcbiAgICAgICAgcjogcGFyc2VJbnQoY2hhbm5lbHNbMF0sIDEwKSxcbiAgICAgICAgZzogcGFyc2VJbnQoY2hhbm5lbHNbMV0sIDEwKSxcbiAgICAgICAgYjogcGFyc2VJbnQoY2hhbm5lbHNbMl0sIDEwKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmKG5hbWVkQ29sb3JzW2NvbG9yXSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBnZXRDb2xvck9iaihuYW1lZENvbG9yc1tjb2xvcl0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludGVycG9sYXRlQ29sb3IoYXJyLCB0KSB7XG4gICAgdmFyIGMwID0gYXJyWzBdLFxuICAgICAgYzEgPSBhcnJbMV07XG5cbiAgICB2YXIgYWxwaGEgPSBjMC5hICsgKGMxLmEgLSBjMC5hKSAqIHQsXG4gICAgICByZWQgPSBNYXRoLnJvdW5kKGMwLnIgKyAoYzEuciAtIGMwLnIpICogdCksXG4gICAgICBncmVlbiA9IE1hdGgucm91bmQoYzAuZyArIChjMS5nIC0gYzAuZykgKiB0KSxcbiAgICAgIGJsdWUgPSBNYXRoLnJvdW5kKGMwLmIgKyAoYzEuYiAtIGMwLmIpICogdCk7XG4gICAgcmV0dXJuIFwicmdiYShcIiArIHJlZCArIFwiLFwiICsgZ3JlZW4gKyBcIixcIiArIGJsdWUgKyBcIixcIiArIChhbHBoYSAvIDI1NSkgKyBcIilcIjtcbiAgfVxuXG4gIHZhciBuYW1lZENvbG9ycyA9IHtcbiAgICBhbGljZWJsdWU6IFwiI2YwZjhmZlwiLFxuICAgIGFudGlxdWV3aGl0ZTogXCIjZmFlYmQ3XCIsXG4gICAgYXF1YTogXCIjMDBmZmZmXCIsXG4gICAgYXF1YW1hcmluZTogXCIjN2ZmZmQ0XCIsXG4gICAgYXp1cmU6IFwiI2YwZmZmZlwiLFxuICAgIGJlaWdlOiBcIiNmNWY1ZGNcIixcbiAgICBiaXNxdWU6IFwiI2ZmZTRjNFwiLFxuICAgIGJsYWNrOiBcIiMwMDAwMDBcIixcbiAgICBibGFuY2hlZGFsbW9uZDogXCIjZmZlYmNkXCIsXG4gICAgYmx1ZTogXCIjMDAwMGZmXCIsXG4gICAgYmx1ZXZpb2xldDogXCIjOGEyYmUyXCIsXG4gICAgYnJvd246IFwiI2E1MmEyYVwiLFxuICAgIGJ1cmx5d29vZDogXCIjZGViODg3XCIsXG4gICAgY2FkZXRibHVlOiBcIiM1ZjllYTBcIixcbiAgICBjaGFydHJldXNlOiBcIiM3ZmZmMDBcIixcbiAgICBjaG9jb2xhdGU6IFwiI2QyNjkxZVwiLFxuICAgIGNvcmFsOiBcIiNmZjdmNTBcIixcbiAgICBjb3JuZmxvd2VyYmx1ZTogXCIjNjQ5NWVkXCIsXG4gICAgY29ybnNpbGs6IFwiI2ZmZjhkY1wiLFxuICAgIGNyaW1zb246IFwiI2RjMTQzY1wiLFxuICAgIGN5YW46IFwiIzAwZmZmZlwiLFxuICAgIGRhcmtibHVlOiBcIiMwMDAwOGJcIixcbiAgICBkYXJrY3lhbjogXCIjMDA4YjhiXCIsXG4gICAgZGFya2dvbGRlbnJvZDogXCIjYjg4NjBiXCIsXG4gICAgZGFya2dyYXk6IFwiI2E5YTlhOVwiLFxuICAgIGRhcmtncmV5OiBcIiNhOWE5YTlcIixcbiAgICBkYXJrZ3JlZW46IFwiIzAwNjQwMFwiLFxuICAgIGRhcmtraGFraTogXCIjYmRiNzZiXCIsXG4gICAgZGFya21hZ2VudGE6IFwiIzhiMDA4YlwiLFxuICAgIGRhcmtvbGl2ZWdyZWVuOiBcIiM1NTZiMmZcIixcbiAgICBkYXJrb3JhbmdlOiBcIiNmZjhjMDBcIixcbiAgICBkYXJrb3JjaGlkOiBcIiM5OTMyY2NcIixcbiAgICBkYXJrcmVkOiBcIiM4YjAwMDBcIixcbiAgICBkYXJrc2FsbW9uOiBcIiNlOTk2N2FcIixcbiAgICBkYXJrc2VhZ3JlZW46IFwiIzhmYmM4ZlwiLFxuICAgIGRhcmtzbGF0ZWJsdWU6IFwiIzQ4M2Q4YlwiLFxuICAgIGRhcmtzbGF0ZWdyYXk6IFwiIzJmNGY0ZlwiLFxuICAgIGRhcmtzbGF0ZWdyZXk6IFwiIzJmNGY0ZlwiLFxuICAgIGRhcmt0dXJxdW9pc2U6IFwiIzAwY2VkMVwiLFxuICAgIGRhcmt2aW9sZXQ6IFwiIzk0MDBkM1wiLFxuICAgIGRlZXBwaW5rOiBcIiNmZjE0OTNcIixcbiAgICBkZWVwc2t5Ymx1ZTogXCIjMDBiZmZmXCIsXG4gICAgZGltZ3JheTogXCIjNjk2OTY5XCIsXG4gICAgZGltZ3JleTogXCIjNjk2OTY5XCIsXG4gICAgZG9kZ2VyYmx1ZTogXCIjMWU5MGZmXCIsXG4gICAgZmlyZWJyaWNrOiBcIiNiMjIyMjJcIixcbiAgICBmbG9yYWx3aGl0ZTogXCIjZmZmYWYwXCIsXG4gICAgZm9yZXN0Z3JlZW46IFwiIzIyOGIyMlwiLFxuICAgIGZ1Y2hzaWE6IFwiI2ZmMDBmZlwiLFxuICAgIGdhaW5zYm9ybzogXCIjZGNkY2RjXCIsXG4gICAgZ2hvc3R3aGl0ZTogXCIjZjhmOGZmXCIsXG4gICAgZ29sZDogXCIjZmZkNzAwXCIsXG4gICAgZ29sZGVucm9kOiBcIiNkYWE1MjBcIixcbiAgICBncmF5OiBcIiM4MDgwODBcIixcbiAgICBncmV5OiBcIiM4MDgwODBcIixcbiAgICBncmVlbjogXCIjMDA4MDAwXCIsXG4gICAgZ3JlZW55ZWxsb3c6IFwiI2FkZmYyZlwiLFxuICAgIGhvbmV5ZGV3OiBcIiNmMGZmZjBcIixcbiAgICBob3RwaW5rOiBcIiNmZjY5YjRcIixcbiAgICBpbmRpYW5yZWQ6IFwiI2NkNWM1Y1wiLFxuICAgIGluZGlnbzogXCIjNGIwMDgyXCIsXG4gICAgaXZvcnk6IFwiI2ZmZmZmMFwiLFxuICAgIGtoYWtpOiBcIiNmMGU2OGNcIixcbiAgICBsYXZlbmRlcjogXCIjZTZlNmZhXCIsXG4gICAgbGF2ZW5kZXJibHVzaDogXCIjZmZmMGY1XCIsXG4gICAgbGF3bmdyZWVuOiBcIiM3Y2ZjMDBcIixcbiAgICBsZW1vbmNoaWZmb246IFwiI2ZmZmFjZFwiLFxuICAgIGxpZ2h0Ymx1ZTogXCIjYWRkOGU2XCIsXG4gICAgbGlnaHRjb3JhbDogXCIjZjA4MDgwXCIsXG4gICAgbGlnaHRjeWFuOiBcIiNlMGZmZmZcIixcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdzogXCIjZmFmYWQyXCIsXG4gICAgbGlnaHRncmF5OiBcIiNkM2QzZDNcIixcbiAgICBsaWdodGdyZXk6IFwiI2QzZDNkM1wiLFxuICAgIGxpZ2h0Z3JlZW46IFwiIzkwZWU5MFwiLFxuICAgIGxpZ2h0cGluazogXCIjZmZiNmMxXCIsXG4gICAgbGlnaHRzYWxtb246IFwiI2ZmYTA3YVwiLFxuICAgIGxpZ2h0c2VhZ3JlZW46IFwiIzIwYjJhYVwiLFxuICAgIGxpZ2h0c2t5Ymx1ZTogXCIjODdjZWZhXCIsXG4gICAgbGlnaHRzbGF0ZWdyYXk6IFwiIzc3ODg5OVwiLFxuICAgIGxpZ2h0c2xhdGVncmV5OiBcIiM3Nzg4OTlcIixcbiAgICBsaWdodHN0ZWVsYmx1ZTogXCIjYjBjNGRlXCIsXG4gICAgbGlnaHR5ZWxsb3c6IFwiI2ZmZmZlMFwiLFxuICAgIGxpbWU6IFwiIzAwZmYwMFwiLFxuICAgIGxpbWVncmVlbjogXCIjMzJjZDMyXCIsXG4gICAgbGluZW46IFwiI2ZhZjBlNlwiLFxuICAgIG1hZ2VudGE6IFwiI2ZmMDBmZlwiLFxuICAgIG1hcm9vbjogXCIjODAwMDAwXCIsXG4gICAgbWVkaXVtYXF1YW1hcmluZTogXCIjNjZjZGFhXCIsXG4gICAgbWVkaXVtYmx1ZTogXCIjMDAwMGNkXCIsXG4gICAgbWVkaXVtb3JjaGlkOiBcIiNiYTU1ZDNcIixcbiAgICBtZWRpdW1wdXJwbGU6IFwiIzkzNzBkOFwiLFxuICAgIG1lZGl1bXNlYWdyZWVuOiBcIiMzY2IzNzFcIixcbiAgICBtZWRpdW1zbGF0ZWJsdWU6IFwiIzdiNjhlZVwiLFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuOiBcIiMwMGZhOWFcIixcbiAgICBtZWRpdW10dXJxdW9pc2U6IFwiIzQ4ZDFjY1wiLFxuICAgIG1lZGl1bXZpb2xldHJlZDogXCIjYzcxNTg1XCIsXG4gICAgbWlkbmlnaHRibHVlOiBcIiMxOTE5NzBcIixcbiAgICBtaW50Y3JlYW06IFwiI2Y1ZmZmYVwiLFxuICAgIG1pc3R5cm9zZTogXCIjZmZlNGUxXCIsXG4gICAgbW9jY2FzaW46IFwiI2ZmZTRiNVwiLFxuICAgIG5hdmFqb3doaXRlOiBcIiNmZmRlYWRcIixcbiAgICBuYXZ5OiBcIiMwMDAwODBcIixcbiAgICBvbGRsYWNlOiBcIiNmZGY1ZTZcIixcbiAgICBvbGl2ZTogXCIjODA4MDAwXCIsXG4gICAgb2xpdmVkcmFiOiBcIiM2YjhlMjNcIixcbiAgICBvcmFuZ2U6IFwiI2ZmYTUwMFwiLFxuICAgIG9yYW5nZXJlZDogXCIjZmY0NTAwXCIsXG4gICAgb3JjaGlkOiBcIiNkYTcwZDZcIixcbiAgICBwYWxlZ29sZGVucm9kOiBcIiNlZWU4YWFcIixcbiAgICBwYWxlZ3JlZW46IFwiIzk4ZmI5OFwiLFxuICAgIHBhbGV0dXJxdW9pc2U6IFwiI2FmZWVlZVwiLFxuICAgIHBhbGV2aW9sZXRyZWQ6IFwiI2Q4NzA5M1wiLFxuICAgIHBhcGF5YXdoaXA6IFwiI2ZmZWZkNVwiLFxuICAgIHBlYWNocHVmZjogXCIjZmZkYWI5XCIsXG4gICAgcGVydTogXCIjY2Q4NTNmXCIsXG4gICAgcGluazogXCIjZmZjMGNiXCIsXG4gICAgcGx1bTogXCIjZGRhMGRkXCIsXG4gICAgcG93ZGVyYmx1ZTogXCIjYjBlMGU2XCIsXG4gICAgcHVycGxlOiBcIiM4MDAwODBcIixcbiAgICByZWQ6IFwiI2ZmMDAwMFwiLFxuICAgIHJvc3licm93bjogXCIjYmM4ZjhmXCIsXG4gICAgcm95YWxibHVlOiBcIiM0MTY5ZTFcIixcbiAgICBzYWRkbGVicm93bjogXCIjOGI0NTEzXCIsXG4gICAgc2FsbW9uOiBcIiNmYTgwNzJcIixcbiAgICBzYW5keWJyb3duOiBcIiNmNGE0NjBcIixcbiAgICBzZWFncmVlbjogXCIjMmU4YjU3XCIsXG4gICAgc2Vhc2hlbGw6IFwiI2ZmZjVlZVwiLFxuICAgIHNpZW5uYTogXCIjYTA1MjJkXCIsXG4gICAgc2lsdmVyOiBcIiNjMGMwYzBcIixcbiAgICBza3libHVlOiBcIiM4N2NlZWJcIixcbiAgICBzbGF0ZWJsdWU6IFwiIzZhNWFjZFwiLFxuICAgIHNsYXRlZ3JheTogXCIjNzA4MDkwXCIsXG4gICAgc2xhdGVncmV5OiBcIiM3MDgwOTBcIixcbiAgICBzbm93OiBcIiNmZmZhZmFcIixcbiAgICBzcHJpbmdncmVlbjogXCIjMDBmZjdmXCIsXG4gICAgc3RlZWxibHVlOiBcIiM0NjgyYjRcIixcbiAgICB0YW46IFwiI2QyYjQ4Y1wiLFxuICAgIHRlYWw6IFwiIzAwODA4MFwiLFxuICAgIHRoaXN0bGU6IFwiI2Q4YmZkOFwiLFxuICAgIHRvbWF0bzogXCIjZmY2MzQ3XCIsXG4gICAgdHVycXVvaXNlOiBcIiM0MGUwZDBcIixcbiAgICB2aW9sZXQ6IFwiI2VlODJlZVwiLFxuICAgIHdoZWF0OiBcIiNmNWRlYjNcIixcbiAgICB3aGl0ZTogXCIjZmZmZmZmXCIsXG4gICAgd2hpdGVzbW9rZTogXCIjZjVmNWY1XCIsXG4gICAgeWVsbG93OiBcIiNmZmZmMDBcIixcbiAgICB5ZWxsb3dncmVlbjogXCIjOWFjZDMyXCJcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdldENvbG9yOiBnZXRDb2xvclxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuXG4gICAgZ2V0TnVtYmVyOiBmdW5jdGlvbihwcm9wLCB0LCBkZWYpIHtcbiAgICAgIGlmKHR5cGVvZihwcm9wKSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZW9mKHByb3ApID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHByb3AodCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHByb3AgJiYgcHJvcC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gcHJvcFswXSxcbiAgICAgICAgICBlbmQgPSBwcm9wWzFdO1xuICAgICAgICByZXR1cm4gc3RhcnQgKyAoZW5kIC0gc3RhcnQpICogdDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYocHJvcCAmJiBwcm9wLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcHJvcFtNYXRoLnJvdW5kKHQgKiAocHJvcC5sZW5ndGggLSAxKSldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZjtcbiAgICB9LFxuXG5cbiAgICBnZXRTdHJpbmc6IGZ1bmN0aW9uKHByb3AsIHQsIGRlZikge1xuICAgICAgaWYocHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHR5cGVvZihwcm9wKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodHlwZW9mKHByb3ApID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHByb3AodCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHByb3AgJiYgcHJvcC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHByb3BbTWF0aC5yb3VuZCh0ICogKHByb3AubGVuZ3RoIC0gMSkpXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH0sXG5cbiAgICBnZXRCb29sOiBmdW5jdGlvbihwcm9wLCB0LCBkZWYpIHtcbiAgICAgIGlmKHByb3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0eXBlb2YocHJvcCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gcHJvcCh0KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYocHJvcCAmJiBwcm9wLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcHJvcFtNYXRoLnJvdW5kKHQgKiAocHJvcC5sZW5ndGggLSAxKSldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3A7XG4gICAgfSxcblxuICAgIGdldEFycmF5OiBmdW5jdGlvbihwcm9wLCB0LCBkZWYpIHtcbiAgICAgIC8vIHN0cmluZyB3aWxsIGhhdmUgbGVuZ3RoLCBidXQgaXMgdXNlbGVzc1xuICAgICAgaWYodHlwZW9mKHByb3ApID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBkZWY7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHR5cGVvZihwcm9wKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBwcm9wKHQpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZihwcm9wICYmIChwcm9wLmxlbmd0aCA9PSAyKSAmJiBwcm9wWzBdLmxlbmd0aCAmJiBwcm9wWzFdLmxlbmd0aCkge1xuICAgICAgICAvLyB3ZSBzZWVtIHRvIGhhdmUgYW4gYXJyYXkgb2YgYXJyYXlzXG4gICAgICAgIHZhciBhcnIwID0gcHJvcFswXSxcbiAgICAgICAgICBhcnIxID0gcHJvcFsxXSxcbiAgICAgICAgICBsZW4gPSBNYXRoLm1pbihhcnIwLmxlbmd0aCwgYXJyMS5sZW5ndGgpLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIHZhciB2MCA9IGFycjBbaV0sXG4gICAgICAgICAgICB2MSA9IGFycjFbaV07XG4gICAgICAgICAgcmVzdWx0LnB1c2godjAgKyAodjEgLSB2MCkgKiB0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHByb3AgJiYgcHJvcC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZjtcbiAgICB9LFxuXG4gICAgZ2V0T2JqZWN0OiBmdW5jdGlvbihwcm9wLCB0LCBkZWYpIHtcbiAgICAgIGlmKHByb3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih0eXBlb2YocHJvcCkgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gcHJvcCh0KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYocHJvcCAmJiBwcm9wLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcHJvcFtNYXRoLnJvdW5kKHQgKiAocHJvcC5sZW5ndGggLSAxKSldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3A7XG4gICAgfVxuXG4gIH1cbn07IiwidmFyIE1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbCcpO1xudmFyIFJlbmRlckxpc3QgPSByZXF1aXJlKCcuL3JlbmRlckxpc3QnKTtcblxudmFyIGNvbG9yTGliID0gcmVxdWlyZSgnLi9saWJzL2NvbG9yJykoKTtcbnZhciBzaGFwZUxpc3QgPSByZXF1aXJlKCcuL3NoYXBlTGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNhbnZhc1dyYXBwZXIsIHJlbmRlckNhbGxiYWNrLCBjb21wbGV0ZUNhbGxiYWNrKXtcbiAgdmFyIG1vZGVsID0gbmV3IE1vZGVsKCk7XG4gIHZhciByZW5kZXJMaXN0ID0gbmV3IFJlbmRlckxpc3QoKTtcblxuICBmdW5jdGlvbiBvblJlbmRlcih0KSB7XG4gICAgaWYgKHR5cGVvZiByZW5kZXJDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICByZW5kZXJDYWxsYmFjaygpO1xuICAgIH1cbiAgICByZW5kZXJMaXN0LnJlbmRlcih0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ29tcGxldGUoKSB7XG4gICAgaWYgKHR5cGVvZiBjb21wbGV0ZUNhbGxiYWNrID09PSAnZnVuY3Rpb24nKXtcbiAgICAgIGNvbXBsZXRlQ2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbml0aWFsaXplIHJlbmRlciBsaXN0XG4gIHJlbmRlckxpc3QuaW5pdChtb2RlbC53LCBtb2RlbC5oLCBtb2RlbC5zdHlsZXMsIG1vZGVsLmludGVycG9sYXRpb24pO1xuXG4gIC8vIEFkZCBhbGwgc2hhcGVzIGZyb20gdGhlIHNoYXBlIGxpc3RcbiAgZm9yICh2YXIga2V5IGluIHNoYXBlTGlzdCkge1xuICAgIGlmIChzaGFwZUxpc3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgdmFyIHNoYXBlTmFtZSA9IGtleTtcbiAgICAgIHJlbmRlckxpc3RbJ2FkZCcgKyBzaGFwZU5hbWVbMF0udG9VcHBlckNhc2UoKSArIHNoYXBlTmFtZS5zbGljZSgxKV0gPSAoZnVuY3Rpb24oc2hhcGVOYW1lLCBzaGFwZUxpc3Qpe1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocHJvcHMpe1xuICAgICAgICAgIHJlbmRlckxpc3QuYWRkU2hhcGUoc2hhcGVMaXN0W3NoYXBlTmFtZV0sIHByb3BzKTtcbiAgICAgICAgfVxuICAgICAgfSkoc2hhcGVOYW1lLCBzaGFwZUxpc3QpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgc2NoZWR1bGVyXG4gIG1vZGVsLnNjaGVkdWxlci5pbml0KG9uUmVuZGVyLCBvbkNvbXBsZXRlKTtcbiAgdmFyIGNhbnZhc0VsID0gY2FudmFzV3JhcHBlci5hcHBlbmRDaGlsZChyZW5kZXJMaXN0LmdldENhbnZhcygpKTtcblxuICByZXR1cm4ge1xuICAgIHc6IG1vZGVsLncsXG4gICAgaDogbW9kZWwuaCxcbiAgICBtb2RlbCA6IG1vZGVsLFxuICAgIHJlbmRlckxpc3Q6IHJlbmRlckxpc3QsXG4gICAgc2l6ZTogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgdGhpcy53ID0gbW9kZWwudyA9IHdpZHRoO1xuICAgICAgdGhpcy5oID0gbW9kZWwuaCA9IGhlaWdodDtcbiAgICAgIHJlbmRlckxpc3Quc2l6ZShtb2RlbC53LCBtb2RlbC5oKTtcbiAgICB9LFxuICAgIHN0eWxlcyA6IG1vZGVsLnN0eWxlcyxcbiAgICBwbGF5T25jZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBtb2RlbC5wbGF5T25jZSgpO1xuICAgIH0sXG4gICAgbG9vcDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbW9kZWwubG9vcCgpO1xuICAgIH0sXG4gICAgZ2V0RHVyYXRpb24gOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG1vZGVsLmdldER1cmF0aW9uKCk7XG4gICAgfSxcbiAgICBzZXRGUFM6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIG1vZGVsLnNldEZQUyh2YWx1ZSk7XG4gICAgfSxcbiAgICBzZXREdXJhdGlvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIG1vZGVsLnNldER1cmF0aW9uKHZhbHVlKTtcbiAgICB9LFxuICAgIHNldE1vZGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBtb2RlbC5pbnRlcnBvbGF0aW9uLm1vZGUgPSB2YWx1ZTtcbiAgICB9LFxuICAgIHNldEVhc2luZzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBtb2RlbC5pbnRlcnBvbGF0aW9uLmVhc2luZyA9IHZhbHVlO1xuICAgIH0sXG4gICAgc2V0TWF4Q29sb3JzOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgbW9kZWwubWF4Q29sb3JzID0gdmFsdWU7XG4gICAgfSxcbiAgICBjb2xvcjogY29sb3JMaWIsXG4gICAgY2FudmFzRWwgOiBjYW52YXNFbFxuICB9O1xufTsiLCIvKipcbiAqIEEgc2ltcGxlIG1vZGVsIGZvciB0aGUgQ2FudmFzIHJlbmRlcmVyXG4gKiBAdHlwZSB7e2luaXQsIGxvb3AsIHBsYXlPbmNlLCBzdG9wLCBpc1J1bm5pbmcsIHNldER1cmF0aW9uLCBnZXREdXJhdGlvbiwgc2V0RlBTLCBnZXRGUFN9fCp9XG4gKi9cbnZhciBTY2hlZHVsZXIgPSByZXF1aXJlKCcuL3NjaGVkdWxlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKCk7XG5cbiAgdmFyIHN0eWxlcyA9IHtcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmZmZmZlwiLFxuICAgIGxpbmVXaWR0aDogNSxcbiAgICBzdHJva2VTdHlsZTogXCIjMDAwMDAwXCIsXG4gICAgZmlsbFN0eWxlOiBcIiMwMDAwMDBcIixcbiAgICBsaW5lQ2FwOiBcInJvdW5kXCIsXG4gICAgbGluZUpvaW46IFwibWl0ZXJcIixcbiAgICBsaW5lRGFzaDogW10sXG4gICAgbWl0ZXJMaW1pdDogMTAsXG4gICAgc2hhZG93Q29sb3I6IG51bGwsXG4gICAgc2hhZG93T2Zmc2V0WDogMCxcbiAgICBzaGFkb3dPZmZzZXRZOiAwLFxuICAgIHNoYWRvd0JsdXI6IDAsXG4gICAgZ2xvYmFsQWxwaGE6IDEsXG4gICAgdHJhbnNsYXRpb25YOiAwLFxuICAgIHRyYW5zbGF0aW9uWTogMCxcbiAgICBzaGFrZTogMCxcbiAgICBibGVuZE1vZGU6IFwic291cmNlLW92ZXJcIlxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgaW50ZXJwb2xhdGlvbjoge1xuICAgICAgbW9kZTogXCJib3VuY2VcIixcbiAgICAgIGVhc2luZzogdHJ1ZVxuICAgIH0sXG4gICAgbWF4Q29sb3JzOiAyNTYsXG4gICAgdzogNDAwLFxuICAgIGg6IDQwMCxcbiAgICBjYXB0dXJlOiBmYWxzZSxcbiAgICBzdHlsZXM6IHN0eWxlcyxcbiAgICBzY2hlZHVsZXIgOiBzY2hlZHVsZXIsXG4gICAgcGxheU9uY2UgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzY2hlZHVsZXIucGxheU9uY2UoKTtcbiAgICB9LFxuICAgIGxvb3AgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzY2hlZHVsZXIubG9vcCgpO1xuICAgIH0sXG4gICAgZ2V0RHVyYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNjaGVkdWxlci5nZXREdXJhdGlvbigpO1xuICAgIH0sXG4gICAgc2V0RHVyYXRpb246IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBzY2hlZHVsZXIuc2V0RHVyYXRpb24odmFsdWUpO1xuICAgIH0sXG4gICAgZ2V0RlBTOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzY2hlZHVsZXIuZ2V0RlBTKCk7XG4gICAgfSxcbiAgICBzZXRGUFM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBzY2hlZHVsZXIuc2V0RlBTKHZhbHVlKTtcbiAgICB9LFxuICAgIGdldElzUnVubmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2NoZWR1bGVyLmlzUnVubmluZygpO1xuICAgIH1cbiAgfVxufTsiLCJ2YXIgU2hhcGUgPSByZXF1aXJlKCcuL3NoYXBlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgdmFyIHNoYXBlID0gbmV3IFNoYXBlKCk7XG5cbiAgdmFyIGNhbnZhcyA9IG51bGwsXG4gICAgY29udGV4dCA9IG51bGwsXG4gICAgd2lkdGggPSAwLFxuICAgIGhlaWdodCA9IDAsXG4gICAgbGlzdCA9IFtdLFxuICAgIHN0eWxlcyA9IG51bGw7XG5cbiAgZnVuY3Rpb24gaW5pdCh3LCBoLCBzdHlsZXNWYWx1ZSwgaW50ZXJwb2xhdGlvbikge1xuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgd2lkdGggPSBjYW52YXMud2lkdGggPSB3O1xuICAgIGhlaWdodCA9IGNhbnZhcy5oZWlnaHQgPSBoO1xuICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHN0eWxlcyA9IHN0eWxlc1ZhbHVlO1xuICAgIHNoYXBlLnN0eWxlcyA9IHN0eWxlcztcbiAgICBzaGFwZS5pbnRlcnBvbGF0aW9uID0gaW50ZXJwb2xhdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpemUodywgaCkge1xuICAgIHdpZHRoID0gY2FudmFzLndpZHRoID0gdztcbiAgICBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0ID0gaDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFNoYXBlKG5ld1NoYXBlLCBwcm9wcykge1xuICAgIHZhciBpdGVtID0gc2hhcGUuY3JlYXRlKG5ld1NoYXBlLCBwcm9wcyk7XG4gICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIHJlbmRlcigwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlcih0KSB7XG4gICAgaWYoc3R5bGVzLmJhY2tncm91bmRDb2xvciA9PT0gXCJ0cmFuc3BhcmVudFwiKSB7XG4gICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHN0eWxlcy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdFtpXS5yZW5kZXIoY29udGV4dCwgdCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2FudmFzKCkge1xuICAgIHJldHVybiBjYW52YXM7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDb250ZXh0KCkge1xuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0LFxuICAgIHNpemU6IHNpemUsXG4gICAgZ2V0Q2FudmFzOiBnZXRDYW52YXMsXG4gICAgZ2V0Q29udGV4dDogZ2V0Q29udGV4dCxcbiAgICBhZGRTaGFwZTogYWRkU2hhcGUsXG4gICAgY2xlYXI6IGNsZWFyLFxuICAgIHJlbmRlcjogcmVuZGVyXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gMCxcbiAgICBkdXJhdGlvbiA9IDIsXG4gICAgZnBzID0gMzAsXG4gICAgcnVubmluZyA9IGZhbHNlLFxuICAgIGxvb3BpbmcgPSBmYWxzZSxcbiAgICByZW5kZXJDYWxsYmFjayA9IG51bGwsXG4gICAgY29tcGxldGVDYWxsYmFjayA9IG51bGw7XG5cbiAgZnVuY3Rpb24gaW5pdChvblJlbmRlciwgb25Db21wbGV0ZSkge1xuICAgIHJlbmRlckNhbGxiYWNrID0gb25SZW5kZXI7XG4gICAgY29tcGxldGVDYWxsYmFjayA9IG9uQ29tcGxldGU7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYocnVubmluZykge1xuICAgICAgaWYocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgICAgcmVuZGVyQ2FsbGJhY2sodCk7XG4gICAgICB9XG4gICAgICBhZHZhbmNlKCk7XG4gICAgICBzZXRUaW1lb3V0KG9uVGltZW91dCwgMTAwMCAvIGZwcyk7XG4gICAgfVxuICAgIGVsc2UgaWYoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgY29tcGxldGVDYWxsYmFjaygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkdmFuY2UoKSB7XG4gICAgdmFyIG51bUZyYW1lcyA9IGR1cmF0aW9uICogZnBzLFxuICAgICAgc3BlZWQgPSAxIC8gbnVtRnJhbWVzO1xuICAgIHQgKz0gc3BlZWQ7XG4gICAgaWYoTWF0aC5yb3VuZCh0ICogMTAwMDApIC8gMTAwMDAgPj0gMSkge1xuICAgICAgaWYobG9vcGluZykge1xuICAgICAgICB0IC09IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdCA9IDA7XG4gICAgICAgIHN0b3AoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBsb29wKCkge1xuICAgIGlmKCFydW5uaW5nKSB7XG4gICAgICB0ID0gMDtcbiAgICAgIGxvb3BpbmcgPSB0cnVlO1xuICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICByZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wKCkge1xuICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsb29waW5nID0gZmFsc2U7XG4gICAgdCA9IDA7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5T25jZSgpIHtcbiAgICBpZighcnVubmluZykge1xuICAgICAgdCA9IDA7XG4gICAgICBsb29waW5nID0gZmFsc2U7XG4gICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgIHJlbmRlcigpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzUnVubmluZygpIHtcbiAgICByZXR1cm4gcnVubmluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldER1cmF0aW9uKHZhbHVlKSB7XG4gICAgZHVyYXRpb24gPSB2YWx1ZTtcbiAgICByZXR1cm4gZHVyYXRpb247XG4gIH1cblxuICBmdW5jdGlvbiBnZXREdXJhdGlvbigpIHtcbiAgICByZXR1cm4gZHVyYXRpb247XG4gIH1cblxuICBmdW5jdGlvbiBzZXRGUFModmFsdWUpIHtcbiAgICBmcHMgPSB2YWx1ZTtcbiAgICByZXR1cm4gZnBzO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RlBTKCkge1xuICAgIHJldHVybiBmcHM7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXQsXG4gICAgbG9vcDogbG9vcCxcbiAgICBwbGF5T25jZTogcGxheU9uY2UsXG4gICAgc3RvcDogc3RvcCxcbiAgICBpc1J1bm5pbmc6IGlzUnVubmluZyxcbiAgICBzZXREdXJhdGlvbjogc2V0RHVyYXRpb24sXG4gICAgZ2V0RHVyYXRpb246IGdldER1cmF0aW9uLFxuICAgIHNldEZQUzogc2V0RlBTLFxuICAgIGdldEZQUzogZ2V0RlBTXG4gIH07XG59OyIsIi8qKlxuICogU2hhcGUgcHJvdG90eXBlIG9iamVjdFxuICogQHR5cGUge3tnZXROdW1iZXIsIGdldFN0cmluZywgZ2V0Qm9vbCwgZ2V0QXJyYXksIGdldE9iamVjdH18Kn1cbiAqL1xudmFyIHZhbHVlUGFyc2VyID0gcmVxdWlyZSgnLi9saWJzL3ZhbHVlUGFyc2VyJykoKTtcbnZhciBjb2xvclBhcnNlciA9IHJlcXVpcmUoJy4vbGlicy9jb2xvclBhcnNlcicpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgcmV0dXJuIHtcbiAgICBzdHlsZXM6IG51bGwsXG4gICAgaW50ZXJwb2xhdGlvbjogbnVsbCxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24gKHR5cGUsIHByb3BzKSB7XG4gICAgICB2YXIgb2JqID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgICAgIG9iai5pbml0KHR5cGUsIHByb3BzIHx8IHt9KTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICh0eXBlLCBwcm9wcykge1xuICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgZm9yKHZhciBwcm9wIGluIHByb3BzKSB7XG4gICAgICAgIHZhciBwID0gcHJvcHNbcHJvcF07XG4gICAgICAgIGlmKHR5cGVvZiBwID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBwcm9wc1twcm9wXSA9IHAuYmluZChwcm9wcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhdyA9IHR5cGUuZHJhdztcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoY29udGV4dCwgdGltZSkge1xuICAgICAgdmFyIHQgPSB0aGlzLmludGVycG9sYXRlKHRpbWUpO1xuXG4gICAgICB0aGlzLnN0YXJ0RHJhdyhjb250ZXh0LCB0KTtcbiAgICAgIHRoaXMuZHJhdyhjb250ZXh0LCB0KTtcbiAgICAgIHRoaXMuZW5kRHJhdyhjb250ZXh0LCB0KTtcbiAgICB9LFxuXG4gICAgaW50ZXJwb2xhdGU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB0ICo9IHRoaXMucHJvcHMuc3BlZWRNdWx0IHx8IDE7XG4gICAgICB0ICs9IHRoaXMucHJvcHMucGhhc2UgfHwgMDtcblxuICAgICAgc3dpdGNoICh0aGlzLmludGVycG9sYXRpb24ubW9kZSkge1xuICAgICAgICBjYXNlIFwiYm91bmNlXCI6XG4gICAgICAgICAgaWYgKHRoaXMuaW50ZXJwb2xhdGlvbi5lYXNpbmcpIHtcbiAgICAgICAgICAgIHZhciBhID0gdCAqIE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAtIE1hdGguY29zKGEpICogMC41O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHQgPSB0ICUgMTtcbiAgICAgICAgICAgIHJldHVybiB0IDwgMC41ID8gdCAqIDIgOiB0ID0gKDEgLSB0KSAqIDI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJzaW5nbGVcIjpcbiAgICAgICAgICBpZiAodCA+IDEpIHtcbiAgICAgICAgICAgIHQgJT0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuaW50ZXJwb2xhdGlvbi5lYXNpbmcpIHtcbiAgICAgICAgICAgIHZhciBhID0gdCAqIE1hdGguUEk7XG4gICAgICAgICAgICByZXR1cm4gMC41IC0gTWF0aC5jb3MoYSkgKiAwLjU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIHN0YXJ0RHJhdzogZnVuY3Rpb24gKGNvbnRleHQsIHQpIHtcbiAgICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSB0aGlzLmdldE51bWJlcihcImxpbmVXaWR0aFwiLCB0LCB0aGlzLnN0eWxlcy5saW5lV2lkdGgpO1xuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHRoaXMuZ2V0Q29sb3IoXCJzdHJva2VTdHlsZVwiLCB0LCB0aGlzLnN0eWxlcy5zdHJva2VTdHlsZSk7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ2V0Q29sb3IoXCJmaWxsU3R5bGVcIiwgdCwgdGhpcy5zdHlsZXMuZmlsbFN0eWxlKTtcbiAgICAgIGNvbnRleHQubGluZUNhcCA9IHRoaXMuZ2V0U3RyaW5nKFwibGluZUNhcFwiLCB0LCB0aGlzLnN0eWxlcy5saW5lQ2FwKTtcbiAgICAgIGNvbnRleHQubGluZUpvaW4gPSB0aGlzLmdldFN0cmluZyhcImxpbmVKb2luXCIsIHQsIHRoaXMuc3R5bGVzLmxpbmVKb2luKTtcbiAgICAgIGNvbnRleHQubWl0ZXJMaW1pdCA9IHRoaXMuZ2V0U3RyaW5nKFwibWl0ZXJMaW1pdFwiLCB0LCB0aGlzLnN0eWxlcy5taXRlckxpbWl0KTtcbiAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLmdldE51bWJlcihcImdsb2JhbEFscGhhXCIsIHQsIHRoaXMuc3R5bGVzLmdsb2JhbEFscGhhKTtcbiAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMuZ2V0TnVtYmVyKFwidHJhbnNsYXRpb25YXCIsIHQsIHRoaXMuc3R5bGVzLnRyYW5zbGF0aW9uWCksIHRoaXMuZ2V0TnVtYmVyKFwidHJhbnNsYXRpb25ZXCIsIHQsIHRoaXMuc3R5bGVzLnRyYW5zbGF0aW9uWSkpO1xuICAgICAgY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSB0aGlzLmdldFN0cmluZyhcImJsZW5kTW9kZVwiLCB0LCB0aGlzLnN0eWxlcy5ibGVuZE1vZGUpO1xuICAgICAgdmFyIHNoYWtlID0gdGhpcy5nZXROdW1iZXIoXCJzaGFrZVwiLCB0LCB0aGlzLnN0eWxlcy5zaGFrZSk7XG4gICAgICBjb250ZXh0LnRyYW5zbGF0ZShNYXRoLnJhbmRvbSgpICogc2hha2UgLSBzaGFrZSAvIDIsIE1hdGgucmFuZG9tKCkgKiBzaGFrZSAtIHNoYWtlIC8gMik7XG5cbiAgICAgIHZhciBsaW5lRGFzaCA9IHRoaXMuZ2V0QXJyYXkoXCJsaW5lRGFzaFwiLCB0LCB0aGlzLnN0eWxlcy5saW5lRGFzaCk7XG4gICAgICBpZiAobGluZURhc2gpIHtcbiAgICAgICAgY29udGV4dC5zZXRMaW5lRGFzaChsaW5lRGFzaCk7XG4gICAgICB9XG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIH0sXG5cbiAgICBkcmF3RmlsbEFuZFN0cm9rZTogZnVuY3Rpb24gKGNvbnRleHQsIHQsIGRvRmlsbCwgZG9TdHJva2UpIHtcbiAgICAgIHZhciBmaWxsID0gdGhpcy5nZXRCb29sKFwiZmlsbFwiLCB0LCBkb0ZpbGwpLFxuICAgICAgICBzdHJva2UgPSB0aGlzLmdldEJvb2woXCJzdHJva2VcIiwgdCwgZG9TdHJva2UpO1xuXG4gICAgICBjb250ZXh0LnNhdmUoKTtcbiAgICAgIGlmIChmaWxsKSB7XG4gICAgICAgIHRoaXMuc2V0U2hhZG93UGFyYW1zKGNvbnRleHQsIHQpO1xuICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xuICAgICAgaWYgKHN0cm9rZSkge1xuICAgICAgICBpZiAoIWZpbGwpIHtcbiAgICAgICAgICB0aGlzLnNldFNoYWRvd1BhcmFtcyhjb250ZXh0LCB0KTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRTaGFkb3dQYXJhbXM6IGZ1bmN0aW9uIChjb250ZXh0LCB0KSB7XG4gICAgICBjb250ZXh0LnNoYWRvd0NvbG9yID0gdGhpcy5nZXRDb2xvcihcInNoYWRvd0NvbG9yXCIsIHQsIHRoaXMuc3R5bGVzLnNoYWRvd0NvbG9yKTtcbiAgICAgIGNvbnRleHQuc2hhZG93T2Zmc2V0WCA9IHRoaXMuZ2V0TnVtYmVyKFwic2hhZG93T2Zmc2V0WFwiLCB0LCB0aGlzLnN0eWxlcy5zaGFkb3dPZmZzZXRYKTtcbiAgICAgIGNvbnRleHQuc2hhZG93T2Zmc2V0WSA9IHRoaXMuZ2V0TnVtYmVyKFwic2hhZG93T2Zmc2V0WVwiLCB0LCB0aGlzLnN0eWxlcy5zaGFkb3dPZmZzZXRZKTtcbiAgICAgIGNvbnRleHQuc2hhZG93Qmx1ciA9IHRoaXMuZ2V0TnVtYmVyKFwic2hhZG93Qmx1clwiLCB0LCB0aGlzLnN0eWxlcy5zaGFkb3dCbHVyKTtcbiAgICB9LFxuXG4gICAgZW5kRHJhdzogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xuICAgIH0sXG5cbiAgICBnZXROdW1iZXI6IGZ1bmN0aW9uIChwcm9wLCB0LCBkZWYpIHtcbiAgICAgIHJldHVybiB2YWx1ZVBhcnNlci5nZXROdW1iZXIodGhpcy5wcm9wc1twcm9wXSwgdCwgZGVmKTtcbiAgICB9LFxuXG4gICAgZ2V0Q29sb3I6IGZ1bmN0aW9uIChwcm9wLCB0LCBkZWYpIHtcbiAgICAgIHJldHVybiBjb2xvclBhcnNlci5nZXRDb2xvcih0aGlzLnByb3BzW3Byb3BdLCB0LCBkZWYpO1xuICAgIH0sXG5cbiAgICBnZXRTdHJpbmc6IGZ1bmN0aW9uIChwcm9wLCB0LCBkZWYpIHtcbiAgICAgIHJldHVybiB2YWx1ZVBhcnNlci5nZXRTdHJpbmcodGhpcy5wcm9wc1twcm9wXSwgdCwgZGVmKTtcbiAgICB9LFxuXG4gICAgZ2V0Qm9vbDogZnVuY3Rpb24gKHByb3AsIHQsIGRlZikge1xuICAgICAgcmV0dXJuIHZhbHVlUGFyc2VyLmdldEJvb2wodGhpcy5wcm9wc1twcm9wXSwgdCwgZGVmKTtcbiAgICB9LFxuXG4gICAgZ2V0QXJyYXk6IGZ1bmN0aW9uIChwcm9wLCB0LCBkZWYpIHtcbiAgICAgIHJldHVybiB2YWx1ZVBhcnNlci5nZXRBcnJheSh0aGlzLnByb3BzW3Byb3BdLCB0LCBkZWYpO1xuICAgIH0sXG5cbiAgICBnZXRPYmplY3Q6IGZ1bmN0aW9uIChwcm9wLCB0LCBkZWYpIHtcbiAgICAgIHJldHVybiB2YWx1ZVBhcnNlci5nZXRPYmplY3QodGhpcy5wcm9wc1twcm9wXSwgdCwgZGVmKTtcbiAgICB9LFxuXG4gICAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uIChwcm9wLCB0LCBkZWYpIHtcbiAgICAgIHJldHVybiB2YWx1ZVBhcnNlci5nZXRQb3NpdGlvbih0aGlzLnByb3BzW3Byb3BdLCB0LCBkZWYpO1xuICAgIH1cbiAgfVxufTtcbiIsIi8qKlxuICogSW5jbHVkZSBhbGwgZGVmYXVsdCBzaGFwZXNcbiAqIEB0eXBlIHt7ZHJhd318Kn1cbiAqL1xudmFyIGNpcmNsZSAgICAgICAgICA9IHJlcXVpcmUoJy4vc2hhcGVzL2NpcmNsZScpKCk7XG52YXIgaGVhcnQgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvaGVhcnQnKSgpO1xudmFyIGFycm93ICAgICAgICAgICA9IHJlcXVpcmUoJy4vc2hhcGVzL2Fycm93JykoKTtcbnZhciBhcmNTZWdtZW50ICAgICAgPSByZXF1aXJlKCcuL3NoYXBlcy9hcmNTZWdtZW50JykoKTtcbnZhciBiZXppZXJDdXJ2ZSAgICAgPSByZXF1aXJlKCcuL3NoYXBlcy9iZXppZXJDdXJ2ZScpKCk7XG52YXIgYmV6aWVyU2VnbWVudCAgID0gcmVxdWlyZSgnLi9zaGFwZXMvYmV6aWVyU2VnbWVudCcpKCk7XG52YXIgY3ViZSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvY3ViZScpKCk7XG52YXIgY3VydmUgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvY3VydmUnKSgpO1xudmFyIGN1cnZlU2VnbWVudCAgICA9IHJlcXVpcmUoJy4vc2hhcGVzL2N1cnZlU2VnbWVudCcpKCk7XG52YXIgZ2VhciAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvZ2VhcicpKCk7XG52YXIgbGluZSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvbGluZScpKCk7XG52YXIgb3ZhbCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvb3ZhbCcpKCk7XG52YXIgcGF0aCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvcGF0aCcpKCk7XG52YXIgcG9seSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvcG9seScpKCk7XG52YXIgcmF5U2VnbWVudCAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvcmF5U2VnbWVudCcpKCk7XG52YXIgcmVjdCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvcmVjdCcpKCk7XG52YXIgc2VnbWVudCAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvc2VnbWVudCcpKCk7XG52YXIgc3BpcmFsICAgICAgICAgID0gcmVxdWlyZSgnLi9zaGFwZXMvc3BpcmFsJykoKTtcbnZhciBzdGFyICAgICAgICAgICAgPSByZXF1aXJlKCcuL3NoYXBlcy9zdGFyJykoKTtcbnZhciB0ZXh0ICAgICAgICAgICAgPSByZXF1aXJlKCcuL3NoYXBlcy90ZXh0JykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNpcmNsZSA6IGNpcmNsZSxcbiAgYXJyb3cgOiBhcnJvdyxcbiAgYXJjU2VnbWVudDogYXJjU2VnbWVudCxcbiAgYmV6aWVyQ3VydmUgOiBiZXppZXJDdXJ2ZSxcbiAgYmV6aWVyU2VnbWVudCA6IGJlemllclNlZ21lbnQsXG4gIGN1YmUgOiBjdWJlLFxuICBjdXJ2ZSA6IGN1cnZlLFxuICBjdXJ2ZVNlZ21lbnQgOiBjdXJ2ZVNlZ21lbnQsXG4gIGdlYXIgOiBnZWFyLFxuICBsaW5lIDogbGluZSxcbiAgb3ZhbCA6IG92YWwsXG4gIHBhdGg6IHBhdGgsXG4gIHBvbHkgOiBwb2x5LFxuICByYXlTZWdtZW50IDogcmF5U2VnbWVudCxcbiAgcmVjdCA6IHJlY3QsXG4gIHNlZ21lbnQgOiBzZWdtZW50LFxuICBzcGlyYWwgOiBzcGlyYWwsXG4gIHN0YXIgOiBzdGFyLFxuICB0ZXh0IDogdGV4dCxcbiAgaGVhcnQgOiBoZWFydFxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuXHRcdFx0XHRyYWRpdXMgPSB0aGlzLmdldE51bWJlcihcInJhZGl1c1wiLCB0LCA1MCksXG5cdFx0XHRcdHN0YXJ0QW5nbGUgPSB0aGlzLmdldE51bWJlcihcInN0YXJ0QW5nbGVcIiwgdCwgMCksXG5cdFx0XHRcdGVuZEFuZ2xlID0gdGhpcy5nZXROdW1iZXIoXCJlbmRBbmdsZVwiLCB0LCAzNjApO1xuXG5cdFx0XHRpZihzdGFydEFuZ2xlID4gZW5kQW5nbGUpIHtcblx0XHRcdFx0dmFyIHRlbXAgPSBzdGFydEFuZ2xlO1xuXHRcdFx0XHRzdGFydEFuZ2xlID0gZW5kQW5nbGU7XG5cdFx0XHRcdGVuZEFuZ2xlID0gdGVtcDtcblx0XHRcdH1cblx0XHRcdHZhciBhcmMgPSB0aGlzLmdldE51bWJlcihcImFyY1wiLCB0LCAyMCksXG5cdFx0XHRcdHN0YXJ0ID0gc3RhcnRBbmdsZSAtIDEsXG5cdFx0XHRcdGVuZCA9IHN0YXJ0QW5nbGUgKyB0ICogKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSArIGFyYyk7XG5cblx0XHRcdGlmKGVuZCA+IHN0YXJ0QW5nbGUgKyBhcmMpIHtcblx0XHRcdFx0c3RhcnQgPSBlbmQgLSBhcmM7XG5cdFx0XHR9XG5cdFx0XHRpZihlbmQgPiBlbmRBbmdsZSkge1xuXHRcdFx0XHRlbmQgPSBlbmRBbmdsZSArIDE7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuXHRcdFx0Y29udGV4dC5yb3RhdGUodGhpcy5nZXROdW1iZXIoXCJyb3RhdGlvblwiLCB0LCAwKSAqIE1hdGguUEkgLyAxODApO1xuXHRcdFx0Y29udGV4dC5hcmMoMCwgMCwgcmFkaXVzLCBzdGFydCAqIE1hdGguUEkgLyAxODAsIGVuZCAqIE1hdGguUEkgLyAxODApO1xuXG5cdFx0XHR0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIGZhbHNlLCB0cnVlKTtcdFx0XG5cdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdGRyYXc6IGZ1bmN0aW9uKGNvbnRleHQsIHQpIHtcblx0XHRcdHZhciB4ID0gdGhpcy5nZXROdW1iZXIoXCJ4XCIsIHQsIDEwMCksXG5cdFx0XHRcdHkgPSB0aGlzLmdldE51bWJlcihcInlcIiwgdCwgMTAwKSxcblx0XHRcdFx0dyA9IHRoaXMuZ2V0TnVtYmVyKFwid1wiLCB0LCAxMDApLFxuXHRcdFx0XHRoID0gdGhpcy5nZXROdW1iZXIoXCJoXCIsIHQsIDEwMCksXG5cdFx0XHRcdHBvaW50UGVyY2VudCA9IHRoaXMuZ2V0TnVtYmVyKFwicG9pbnRQZXJjZW50XCIsIHQsIDAuNSksXG5cdFx0XHRcdHNoYWZ0UGVyY2VudCA9IHRoaXMuZ2V0TnVtYmVyKFwic2hhZnRQZXJjZW50XCIsIHQsIDAuNSk7XG5cdFx0XHRcdFxuXHRcdFx0Y29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG5cdFx0XHRjb250ZXh0LnJvdGF0ZSh0aGlzLmdldE51bWJlcihcInJvdGF0aW9uXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCk7XG5cblx0XHRcdC8vIGNvbnRleHQudHJhbnNsYXRlKC13IC8gMiwgMCk7XG5cblx0XHRcdGNvbnRleHQubW92ZVRvKC13IC8gMiwgLWggKiBzaGFmdFBlcmNlbnQgKiAwLjUpO1xuXHRcdFx0Y29udGV4dC5saW5lVG8odyAvIDIgLSB3ICogcG9pbnRQZXJjZW50LCAtaCAqIHNoYWZ0UGVyY2VudCAqIDAuNSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyh3IC8gMiAtIHcgKiBwb2ludFBlcmNlbnQsIC1oICogMC41KTtcblx0XHRcdGNvbnRleHQubGluZVRvKHcgLyAyLCAwKTtcblx0XHRcdGNvbnRleHQubGluZVRvKHcgLyAyIC0gdyAqIHBvaW50UGVyY2VudCwgaCAqIDAuNSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyh3IC8gMiAtIHcgKiBwb2ludFBlcmNlbnQsIGggKiBzaGFmdFBlcmNlbnQgKiAwLjUpO1xuXHRcdFx0Y29udGV4dC5saW5lVG8oLXcgLyAyLCBoICogc2hhZnRQZXJjZW50ICogMC41KTtcblx0XHRcdGNvbnRleHQubGluZVRvKC13IC8gMiwgLWggKiBzaGFmdFBlcmNlbnQgKiAwLjUpO1xuXG5cdFx0XHR0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIHRydWUsIGZhbHNlKTtcblx0XHR9XG5cdH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHgwID0gdGhpcy5nZXROdW1iZXIoXCJ4MFwiLCB0LCA1MCksXG5cdFx0XHRcdHkwID0gdGhpcy5nZXROdW1iZXIoXCJ5MFwiLCB0LCAxMCksXG5cdFx0XHRcdHgxID0gdGhpcy5nZXROdW1iZXIoXCJ4MVwiLCB0LCAyMDApLFxuXHRcdFx0XHR5MSA9IHRoaXMuZ2V0TnVtYmVyKFwieTFcIiwgdCwgMTAwKSxcblx0XHRcdFx0eDIgPSB0aGlzLmdldE51bWJlcihcIngyXCIsIHQsIDApLFxuXHRcdFx0XHR5MiA9IHRoaXMuZ2V0TnVtYmVyKFwieTJcIiwgdCwgMTAwKSxcblx0XHRcdFx0eDMgPSB0aGlzLmdldE51bWJlcihcIngzXCIsIHQsIDE1MCksXG5cdFx0XHRcdHkzID0gdGhpcy5nZXROdW1iZXIoXCJ5M1wiLCB0LCAxMCk7XG5cblx0XHQgICAgY29udGV4dC5tb3ZlVG8oeDAsIHkwKTtcblx0XHQgICAgY29udGV4dC5iZXppZXJDdXJ2ZVRvKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpO1xuXG5cdFx0XHR0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIGZhbHNlLCB0cnVlKTtcdFxuXHRcdH1cblx0fVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuXHRmdW5jdGlvbiBiZXppZXIodCwgdjAsIHYxLCB2MiwgdjMpIHtcblx0XHRyZXR1cm4gKDEgLSB0KSAqICgxIC0gdCkgKiAoMSAtIHQpICogdjAgKyAzICogKDEgLSB0KSAqICgxIC0gdCkgKiB0ICogdjEgKyAzICogKDEgLSB0KSAqIHQgKiB0ICogdjIgKyB0ICogdCAqIHQgKiB2Mztcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHgwID0gdGhpcy5nZXROdW1iZXIoXCJ4MFwiLCB0LCA1MCksXG5cdFx0XHRcdHkwID0gdGhpcy5nZXROdW1iZXIoXCJ5MFwiLCB0LCAxMCksXG5cdFx0XHRcdHgxID0gdGhpcy5nZXROdW1iZXIoXCJ4MVwiLCB0LCAyMDApLFxuXHRcdFx0XHR5MSA9IHRoaXMuZ2V0TnVtYmVyKFwieTFcIiwgdCwgMTAwKSxcblx0XHRcdFx0eDIgPSB0aGlzLmdldE51bWJlcihcIngyXCIsIHQsIDApLFxuXHRcdFx0XHR5MiA9IHRoaXMuZ2V0TnVtYmVyKFwieTJcIiwgdCwgMTAwKSxcblx0XHRcdFx0eDMgPSB0aGlzLmdldE51bWJlcihcIngzXCIsIHQsIDE1MCksXG5cdFx0XHRcdHkzID0gdGhpcy5nZXROdW1iZXIoXCJ5M1wiLCB0LCAxMCksXG5cdFx0XHRcdHBlcmNlbnQgPSB0aGlzLmdldE51bWJlcihcInBlcmNlbnRcIiwgdCwgMC4xKSxcblx0XHRcdFx0dDEgPSB0ICogKDEgKyBwZXJjZW50KSxcblx0XHRcdFx0dDAgPSB0MSAtIHBlcmNlbnQsXG5cdFx0XHRcdHJlcyA9IDAuMDEsXG5cdFx0XHRcdHgsXG5cdFx0XHRcdHk7XG5cblx0XHRcdHQxID0gTWF0aC5taW4odDEsIDEuMDAxKTtcblx0XHRcdHQwID0gTWF0aC5tYXgodDAsIC0wLjAwMSk7XG5cblx0XHRcdGZvcih2YXIgaSA9IHQwOyBpIDwgdDE7IGkgKz0gcmVzKSB7XG5cdFx0XHRcdHggPSBiZXppZXIoaSwgeDAsIHgxLCB4MiwgeDMpO1xuXHRcdFx0XHR5ID0gYmV6aWVyKGksIHkwLCB5MSwgeTIsIHkzKTtcblx0XHRcdFx0aWYoaSA9PT0gdDApIHtcblx0XHRcdFx0ICAgIGNvbnRleHQubW92ZVRvKHgsIHkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdCAgICBcdFx0Y29udGV4dC5saW5lVG8oeCwgeSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHggPSBiZXppZXIodDEsIHgwLCB4MSwgeDIsIHgzKTtcblx0XHRcdHkgPSBiZXppZXIodDEsIHkwLCB5MSwgeTIsIHkzKTtcblx0ICAgXHRcdGNvbnRleHQubGluZVRvKHgsIHkpO1xuXG5cdFx0XHR0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIGZhbHNlLCB0cnVlKTtcblx0XHR9XG5cdH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuICAgICAgdmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcbiAgICAgICAgeSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuICAgICAgICByYWRpdXMgPSB0aGlzLmdldE51bWJlcihcInJhZGl1c1wiLCB0LCA1MCksXG4gICAgICAgIHN0YXJ0QW5nbGUgPSB0aGlzLmdldE51bWJlcihcInN0YXJ0QW5nbGVcIiwgdCwgMCksXG4gICAgICAgIGVuZEFuZ2xlID0gdGhpcy5nZXROdW1iZXIoXCJlbmRBbmdsZVwiLCB0LCAzNjApLFxuICAgICAgICBkcmF3RnJvbUNlbnRlciA9IHRoaXMuZ2V0Qm9vbChcImRyYXdGcm9tQ2VudGVyXCIsIHQsIGZhbHNlKTtcblxuICAgICAgY29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG4gICAgICBjb250ZXh0LnJvdGF0ZSh0aGlzLmdldE51bWJlcihcInJvdGF0aW9uXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICBpZihkcmF3RnJvbUNlbnRlcikge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbygwLCAwKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHJhZGl1cywgc3RhcnRBbmdsZSAqIE1hdGguUEkgLyAxODAsIGVuZEFuZ2xlICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICBpZihkcmF3RnJvbUNlbnRlcikge1xuICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIHRydWUsIGZhbHNlKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuXHRcdFx0XHR6ID0gdGhpcy5nZXROdW1iZXIoXCJ6XCIsIHQsIDApLFxuXHRcdFx0XHRzaXplID0gdGhpcy5nZXROdW1iZXIoXCJzaXplXCIsIHQsIDEwMCksXG5cdFx0XHRcdHJvdGF0aW9uWCA9IHRoaXMuZ2V0TnVtYmVyKFwicm90YXRpb25YXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCxcblx0XHRcdFx0cm90YXRpb25ZID0gdGhpcy5nZXROdW1iZXIoXCJyb3RhdGlvbllcIiwgdCwgMCkgKiBNYXRoLlBJIC8gMTgwLFxuXHRcdFx0XHRyb3RhdGlvblogPSB0aGlzLmdldE51bWJlcihcInJvdGF0aW9uWlwiLCB0LCAwKSAqIE1hdGguUEkgLyAxODA7XG5cblx0XHRcdHZhciBwb2ludHMgPSBtYWtlUG9pbnRzKCk7XG5cdFx0XHRzY2FsZShwb2ludHMsIHNpemUgLyAyKTtcblx0XHRcdHJvdGF0ZVgocG9pbnRzLCByb3RhdGlvblgpO1xuXHRcdFx0cm90YXRlWShwb2ludHMsIHJvdGF0aW9uWSk7XG5cdFx0XHRyb3RhdGVaKHBvaW50cywgcm90YXRpb25aKTtcblx0XHRcdHByb2plY3QocG9pbnRzLCB6KTtcblxuXHRcdFx0Y29udGV4dC5saW5lSm9pbiA9IHRoaXMuZ2V0U3RyaW5nKFwibGluZUpvaW5cIiwgdCwgXCJyb3VuZFwiKTtcblx0XHRcdGNvbnRleHQubGluZVdpZHRoID0gdGhpcy5nZXROdW1iZXIoXCJsaW5lV2lkdGhcIiwgdCwgMSk7XG5cblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuXG5cdFx0XHRjb250ZXh0Lm1vdmVUbyhwb2ludHNbMF0uc3gsIHBvaW50c1swXS5zeSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyhwb2ludHNbMV0uc3gsIHBvaW50c1sxXS5zeSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyhwb2ludHNbMl0uc3gsIHBvaW50c1syXS5zeSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyhwb2ludHNbM10uc3gsIHBvaW50c1szXS5zeSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyhwb2ludHNbMF0uc3gsIHBvaW50c1swXS5zeSk7XG5cblx0XHRcdGNvbnRleHQubW92ZVRvKHBvaW50c1s0XS5zeCwgcG9pbnRzWzRdLnN5KTtcblx0XHRcdGNvbnRleHQubGluZVRvKHBvaW50c1s1XS5zeCwgcG9pbnRzWzVdLnN5KTtcblx0XHRcdGNvbnRleHQubGluZVRvKHBvaW50c1s2XS5zeCwgcG9pbnRzWzZdLnN5KTtcblx0XHRcdGNvbnRleHQubGluZVRvKHBvaW50c1s3XS5zeCwgcG9pbnRzWzddLnN5KTtcblx0XHRcdGNvbnRleHQubGluZVRvKHBvaW50c1s0XS5zeCwgcG9pbnRzWzRdLnN5KTtcblxuXHRcdFx0Y29udGV4dC5tb3ZlVG8ocG9pbnRzWzBdLnN4LCBwb2ludHNbMF0uc3kpO1xuXHRcdFx0Y29udGV4dC5saW5lVG8ocG9pbnRzWzRdLnN4LCBwb2ludHNbNF0uc3kpO1xuXG5cdFx0XHRjb250ZXh0Lm1vdmVUbyhwb2ludHNbMV0uc3gsIHBvaW50c1sxXS5zeSk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyhwb2ludHNbNV0uc3gsIHBvaW50c1s1XS5zeSk7XG5cblx0XHRcdGNvbnRleHQubW92ZVRvKHBvaW50c1syXS5zeCwgcG9pbnRzWzJdLnN5KTtcblx0XHRcdGNvbnRleHQubGluZVRvKHBvaW50c1s2XS5zeCwgcG9pbnRzWzZdLnN5KTtcblxuXHRcdFx0Y29udGV4dC5tb3ZlVG8ocG9pbnRzWzNdLnN4LCBwb2ludHNbM10uc3kpO1xuXHRcdFx0Y29udGV4dC5saW5lVG8ocG9pbnRzWzddLnN4LCBwb2ludHNbN10uc3kpO1xuXG5cdFx0XHR0aGlzLnNldFNoYWRvd1BhcmFtcyhjb250ZXh0LCB0KTtcblx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XHRcdFxuXHRcdH1cblx0fVxuXHRcblx0ZnVuY3Rpb24gc2NhbGUocG9pbnRzLCBzaXplKSB7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHAgPSBwb2ludHNbaV07XG5cdFx0XHRwLnggKj0gc2l6ZTtcblx0XHRcdHAueSAqPSBzaXplO1xuXHRcdFx0cC56ICo9IHNpemU7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcm90YXRlWChwb2ludHMsIGFuZ2xlKSB7XG5cdFx0dmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSxcblx0XHRcdHNpbiA9IE1hdGguc2luKGFuZ2xlKTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcCA9IHBvaW50c1tpXSxcblx0XHRcdFx0eSA9IHAueSAqIGNvcyAtIHAueiAqIHNpbixcblx0XHRcdFx0eiA9IHAueiAqIGNvcyArIHAueSAqIHNpbjtcblx0XHRcdHAueSA9IHk7XG5cdFx0XHRwLnogPSB6O1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJvdGF0ZVkocG9pbnRzLCBhbmdsZSkge1xuXHRcdHZhciBjb3MgPSBNYXRoLmNvcyhhbmdsZSksXG5cdFx0XHRzaW4gPSBNYXRoLnNpbihhbmdsZSk7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHAgPSBwb2ludHNbaV0sXG5cdFx0XHRcdHggPSBwLnggKiBjb3MgLSBwLnogKiBzaW4sXG5cdFx0XHRcdHogPSBwLnogKiBjb3MgKyBwLnggKiBzaW47XG5cdFx0XHRwLnggPSB4O1xuXHRcdFx0cC56ID0gejtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByb3RhdGVaKHBvaW50cywgYW5nbGUpIHtcblx0XHR2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpLFxuXHRcdFx0c2luID0gTWF0aC5zaW4oYW5nbGUpO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwID0gcG9pbnRzW2ldLFxuXHRcdFx0XHR4ID0gcC54ICogY29zIC0gcC55ICogc2luLFxuXHRcdFx0XHR5ID0gcC55ICogY29zICsgcC54ICogc2luO1xuXHRcdFx0cC54ID0geDtcblx0XHRcdHAueSA9IHk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcHJvamVjdChwb2ludHMsIHopIHtcblx0XHR2YXIgZmwgPSAzMDA7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHAgPSBwb2ludHNbaV0sXG5cdFx0XHRcdHNjYWxlID0gZmwgLyAoZmwgKyBwLnogKyB6KTtcblx0XHRcdHAuc3ggPSBwLnggKiBzY2FsZTtcblx0XHRcdHAuc3kgPSBwLnkgKiBzY2FsZTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBtYWtlUG9pbnRzKCkge1xuXHRcdHJldHVybiBbXG5cdFx0XHR7XG5cdFx0XHRcdHg6IC0xLFxuXHRcdFx0XHR5OiAtMSxcblx0XHRcdFx0ejogLTFcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHg6IDEsXG5cdFx0XHRcdHk6IC0xLFxuXHRcdFx0XHR6OiAtMVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0eDogMSxcblx0XHRcdFx0eTogMSxcblx0XHRcdFx0ejogLTFcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHg6IC0xLFxuXHRcdFx0XHR5OiAxLFxuXHRcdFx0XHR6OiAtMVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0eDogLTEsXG5cdFx0XHRcdHk6IC0xLFxuXHRcdFx0XHR6OiAxXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHR4OiAxLFxuXHRcdFx0XHR5OiAtMSxcblx0XHRcdFx0ejogMVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0eDogMSxcblx0XHRcdFx0eTogMSxcblx0XHRcdFx0ejogMVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0eDogLTEsXG5cdFx0XHRcdHk6IDEsXG5cdFx0XHRcdHo6IDFcblx0XHRcdH1cblx0XHRdO1xuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHgwID0gdGhpcy5nZXROdW1iZXIoXCJ4MFwiLCB0LCAyMCksXG5cdFx0XHRcdHkwID0gdGhpcy5nZXROdW1iZXIoXCJ5MFwiLCB0LCAxMCksXG5cdFx0XHRcdHgxID0gdGhpcy5nZXROdW1iZXIoXCJ4MVwiLCB0LCAxMDApLFxuXHRcdFx0XHR5MSA9IHRoaXMuZ2V0TnVtYmVyKFwieTFcIiwgdCwgMjAwKSxcblx0XHRcdFx0eDIgPSB0aGlzLmdldE51bWJlcihcIngyXCIsIHQsIDE4MCksXG5cdFx0XHRcdHkyID0gdGhpcy5nZXROdW1iZXIoXCJ5MlwiLCB0LCAxMCk7XG5cblx0XHQgICAgY29udGV4dC5tb3ZlVG8oeDAsIHkwKTtcblx0XHQgICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKHgxLCB5MSwgeDIsIHkyKTtcblxuXHRcdFx0dGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCBmYWxzZSwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdGZ1bmN0aW9uIHF1YWRyYXRpYyh0LCB2MCwgdjEsIHYyKSB7XG5cdFx0cmV0dXJuICgxIC0gdCkgKiAoMSAtIHQpICogdjAgKyAyICogKDEgLSB0KSAqIHQgKiB2MSArIHQgKiB0ICogdjI7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGRyYXc6IGZ1bmN0aW9uKGNvbnRleHQsIHQpIHtcblx0XHRcdHZhciB4MCA9IHRoaXMuZ2V0TnVtYmVyKFwieDBcIiwgdCwgMjApLFxuXHRcdFx0XHR5MCA9IHRoaXMuZ2V0TnVtYmVyKFwieTBcIiwgdCwgMjApLFxuXHRcdFx0XHR4MSA9IHRoaXMuZ2V0TnVtYmVyKFwieDFcIiwgdCwgMTAwKSxcblx0XHRcdFx0eTEgPSB0aGlzLmdldE51bWJlcihcInkxXCIsIHQsIDIwMCksXG5cdFx0XHRcdHgyID0gdGhpcy5nZXROdW1iZXIoXCJ4MlwiLCB0LCAxODApLFxuXHRcdFx0XHR5MiA9IHRoaXMuZ2V0TnVtYmVyKFwieTJcIiwgdCwgMjApLFxuXHRcdFx0XHRwZXJjZW50ID0gdGhpcy5nZXROdW1iZXIoXCJwZXJjZW50XCIsIHQsIDAuMSksXG5cdFx0XHRcdHQxID0gdCAqICgxICsgcGVyY2VudCksXG5cdFx0XHRcdHQwID0gdDEgLSBwZXJjZW50LFxuXHRcdFx0XHRyZXMgPSAwLjAxLFxuXHRcdFx0XHR4LFxuXHRcdFx0XHR5O1xuXG5cdFx0XHR0MSA9IE1hdGgubWluKHQxLCAxKTtcblx0XHRcdHQwID0gTWF0aC5tYXgodDAsIDApO1xuXG5cdFx0XHRmb3IodmFyIGkgPSB0MDsgaSA8IHQxOyBpICs9IHJlcykge1xuXHRcdFx0XHR4ID0gcXVhZHJhdGljKGksIHgwLCB4MSwgeDIpO1xuXHRcdFx0XHR5ID0gcXVhZHJhdGljKGksIHkwLCB5MSwgeTIpO1xuXHRcdFx0XHRpZihpID09PSB0MCkge1xuXHRcdFx0XHQgICAgY29udGV4dC5tb3ZlVG8oeCwgeSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0ICAgIFx0XHRjb250ZXh0LmxpbmVUbyh4LCB5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0eCA9IHF1YWRyYXRpYyh0MSwgeDAsIHgxLCB4Mik7XG5cdFx0XHR5ID0gcXVhZHJhdGljKHQxLCB5MCwgeTEsIHkyKTtcblx0ICAgXHRcdGNvbnRleHQubGluZVRvKHgsIHkpO1xuXG5cdFx0XHR0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIGZhbHNlLCB0cnVlKTtcdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuXHRcdFx0XHRyYWRpdXMgPSB0aGlzLmdldE51bWJlcihcInJhZGl1c1wiLCB0LCA1MCksXG5cdFx0XHRcdHRvb3RoSGVpZ2h0ID0gdGhpcy5nZXROdW1iZXIoXCJ0b290aEhlaWdodFwiLCB0LCAxMCksXG5cdFx0XHRcdGh1YiA9IHRoaXMuZ2V0TnVtYmVyKFwiaHViXCIsIHQsIDEwKSxcblx0XHRcdFx0cm90YXRpb24gPSB0aGlzLmdldE51bWJlcihcInJvdGF0aW9uXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCxcblx0XHRcdFx0dGVldGggPSB0aGlzLmdldE51bWJlcihcInRlZXRoXCIsIHQsIDEwKSxcblx0XHRcdFx0dG9vdGhBbmdsZSA9IHRoaXMuZ2V0TnVtYmVyKFwidG9vdGhBbmdsZVwiLCB0LCAwLjMpLFxuXHRcdFx0XHRmYWNlID0gMC41IC0gdG9vdGhBbmdsZSAvIDIsXG5cdFx0XHRcdHNpZGUgPSAwLjUgLSBmYWNlLFxuXHRcdFx0XHRpbm5lclJhZGl1cyA9IHJhZGl1cyAtIHRvb3RoSGVpZ2h0O1xuXG5cdFx0XHRjb250ZXh0LnRyYW5zbGF0ZSh4LCB5KTtcblx0XHRcdGNvbnRleHQucm90YXRlKHJvdGF0aW9uKTtcblx0XHRcdGNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0Y29udGV4dC5tb3ZlVG8ocmFkaXVzLCAwKTtcblx0XHRcdHZhciBhbmdsZSA9IE1hdGguUEkgKiAyIC8gdGVldGg7XG5cblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0ZWV0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnRleHQucm90YXRlKGFuZ2xlICogZmFjZSk7XG5cdFx0XHRcdGNvbnRleHQubGluZVRvKHJhZGl1cywgMCk7XG5cdFx0XHRcdGNvbnRleHQucm90YXRlKGFuZ2xlICogc2lkZSk7XG5cdFx0XHRcdGNvbnRleHQubGluZVRvKGlubmVyUmFkaXVzLCAwKTtcblx0XHRcdFx0Y29udGV4dC5yb3RhdGUoYW5nbGUgKiBmYWNlKTtcblx0XHRcdFx0Y29udGV4dC5saW5lVG8oaW5uZXJSYWRpdXMsIDApO1xuXHRcdFx0XHRjb250ZXh0LnJvdGF0ZShhbmdsZSAqIHNpZGUpO1xuXHRcdFx0XHRjb250ZXh0LmxpbmVUbyhyYWRpdXMsIDApO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5saW5lVG8ocmFkaXVzLCAwKTtcblx0XHRcdGNvbnRleHQucmVzdG9yZSgpO1xuXG5cdFx0XHRjb250ZXh0Lm1vdmVUbyhodWIsIDApO1xuXHRcdFx0Y29udGV4dC5hcmMoMCwgMCwgaHViLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSk7XG5cblx0XHRcdHRoaXMuZHJhd0ZpbGxBbmRTdHJva2UoY29udGV4dCwgdCwgdHJ1ZSwgZmFsc2UpO1xuXHRcdH1cblx0fVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuICAgICAgdmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcbiAgICAgICAgeSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuICAgICAgICB3ID0gdGhpcy5nZXROdW1iZXIoXCJ3XCIsIHQsIDUwKSxcbiAgICAgICAgaCA9IHRoaXMuZ2V0TnVtYmVyKFwiaFwiLCB0LCA1MCk7XG5cbiAgICAgIHZhciB4MCA9IDAsXG4gICAgICAgIHkwID0gLS4yNSxcbiAgICAgICAgeDEgPSAuMixcbiAgICAgICAgeTEgPSAtLjgsXG4gICAgICAgIHgyID0gMS4xLFxuICAgICAgICB5MiA9IC0uMixcbiAgICAgICAgeDMgPSAwLFxuICAgICAgICB5MyA9IC41O1xuXG4gICAgICBjb250ZXh0LnNhdmUoKTtcbiAgICAgIGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuICAgICAgY29udGV4dC5yb3RhdGUodGhpcy5nZXROdW1iZXIoXCJyb3RhdGlvblwiLCB0LCAwKSAqIE1hdGguUEkgLyAxODApO1xuICAgICAgY29udGV4dC5zYXZlKCk7XG4gICAgICBjb250ZXh0LnNjYWxlKHcsIGgpO1xuICAgICAgY29udGV4dC5tb3ZlVG8oeDAsIHkwKTtcbiAgICAgIGNvbnRleHQuYmV6aWVyQ3VydmVUbyh4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKTtcbiAgICAgIGNvbnRleHQuYmV6aWVyQ3VydmVUbygteDIsIHkyLCAteDEsIHkxLCAteDAsIHkwKTtcbiAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xuICAgICAgdGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCB0cnVlLCBmYWxzZSk7XG4gICAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHgwID0gdGhpcy5nZXROdW1iZXIoXCJ4MFwiLCB0LCAwKSxcblx0XHRcdFx0eTAgPSB0aGlzLmdldE51bWJlcihcInkwXCIsIHQsIDApLFxuXHRcdFx0XHR4MSA9IHRoaXMuZ2V0TnVtYmVyKFwieDFcIiwgdCwgMTAwKSxcblx0XHRcdFx0eTEgPSB0aGlzLmdldE51bWJlcihcInkxXCIsIHQsIDEwMCk7XG5cdFx0XHRcdFxuXHRcdFx0Y29udGV4dC5tb3ZlVG8oeDAsIHkwKTtcblx0XHRcdGNvbnRleHQubGluZVRvKHgxLCB5MSk7XG5cblx0XHRcdHRoaXMuZHJhd0ZpbGxBbmRTdHJva2UoY29udGV4dCwgdCwgZmFsc2UsIHRydWUpO1x0XHRcblx0XHR9XG5cdH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cblx0cmV0dXJuIHtcblx0XHRkcmF3OiBmdW5jdGlvbihjb250ZXh0LCB0KSB7XG5cdFx0XHR2YXIgeCA9IHRoaXMuZ2V0TnVtYmVyKFwieFwiLCB0LCAxMDApLFxuXHRcdFx0XHR5ID0gdGhpcy5nZXROdW1iZXIoXCJ5XCIsIHQsIDEwMCksXG5cdFx0XHRcdHJ4ID0gdGhpcy5nZXROdW1iZXIoXCJyeFwiLCB0LCA1MCksXG5cdFx0XHRcdHJ5ID0gdGhpcy5nZXROdW1iZXIoXCJyeVwiLCB0LCA1MCksXG5cdFx0XHRcdHN0YXJ0QW5nbGUgPSB0aGlzLmdldE51bWJlcihcInN0YXJ0QW5nbGVcIiwgdCwgMCksXG5cdFx0XHRcdGVuZEFuZ2xlID0gdGhpcy5nZXROdW1iZXIoXCJlbmRBbmdsZVwiLCB0LCAzNjApLFxuXHRcdFx0XHRkcmF3RnJvbUNlbnRlciA9IHRoaXMuZ2V0Qm9vbChcImRyYXdGcm9tQ2VudGVyXCIsIHQsIGZhbHNlKTtcblxuXHRcdFx0Y29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG5cdFx0XHRjb250ZXh0LnJvdGF0ZSh0aGlzLmdldE51bWJlcihcInJvdGF0aW9uXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCk7XG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcblx0XHRcdGNvbnRleHQuc2NhbGUocnggLyAxMDAsIHJ5IC8gMTAwKTtcblx0XHRcdGlmKGRyYXdGcm9tQ2VudGVyKSB7XG5cdFx0XHRcdGNvbnRleHQubW92ZVRvKDAsIDApO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5hcmMoMCwgMCwgMTAwLCBzdGFydEFuZ2xlICogTWF0aC5QSSAvIDE4MCwgZW5kQW5nbGUgKiBNYXRoLlBJIC8gMTgwKTtcblx0XHRcdGlmKGRyYXdGcm9tQ2VudGVyKSB7XG5cdFx0XHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0XHR9XG5cdFx0XHRjb250ZXh0LnJlc3RvcmUoKTtcblxuXHRcdFx0dGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCB0cnVlLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHBhdGggPSB0aGlzLmdldEFycmF5KFwicGF0aFwiLCB0LCBbXSksXG5cdFx0XHRcdHN0YXJ0UGVyY2VudCA9IHRoaXMuZ2V0TnVtYmVyKFwic3RhcnRQZXJjZW50XCIsIHQsIDApLFxuXHRcdFx0XHRlbmRQZXJjZW50ID0gdGhpcy5nZXROdW1iZXIoXCJlbmRQZXJjZW50XCIsIHQsIDEpLFxuXHRcdFx0XHRzdGFydFBvaW50ID0gTWF0aC5mbG9vcihwYXRoLmxlbmd0aCAvIDIgKiBzdGFydFBlcmNlbnQpLFxuXHRcdFx0XHRlbmRQb2ludCA9IE1hdGguZmxvb3IocGF0aC5sZW5ndGggLyAyICogZW5kUGVyY2VudCksXG5cdFx0XHRcdHN0YXJ0SW5kZXggPSBzdGFydFBvaW50ICogMixcblx0XHRcdFx0ZW5kSW5kZXggPSBlbmRQb2ludCAqIDI7XG5cblx0XHRcdGlmKHN0YXJ0SW5kZXggPiBlbmRJbmRleCkge1xuXHRcdFx0XHR2YXIgdGVtcCA9IHN0YXJ0SW5kZXg7XG5cdFx0XHRcdHN0YXJ0SW5kZXggPSBlbmRJbmRleDtcblx0XHRcdFx0ZW5kSW5kZXggPSB0ZW1wO1xuXHRcdFx0fVxuXG5cdFx0ICAgIGNvbnRleHQubW92ZVRvKHBhdGhbc3RhcnRJbmRleF0sIHBhdGhbc3RhcnRJbmRleCArIDFdKTtcblxuXHRcdCAgICBmb3IodmFyIGkgPSBzdGFydEluZGV4ICsgMjsgaSA8IGVuZEluZGV4IC0gMTsgaSArPSAyKSB7XG5cdFx0ICAgIFx0Y29udGV4dC5saW5lVG8ocGF0aFtpXSwgcGF0aFtpICsgMV0pO1xuXHRcdCAgICB9XG5cblx0XHRcdHRoaXMuZHJhd0ZpbGxBbmRTdHJva2UoY29udGV4dCwgdCwgZmFsc2UsIHRydWUpO1x0XHR9XG5cdH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cblx0cmV0dXJuIHtcblx0XHRkcmF3OiBmdW5jdGlvbihjb250ZXh0LCB0KSB7XG5cdFx0XHR2YXIgeCA9IHRoaXMuZ2V0TnVtYmVyKFwieFwiLCB0LCAxMDApLFxuXHRcdFx0XHR5ID0gdGhpcy5nZXROdW1iZXIoXCJ5XCIsIHQsIDEwMCksXG5cdFx0XHRcdHJhZGl1cyA9IHRoaXMuZ2V0TnVtYmVyKFwicmFkaXVzXCIsIHQsIDUwKSxcblx0XHRcdFx0cm90YXRpb24gPSB0aGlzLmdldE51bWJlcihcInJvdGF0aW9uXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCxcblx0XHRcdFx0c2lkZXMgPSB0aGlzLmdldE51bWJlcihcInNpZGVzXCIsIHQsIDUpO1xuXG5cdFx0XHRjb250ZXh0LnRyYW5zbGF0ZSh4LCB5KTtcblx0XHRcdGNvbnRleHQucm90YXRlKHJvdGF0aW9uKTtcblx0XHRcdGNvbnRleHQubW92ZVRvKHJhZGl1cywgMCk7XG5cdFx0XHRmb3IodmFyIGkgPSAxOyBpIDwgc2lkZXM7IGkrKykge1xuXHRcdFx0XHR2YXIgYW5nbGUgPSBNYXRoLlBJICogMiAvIHNpZGVzICogaTtcblx0XHRcdFx0Y29udGV4dC5saW5lVG8oTWF0aC5jb3MoYW5nbGUpICogcmFkaXVzLCBNYXRoLnNpbihhbmdsZSkgKiByYWRpdXMpO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5saW5lVG8ocmFkaXVzLCAwKTtcblxuXHRcdFx0dGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCB0cnVlLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG59O1xuXHRcdFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuXHRcdFx0XHRhbmdsZSA9IHRoaXMuZ2V0TnVtYmVyKFwiYW5nbGVcIiwgdCwgMCkgKiBNYXRoLlBJIC8gMTgwLFxuXHRcdFx0XHRsZW5ndGggPSB0aGlzLmdldE51bWJlcihcImxlbmd0aFwiLCB0LCAxMDApLFxuXHRcdFx0XHRzZWdtZW50TGVuZ3RoID0gdGhpcy5nZXROdW1iZXIoXCJzZWdtZW50TGVuZ3RoXCIsIHQsIDUwKSxcdFx0XHRcdFxuXHRcdCAgICBcdHN0YXJ0ID0gLTAuMDEsXG5cdFx0ICAgIFx0ZW5kID0gKGxlbmd0aCArIHNlZ21lbnRMZW5ndGgpICogdDtcblxuXHRcdCAgICBpZihlbmQgPiBzZWdtZW50TGVuZ3RoKSB7XG5cdFx0ICAgICAgc3RhcnQgPSBlbmQgLSBzZWdtZW50TGVuZ3RoO1xuXHRcdCAgICB9XG5cdFx0ICAgIGlmKGVuZCA+IGxlbmd0aCkge1xuXHRcdCAgICAgIGVuZCA9IGxlbmd0aCArIDAuMDE7XG5cdFx0ICAgIH1cblxuXHRcdCAgICBjb250ZXh0LnRyYW5zbGF0ZSh4LCB5KTtcblx0XHQgICAgY29udGV4dC5yb3RhdGUoYW5nbGUpO1xuXHRcdFx0Y29udGV4dC5tb3ZlVG8oc3RhcnQsIDApO1xuXHRcdFx0Y29udGV4dC5saW5lVG8oZW5kLCAwKTtcblxuXHRcdFx0dGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCBmYWxzZSwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuXHRcdFx0XHR3ID0gdGhpcy5nZXROdW1iZXIoXCJ3XCIsIHQsIDEwMCksXG5cdFx0XHRcdGggPSB0aGlzLmdldE51bWJlcihcImhcIiwgdCwgMTAwKTtcblx0XHRcdFx0XG5cdFx0XHRjb250ZXh0LnRyYW5zbGF0ZSh4LCB5KTtcblx0XHRcdGNvbnRleHQucm90YXRlKHRoaXMuZ2V0TnVtYmVyKFwicm90YXRpb25cIiwgdCwgMCkgKiBNYXRoLlBJIC8gMTgwKTtcblx0XHRcdGlmKHRoaXMuZ2V0Qm9vbChcImRyYXdGcm9tQ2VudGVyXCIsIHQsIHRydWUpKSB7XG5cdFx0XHRcdGNvbnRleHQucmVjdCgtdyAqIDAuNSwgLWggKiAwLjUsIHcsIGgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnRleHQucmVjdCgwLCAwLCB3LCBoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCB0cnVlLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHgwID0gdGhpcy5nZXROdW1iZXIoXCJ4MFwiLCB0LCAwKSxcblx0XHRcdFx0eTAgPSB0aGlzLmdldE51bWJlcihcInkwXCIsIHQsIDApLFxuXHRcdFx0XHR4MSA9IHRoaXMuZ2V0TnVtYmVyKFwieDFcIiwgdCwgMTAwKSxcblx0XHRcdFx0eTEgPSB0aGlzLmdldE51bWJlcihcInkxXCIsIHQsIDEwMCksXG5cdFx0XHRcdHNlZ21lbnRMZW5ndGggPSB0aGlzLmdldE51bWJlcihcInNlZ21lbnRMZW5ndGhcIiwgdCwgNTApLFxuXHRcdFx0XHRkeCA9IHgxIC0geDAsXG5cdFx0XHQgICAgZHkgPSB5MSAtIHkwLFxuXHRcdFx0ICAgIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpLFxuXHRcdFx0ICAgIGRpc3QgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpLFxuXHRcdCAgICBcdHN0YXJ0ID0gLTAuMDEsXG5cdFx0ICAgIFx0ZW5kID0gKGRpc3QgKyBzZWdtZW50TGVuZ3RoKSAqIHQ7XG5cblx0XHQgICAgaWYoZW5kID4gc2VnbWVudExlbmd0aCkge1xuXHRcdCAgICAgIHN0YXJ0ID0gZW5kIC0gc2VnbWVudExlbmd0aDtcblx0XHQgICAgfVxuXHRcdCAgICBpZihlbmQgPiBkaXN0KSB7XG5cdFx0ICAgICAgZW5kID0gZGlzdCArIDAuMDE7XG5cdFx0ICAgIH1cblxuXHRcdCAgICBjb250ZXh0LnRyYW5zbGF0ZSh4MCwgeTApO1xuXHRcdCAgICBjb250ZXh0LnJvdGF0ZShhbmdsZSk7XG5cdFx0XHRjb250ZXh0Lm1vdmVUbyhzdGFydCwgMCk7XG5cdFx0XHRjb250ZXh0LmxpbmVUbyhlbmQsIDApO1xuXG5cdFx0XHR0aGlzLmRyYXdGaWxsQW5kU3Ryb2tlKGNvbnRleHQsIHQsIGZhbHNlLCB0cnVlKTtcblx0XHR9XG5cdH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG5cblx0cmV0dXJuIHtcblx0XHRkcmF3OiBmdW5jdGlvbihjb250ZXh0LCB0KSB7XG5cdFx0XHR2YXIgeCA9IHRoaXMuZ2V0TnVtYmVyKFwieFwiLCB0LCBcIjEwMFwiKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCBcIjEwMFwiKSxcblx0XHRcdFx0aW5uZXJSYWRpdXMgPSB0aGlzLmdldE51bWJlcihcImlubmVyUmFkaXVzXCIsIHQsIDEwKSxcblx0XHRcdFx0b3V0ZXJSYWRpdXMgPSB0aGlzLmdldE51bWJlcihcIm91dGVyUmFkaXVzXCIsIHQsIDkwKSxcblx0XHRcdFx0dHVybnMgPSB0aGlzLmdldE51bWJlcihcInR1cm5zXCIsIHQsIDYpLFxuXHRcdFx0XHRyZXMgPSB0aGlzLmdldE51bWJlcihcInJlc1wiLCB0LCAxKSAqIE1hdGguUEkgLyAxODAsXG5cdFx0XHRcdGZ1bGxBbmdsZSA9IE1hdGguUEkgKiAyICogdHVybnM7XG5cblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuXHRcdFx0Y29udGV4dC5yb3RhdGUodGhpcy5nZXROdW1iZXIoXCJyb3RhdGlvblwiLCB0LCAwKSAqIE1hdGguUEkgLyAxODApO1xuXG5cblx0XHRcdGlmKGZ1bGxBbmdsZSA+IDApIHtcblx0XHRcdFx0Zm9yKHZhciBhID0gMDsgYSA8IGZ1bGxBbmdsZTsgYSArPSByZXMpIHtcblx0XHRcdFx0XHR2YXIgciA9IGlubmVyUmFkaXVzICsgKG91dGVyUmFkaXVzIC0gaW5uZXJSYWRpdXMpICogYSAvIGZ1bGxBbmdsZTtcblx0XHRcdFx0XHRjb250ZXh0LmxpbmVUbyhNYXRoLmNvcyhhKSAqIHIsIE1hdGguc2luKGEpICogcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRmb3IodmFyIGEgPSAwOyBhID4gZnVsbEFuZ2xlOyBhIC09IHJlcykge1xuXHRcdFx0XHRcdHZhciByID0gaW5uZXJSYWRpdXMgKyAob3V0ZXJSYWRpdXMgLSBpbm5lclJhZGl1cykgKiBhIC8gZnVsbEFuZ2xlO1xuXHRcdFx0XHRcdGNvbnRleHQubGluZVRvKE1hdGguY29zKGEpICogciwgTWF0aC5zaW4oYSkgKiByKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5kcmF3RmlsbEFuZFN0cm9rZShjb250ZXh0LCB0LCBmYWxzZSwgdHJ1ZSk7XG5cdFx0fVxuXHR9O1xuXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcblxuXHRyZXR1cm4ge1xuXHRcdGRyYXc6IGZ1bmN0aW9uKGNvbnRleHQsIHQpIHtcblx0XHRcdHZhciB4ID0gdGhpcy5nZXROdW1iZXIoXCJ4XCIsIHQsIDEwMCksXG5cdFx0XHRcdHkgPSB0aGlzLmdldE51bWJlcihcInlcIiwgdCwgMTAwKSxcblx0XHRcdFx0aW5uZXJSYWRpdXMgPSB0aGlzLmdldE51bWJlcihcImlubmVyUmFkaXVzXCIsIHQsIDI1KSxcblx0XHRcdFx0b3V0ZXJSYWRpdXMgPSB0aGlzLmdldE51bWJlcihcIm91dGVyUmFkaXVzXCIsIHQsIDUwKSxcblx0XHRcdFx0cm90YXRpb24gPSB0aGlzLmdldE51bWJlcihcInJvdGF0aW9uXCIsIHQsIDApICogTWF0aC5QSSAvIDE4MCxcblx0XHRcdFx0cG9pbnRzID0gdGhpcy5nZXROdW1iZXIoXCJwb2ludHNcIiwgdCwgNSk7XG5cblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuXHRcdFx0Y29udGV4dC5yb3RhdGUocm90YXRpb24pO1xuXHRcdFx0Y29udGV4dC5tb3ZlVG8ob3V0ZXJSYWRpdXMsIDApO1xuXHRcdFx0Zm9yKHZhciBpID0gMTsgaSA8IHBvaW50cyAqIDI7IGkrKykge1xuXHRcdFx0XHR2YXIgYW5nbGUgPSBNYXRoLlBJICogMiAvIHBvaW50cyAvIDIgKiBpLFxuXHRcdFx0XHRcdHIgPSBpICUgMiA/IGlubmVyUmFkaXVzIDogb3V0ZXJSYWRpdXM7XG5cdFx0XHRcdGNvbnRleHQubGluZVRvKE1hdGguY29zKGFuZ2xlKSAqIHIsIE1hdGguc2luKGFuZ2xlKSAqIHIpO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5saW5lVG8ob3V0ZXJSYWRpdXMsIDApO1xuXG5cblx0XHRcdHRoaXMuZHJhd0ZpbGxBbmRTdHJva2UoY29udGV4dCwgdCwgdHJ1ZSwgZmFsc2UpO1x0XG5cdFx0fVxuXHR9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuXG5cdHJldHVybiB7XG5cdFx0ZHJhdzogZnVuY3Rpb24oY29udGV4dCwgdCkge1xuXHRcdFx0dmFyIHggPSB0aGlzLmdldE51bWJlcihcInhcIiwgdCwgMTAwKSxcblx0XHRcdFx0eSA9IHRoaXMuZ2V0TnVtYmVyKFwieVwiLCB0LCAxMDApLFxuXHRcdFx0XHR0ZXh0ID0gdGhpcy5nZXRTdHJpbmcoXCJ0ZXh0XCIsIHQsIFwiaGVsbG9cIiksXG5cdFx0XHRcdGZvbnRTaXplID0gdGhpcy5nZXROdW1iZXIoXCJmb250U2l6ZVwiLCB0LCAyMCksXG5cdFx0XHRcdGZvbnRXZWlnaHQgPSB0aGlzLmdldFN0cmluZyhcImZvbnRXZWlnaHRcIiwgdCwgXCJub3JtYWxcIik7XG5cdFx0XHRcdGZvbnRGYW1pbHkgPSB0aGlzLmdldFN0cmluZyhcImZvbnRGYW1pbHlcIiwgdCwgXCJzYW5zLXNlcmlmXCIpO1xuXHRcdFx0XHRmb250U3R5bGUgPSB0aGlzLmdldFN0cmluZyhcImZvbnRTdHlsZVwiLCB0LCBcIm5vcm1hbFwiKTtcblxuXHRcdFx0Y29udGV4dC5mb250ID0gZm9udFdlaWdodCArIFwiIFwiICsgZm9udFN0eWxlICsgXCIgXCIgKyBmb250U2l6ZSArIFwicHggXCIgKyBmb250RmFtaWx5O1xuXHRcdFx0dmFyIHdpZHRoID0gY29udGV4dC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aDtcblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuXHRcdFx0Y29udGV4dC5yb3RhdGUodGhpcy5nZXROdW1iZXIoXCJyb3RhdGlvblwiLCB0LCAwKSAqIE1hdGguUEkgLyAxODApO1xuXHRcdFx0dmFyIHNoYWRvd3NTZXQgPSBmYWxzZTtcblx0XHRcdGNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0aWYodGhpcy5nZXRCb29sKFwiZmlsbFwiLCB0LCB0cnVlKSkge1xuXHRcdFx0XHR0aGlzLnNldFNoYWRvd1BhcmFtcyhjb250ZXh0LCB0KTtcblx0XHRcdFx0c2hhZG93c1NldCA9IHRydWU7XG5cdFx0XHRcdGNvbnRleHQuZmlsbFRleHQodGV4dCwgLXdpZHRoIC8gMiwgZm9udFNpemUgKiAwLjQpO1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5yZXN0b3JlKCk7XG5cdFx0XHRpZih0aGlzLmdldEJvb2woXCJzdHJva2VcIiwgdCwgZmFsc2UpKSB7XG5cdFx0XHRcdGlmKCFzaGFkb3dzU2V0KSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRTaGFkb3dQYXJhbXMoY29udGV4dCwgdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGV4dC5zdHJva2VUZXh0KHRleHQsIC13aWR0aCAvIDIsIGZvbnRTaXplICogMC40KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG4iXX0=

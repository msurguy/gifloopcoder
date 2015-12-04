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
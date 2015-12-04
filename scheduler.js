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
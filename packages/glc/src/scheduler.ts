// The realtime animation clock: t runs 0 -> 1 over `duration` seconds at `fps`,
// driven by setTimeout + requestAnimationFrame like the original. Preview only —
// exports use the deterministic frame loop in export/frameRenderer.ts.

export type RenderCallback = (t: number) => void;
export type CompleteCallback = () => void;

export interface Scheduler {
  init(onRender: RenderCallback, onComplete: CompleteCallback): void;
  loop(): void;
  playOnce(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  seek(t: number): void;
  getT(): number;
  isRunning(): boolean;
  isLooping(): boolean;
  setDuration(value: number): number;
  getDuration(): number;
  setFPS(value: number): number;
  getFPS(): number;
}

export function createScheduler(): Scheduler {
  let t = 0;
  let duration = 2;
  let fps = 30;
  let running = false;
  let looping = false;
  let renderCallback: RenderCallback | null = null;
  let completeCallback: CompleteCallback | null = null;
  // Bumped whenever the run state changes so stale setTimeout/rAF chains die
  // instead of double-driving the clock.
  let generation = 0;

  function init(onRender: RenderCallback, onComplete: CompleteCallback): void {
    renderCallback = onRender;
    completeCallback = onComplete;
  }

  function render(): void {
    if (!running) {
      return;
    }
    if (renderCallback) {
      renderCallback(t);
    }
    advance();
    if (!running) {
      // advance() hit the end of a playOnce run
      if (completeCallback) {
        completeCallback();
      }
      return;
    }
    const gen = generation;
    setTimeout(() => {
      if (gen !== generation) return;
      requestAnimationFrame(() => {
        if (gen !== generation) return;
        render();
      });
    }, 1000 / fps);
  }

  function advance(): void {
    const numFrames = duration * fps;
    const speed = 1 / numFrames;
    t += speed;
    if (Math.round(t * 10000) / 10000 >= 1) {
      if (looping) {
        t -= 1;
      } else {
        t = 0;
        running = false;
        looping = false;
        generation++;
      }
    }
  }

  function loop(): void {
    if (!running) {
      t = 0;
      looping = true;
      running = true;
      generation++;
      render();
    }
  }

  function stop(): void {
    const wasRunning = running;
    running = false;
    looping = false;
    t = 0;
    generation++;
    if (wasRunning && completeCallback) {
      completeCallback();
    }
  }

  function pause(): void {
    running = false;
    generation++;
  }

  function resume(): void {
    if (!running) {
      running = true;
      generation++;
      render();
    }
  }

  function seek(value: number): void {
    t = Math.min(Math.max(value, 0), 1);
    if (!running && renderCallback) {
      renderCallback(t);
    }
  }

  function playOnce(): void {
    if (!running) {
      t = 0;
      looping = false;
      running = true;
      generation++;
      render();
    }
  }

  return {
    init,
    loop,
    playOnce,
    stop,
    pause,
    resume,
    seek,
    getT: () => t,
    isRunning: () => running,
    isLooping: () => looping,
    setDuration(value: number) {
      duration = value;
      return duration;
    },
    getDuration: () => duration,
    setFPS(value: number) {
      fps = value;
      return fps;
    },
    getFPS: () => fps,
  };
}

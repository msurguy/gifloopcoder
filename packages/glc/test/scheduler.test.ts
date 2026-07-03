import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createScheduler } from '../src/scheduler.js';

// The scheduler drives frames via setTimeout + requestAnimationFrame.
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    setTimeout(() => cb(performance.now()), 0);
    return 0;
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('scheduler', () => {
  it('playOnce advances t from 0 to <1 and fires onComplete at the end', () => {
    const scheduler = createScheduler();
    const ts: number[] = [];
    let completed = 0;
    scheduler.init(
      (t) => ts.push(t),
      () => completed++
    );
    scheduler.setDuration(1);
    scheduler.setFPS(4); // 4 frames total

    scheduler.playOnce();
    vi.runAllTimers();

    expect(ts).toEqual([0, 0.25, 0.5, 0.75]);
    expect(completed).toBe(1);
    expect(scheduler.isRunning()).toBe(false);
  });

  it('loop wraps t around instead of stopping', () => {
    const scheduler = createScheduler();
    const ts: number[] = [];
    scheduler.init(
      (t) => ts.push(t),
      () => {}
    );
    scheduler.setDuration(1);
    scheduler.setFPS(2);

    scheduler.loop();
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(600);
    }
    scheduler.stop();

    expect(ts.length).toBeGreaterThan(3);
    for (const t of ts) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThan(1);
    }
  });

  it('pause freezes t; seek renders at the sought t while paused', () => {
    const scheduler = createScheduler();
    const ts: number[] = [];
    scheduler.init(
      (t) => ts.push(t),
      () => {}
    );
    scheduler.setDuration(1);
    scheduler.setFPS(4);

    scheduler.loop();
    vi.advanceTimersByTime(300);
    scheduler.pause();
    const frozen = scheduler.getT();
    vi.advanceTimersByTime(1000);
    expect(scheduler.getT()).toBe(frozen);

    ts.length = 0;
    scheduler.seek(0.5);
    expect(scheduler.getT()).toBe(0.5);
    expect(ts).toEqual([0.5]);
  });

  it('stop fires onComplete when interrupting a run', () => {
    const scheduler = createScheduler();
    let completed = 0;
    scheduler.init(
      () => {},
      () => completed++
    );
    scheduler.loop();
    scheduler.stop();
    expect(completed).toBe(1);
    expect(scheduler.getT()).toBe(0);
  });
});

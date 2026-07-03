import type { ShapeType } from '../shape.js';

function bezier(t: number, v0: number, v1: number, v2: number, v3: number): number {
  return (
    (1 - t) * (1 - t) * (1 - t) * v0 +
    3 * (1 - t) * (1 - t) * t * v1 +
    3 * (1 - t) * t * t * v2 +
    t * t * t * v3
  );
}

export const bezierSegment: ShapeType = {
  draw(context, t) {
    const x0 = this.getNumber('x0', t, 50);
    const y0 = this.getNumber('y0', t, 10);
    const x1 = this.getNumber('x1', t, 200);
    const y1 = this.getNumber('y1', t, 100);
    const x2 = this.getNumber('x2', t, 0);
    const y2 = this.getNumber('y2', t, 100);
    const x3 = this.getNumber('x3', t, 150);
    const y3 = this.getNumber('y3', t, 10);
    const percent = this.getNumber('percent', t, 0.1);
    let t1 = t * (1 + percent);
    let t0 = t1 - percent;
    const res = 0.01;
    let x: number;
    let y: number;

    t1 = Math.min(t1, 1.001);
    t0 = Math.max(t0, -0.001);

    for (let i = t0; i < t1; i += res) {
      x = bezier(i, x0, x1, x2, x3);
      y = bezier(i, y0, y1, y2, y3);
      if (i === t0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    x = bezier(t1, x0, x1, x2, x3);
    y = bezier(t1, y0, y1, y2, y3);
    context.lineTo(x, y);

    this.drawFillAndStroke(context, t, false, true);
  },
};

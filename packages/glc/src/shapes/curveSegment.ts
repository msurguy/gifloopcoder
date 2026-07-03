import type { ShapeType } from '../shape.js';

function quadratic(t: number, v0: number, v1: number, v2: number): number {
  return (1 - t) * (1 - t) * v0 + 2 * (1 - t) * t * v1 + t * t * v2;
}

export const curveSegment: ShapeType = {
  draw(context, t) {
    const x0 = this.getNumber('x0', t, 20);
    const y0 = this.getNumber('y0', t, 20);
    const x1 = this.getNumber('x1', t, 100);
    const y1 = this.getNumber('y1', t, 200);
    const x2 = this.getNumber('x2', t, 180);
    const y2 = this.getNumber('y2', t, 20);
    const percent = this.getNumber('percent', t, 0.1);
    let t1 = t * (1 + percent);
    let t0 = t1 - percent;
    const res = 0.01;
    let x: number;
    let y: number;

    t1 = Math.min(t1, 1);
    t0 = Math.max(t0, 0);

    for (let i = t0; i < t1; i += res) {
      x = quadratic(i, x0, x1, x2);
      y = quadratic(i, y0, y1, y2);
      if (i === t0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    x = quadratic(t1, x0, x1, x2);
    y = quadratic(t1, y0, y1, y2);
    context.lineTo(x, y);

    this.drawFillAndStroke(context, t, false, true);
  },
};

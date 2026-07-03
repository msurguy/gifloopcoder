import type { ShapeType } from '../shape.js';

export const segment: ShapeType = {
  draw(context, t) {
    const x0 = this.getNumber('x0', t, 0);
    const y0 = this.getNumber('y0', t, 0);
    const x1 = this.getNumber('x1', t, 100);
    const y1 = this.getNumber('y1', t, 100);
    const segmentLength = this.getNumber('segmentLength', t, 50);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);
    let start = -0.01;
    let end = (dist + segmentLength) * t;

    if (end > segmentLength) {
      start = end - segmentLength;
    }
    if (end > dist) {
      end = dist + 0.01;
    }

    context.translate(x0, y0);
    context.rotate(angle);
    context.moveTo(start, 0);
    context.lineTo(end, 0);

    this.drawFillAndStroke(context, t, false, true);
  },
};

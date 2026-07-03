import type { ShapeType } from '../shape.js';

export const raySegment: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const angle = (this.getNumber('angle', t, 0) * Math.PI) / 180;
    const length = this.getNumber('length', t, 100);
    const segmentLength = this.getNumber('segmentLength', t, 50);
    let start = -0.01;
    let end = (length + segmentLength) * t;

    if (end > segmentLength) {
      start = end - segmentLength;
    }
    if (end > length) {
      end = length + 0.01;
    }

    context.translate(x, y);
    context.rotate(angle);
    context.moveTo(start, 0);
    context.lineTo(end, 0);

    this.drawFillAndStroke(context, t, false, true);
  },
};

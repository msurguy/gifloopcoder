import type { ShapeType } from '../shape.js';

export const arcSegment: ShapeType = {
  draw(context, t) {
    let startAngle = this.getNumber('startAngle', t, 0);
    let endAngle = this.getNumber('endAngle', t, 360);
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const radius = this.getNumber('radius', t, 50);

    if (startAngle > endAngle) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp;
    }
    const arc = this.getNumber('arc', t, 20);
    let start = startAngle - 1;
    let end = startAngle + t * (endAngle - startAngle + arc);

    if (end > startAngle + arc) {
      start = end - arc;
    }
    if (end > endAngle) {
      end = endAngle + 1;
    }

    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);
    context.arc(0, 0, radius, (start * Math.PI) / 180, (end * Math.PI) / 180);

    this.drawFillAndStroke(context, t, false, true);
  },
};

import type { ShapeType } from '../shape.js';

export const curve: ShapeType = {
  draw(context, t) {
    const x0 = this.getNumber('x0', t, 20);
    const y0 = this.getNumber('y0', t, 10);
    const x1 = this.getNumber('x1', t, 100);
    const y1 = this.getNumber('y1', t, 200);
    const x2 = this.getNumber('x2', t, 180);
    const y2 = this.getNumber('y2', t, 10);

    context.moveTo(x0, y0);
    context.quadraticCurveTo(x1, y1, x2, y2);

    this.drawFillAndStroke(context, t, false, true);
  },
};

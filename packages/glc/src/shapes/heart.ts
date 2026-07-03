import type { ShapeType } from '../shape.js';

export const heart: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const w = this.getNumber('w', t, 50);
    const h = this.getNumber('h', t, 50);

    const x0 = 0;
    const y0 = -0.25;
    const x1 = 0.2;
    const y1 = -0.8;
    const x2 = 1.1;
    const y2 = -0.2;
    const x3 = 0;
    const y3 = 0.5;

    context.save();
    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);
    context.save();
    context.scale(w, h);
    context.moveTo(x0, y0);
    context.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    context.bezierCurveTo(-x2, y2, -x1, y1, -x0, y0);
    context.restore();
    this.drawFillAndStroke(context, t, true, false);
    context.restore();
  },
};

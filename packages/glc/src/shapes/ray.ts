import type { ShapeType } from '../shape.js';

export const ray: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const angle = (this.getNumber('angle', t, 0) * Math.PI) / 180;
    const length = this.getNumber('length', t, 100);

    context.translate(x, y);
    context.rotate(angle);
    context.moveTo(0, 0);
    context.lineTo(length, 0);

    this.drawFillAndStroke(context, t, false, true);
  },
};

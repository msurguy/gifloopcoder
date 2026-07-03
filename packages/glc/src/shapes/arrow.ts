import type { ShapeType } from '../shape.js';

export const arrow: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const w = this.getNumber('w', t, 100);
    const h = this.getNumber('h', t, 100);
    const pointPercent = this.getNumber('pointPercent', t, 0.5);
    const shaftPercent = this.getNumber('shaftPercent', t, 0.5);

    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);

    context.moveTo(-w / 2, -h * shaftPercent * 0.5);
    context.lineTo(w / 2 - w * pointPercent, -h * shaftPercent * 0.5);
    context.lineTo(w / 2 - w * pointPercent, -h * 0.5);
    context.lineTo(w / 2, 0);
    context.lineTo(w / 2 - w * pointPercent, h * 0.5);
    context.lineTo(w / 2 - w * pointPercent, h * shaftPercent * 0.5);
    context.lineTo(-w / 2, h * shaftPercent * 0.5);
    context.lineTo(-w / 2, -h * shaftPercent * 0.5);

    this.drawFillAndStroke(context, t, true, false);
  },
};

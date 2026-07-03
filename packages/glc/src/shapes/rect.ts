import type { ShapeType } from '../shape.js';

export const rect: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const w = this.getNumber('w', t, 100);
    const h = this.getNumber('h', t, 100);

    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);
    if (this.getBool('drawFromCenter', t, true)) {
      context.rect(-w * 0.5, -h * 0.5, w, h);
    } else {
      context.rect(0, 0, w, h);
    }

    this.drawFillAndStroke(context, t, true, false);
  },
};

import type { ShapeType } from '../shape.js';

export const grid: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 0);
    const y = this.getNumber('y', t, 0);
    const w = this.getNumber('w', t, 100);
    const h = this.getNumber('h', t, 100);
    const gridSize = this.getNumber('gridSize', t, 20);

    for (let i = y; i <= y + h; i += gridSize) {
      context.moveTo(x, i);
      context.lineTo(x + w, i);
    }
    for (let i = x; i <= x + w; i += gridSize) {
      context.moveTo(i, y);
      context.lineTo(i, y + h);
    }

    this.drawFillAndStroke(context, t, false, true);
  },
};

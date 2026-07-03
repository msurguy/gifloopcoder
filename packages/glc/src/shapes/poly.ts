import type { ShapeType } from '../shape.js';

export const poly: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const radius = this.getNumber('radius', t, 50);
    const rotation = (this.getNumber('rotation', t, 0) * Math.PI) / 180;
    const sides = this.getNumber('sides', t, 5);

    context.translate(x, y);
    context.rotate(rotation);
    context.moveTo(radius, 0);
    for (let i = 1; i < sides; i++) {
      const angle = ((Math.PI * 2) / sides) * i;
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    context.lineTo(radius, 0);

    this.drawFillAndStroke(context, t, true, false);
  },
};

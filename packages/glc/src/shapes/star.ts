import type { ShapeType } from '../shape.js';

export const star: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const innerRadius = this.getNumber('innerRadius', t, 25);
    const outerRadius = this.getNumber('outerRadius', t, 50);
    const rotation = (this.getNumber('rotation', t, 0) * Math.PI) / 180;
    const points = this.getNumber('points', t, 5);

    context.translate(x, y);
    context.rotate(rotation);
    context.moveTo(outerRadius, 0);
    for (let i = 1; i < points * 2; i++) {
      const angle = ((Math.PI * 2) / points / 2) * i;
      const r = i % 2 ? innerRadius : outerRadius;
      context.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    context.lineTo(outerRadius, 0);

    this.drawFillAndStroke(context, t, true, false);
  },
};

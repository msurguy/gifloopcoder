import type { ShapeType } from '../shape.js';

export const gear: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const radius = this.getNumber('radius', t, 50);
    const toothHeight = this.getNumber('toothHeight', t, 10);
    const hub = this.getNumber('hub', t, 10);
    const rotation = (this.getNumber('rotation', t, 0) * Math.PI) / 180;
    const teeth = this.getNumber('teeth', t, 10);
    const toothAngle = this.getNumber('toothAngle', t, 0.3);
    const face = 0.5 - toothAngle / 2;
    const side = 0.5 - face;
    const innerRadius = radius - toothHeight;

    context.translate(x, y);
    context.rotate(rotation);
    context.save();
    context.moveTo(radius, 0);
    const angle = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
      context.rotate(angle * face);
      context.lineTo(radius, 0);
      context.rotate(angle * side);
      context.lineTo(innerRadius, 0);
      context.rotate(angle * face);
      context.lineTo(innerRadius, 0);
      context.rotate(angle * side);
      context.lineTo(radius, 0);
    }
    context.lineTo(radius, 0);
    context.restore();

    context.moveTo(hub, 0);
    context.arc(0, 0, hub, 0, Math.PI * 2, true);

    this.drawFillAndStroke(context, t, true, false);
  },
};

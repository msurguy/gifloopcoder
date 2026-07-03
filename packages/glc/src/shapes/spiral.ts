import type { ShapeType } from '../shape.js';

export const spiral: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const innerRadius = this.getNumber('innerRadius', t, 10);
    const outerRadius = this.getNumber('outerRadius', t, 90);
    const turns = this.getNumber('turns', t, 6);
    const res = (this.getNumber('res', t, 1) * Math.PI) / 180;
    const fullAngle = Math.PI * 2 * turns;

    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);

    if (fullAngle > 0) {
      for (let a = 0; a < fullAngle; a += res) {
        const r = innerRadius + ((outerRadius - innerRadius) * a) / fullAngle;
        context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
    } else {
      for (let a = 0; a > fullAngle; a -= res) {
        const r = innerRadius + ((outerRadius - innerRadius) * a) / fullAngle;
        context.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
    }
    this.drawFillAndStroke(context, t, false, true);
  },
};

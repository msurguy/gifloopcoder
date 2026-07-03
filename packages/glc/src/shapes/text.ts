import type { ShapeType } from '../shape.js';

export const text: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const str = this.getString('text', t, 'hello');
    const fontSize = this.getNumber('fontSize', t, 20);
    const fontWeight = this.getString('fontWeight', t, 'normal');
    const fontFamily = this.getString('fontFamily', t, 'sans-serif');
    const fontStyle = this.getString('fontStyle', t, 'normal');

    context.font = fontWeight + ' ' + fontStyle + ' ' + fontSize + 'px ' + fontFamily;
    const width = context.measureText(str).width;
    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);
    let shadowsSet = false;
    context.save();
    if (this.getBool('fill', t, true)) {
      this.setShadowParams(context, t);
      shadowsSet = true;
      context.fillText(str, -width / 2, fontSize * 0.4);
    }
    context.restore();
    if (this.getBool('stroke', t, false)) {
      if (!shadowsSet) {
        this.setShadowParams(context, t);
      }
      context.strokeText(str, -width / 2, fontSize * 0.4);
    }
  },
};

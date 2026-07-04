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
    const textAlign = this.getString<CanvasTextAlign>('textAlign', t, 'center');
    const textBaseline = this.getString<CanvasTextBaseline>('textBaseline', t, 'middle');
    const letterSpacing = this.getNumber('letterSpacing', t, 0);

    context.font = fontWeight + ' ' + fontStyle + ' ' + fontSize + 'px ' + fontFamily;
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;
    context.letterSpacing = letterSpacing + 'px';
    context.translate(x, y);
    context.rotate((this.getNumber('rotation', t, 0) * Math.PI) / 180);
    let shadowsSet = false;
    context.save();
    if (this.getBool('fill', t, true)) {
      this.setShadowParams(context, t);
      shadowsSet = true;
      context.fillText(str, 0, 0);
    }
    context.restore();
    if (this.getBool('stroke', t, false)) {
      if (!shadowsSet) {
        this.setShadowParams(context, t);
      }
      context.strokeText(str, 0, 0);
    }
  },
};

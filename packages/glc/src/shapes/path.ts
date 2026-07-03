import type { ShapeType } from '../shape.js';

export const path: ShapeType = {
  draw(context, t) {
    const pathPoints = this.getArray('path', t, []);
    const startPercent = this.getNumber('startPercent', t, 0);
    const endPercent = this.getNumber('endPercent', t, 1);
    const startPoint = Math.floor((pathPoints.length / 2) * startPercent);
    const endPoint = Math.floor((pathPoints.length / 2) * endPercent);
    let startIndex = startPoint * 2;
    let endIndex = endPoint * 2;

    if (startIndex > endIndex) {
      const temp = startIndex;
      startIndex = endIndex;
      endIndex = temp;
    }

    context.moveTo(pathPoints[startIndex], pathPoints[startIndex + 1]);

    for (let i = startIndex + 2; i < endIndex - 1; i += 2) {
      context.lineTo(pathPoints[i], pathPoints[i + 1]);
    }

    this.drawFillAndStroke(context, t, false, true);
  },
};

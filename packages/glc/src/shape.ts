// Shape base: every shape instance interpolates its own local t (phase/speedMult
// + bounce/single easing), applies canvas styles, calls the shape type's draw,
// then restores. Ported from the original shape prototype.

import * as valueParser from './parsers/valueParser.js';
import * as colorParser from './parsers/colorParser.js';
import type { Interpolation, ShapeProps, Styles } from './types.js';

export interface ShapeType {
  draw(this: Shape, context: CanvasRenderingContext2D, t: number): void;
}

export class Shape {
  props: ShapeProps;
  styles: Styles;
  interpolation: Interpolation;
  draw: (this: Shape, context: CanvasRenderingContext2D, t: number) => void;

  constructor(type: ShapeType, props: ShapeProps, styles: Styles, interpolation: Interpolation) {
    // Bind function-valued props to the props object so a prop like
    // `radius: function(t) { return this.baseRadius * t; }` can read siblings.
    for (const prop in props) {
      const p = props[prop];
      if (typeof p === 'function') {
        props[prop] = (p as (t: number) => unknown).bind(props);
      }
    }
    this.props = props;
    this.styles = styles;
    this.interpolation = interpolation;
    this.draw = type.draw;
  }

  render(context: CanvasRenderingContext2D, time: number): void {
    const t = this.interpolate(time);
    this.startDraw(context, t);
    this.draw(context, t);
    this.endDraw(context);
  }

  interpolate(t: number): number {
    t *= (this.props.speedMult as number) || 1;
    t += (this.props.phase as number) || 0;

    switch (this.interpolation.mode) {
      case 'bounce':
        if (this.interpolation.easing) {
          const a = t * Math.PI * 2;
          return 0.5 - Math.cos(a) * 0.5;
        } else {
          t = t % 1;
          return t < 0.5 ? t * 2 : (1 - t) * 2;
        }

      case 'single':
      default:
        if (t > 1) {
          t %= 1;
        }
        if (this.interpolation.easing) {
          const a = t * Math.PI;
          return 0.5 - Math.cos(a) * 0.5;
        } else {
          return t;
        }
    }
  }

  startDraw(context: CanvasRenderingContext2D, t: number): void {
    context.save();
    context.lineWidth = this.getNumber('lineWidth', t, this.styles.lineWidth);
    context.strokeStyle = this.getColor('strokeStyle', t, this.styles.strokeStyle);
    context.fillStyle = this.getColor('fillStyle', t, this.styles.fillStyle);
    context.lineCap = this.getString('lineCap', t, this.styles.lineCap);
    context.lineJoin = this.getString('lineJoin', t, this.styles.lineJoin);
    context.miterLimit = this.getNumber('miterLimit', t, this.styles.miterLimit);
    context.globalAlpha = this.getNumber('globalAlpha', t, this.styles.globalAlpha);
    context.translate(
      this.getNumber('translationX', t, this.styles.translationX),
      this.getNumber('translationY', t, this.styles.translationY)
    );
    context.globalCompositeOperation = this.getString('blendMode', t, this.styles.blendMode);
    const shake = this.getNumber('shake', t, this.styles.shake);
    context.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);

    const lineDash = this.getArray('lineDash', t, this.styles.lineDash);
    if (lineDash) {
      context.setLineDash(lineDash);
    }
    context.beginPath();
  }

  drawFillAndStroke(context: CanvasRenderingContext2D, t: number, doFill: boolean, doStroke: boolean): void {
    const fill = this.getBool('fill', t, doFill);
    const stroke = this.getBool('stroke', t, doStroke);

    context.save();
    if (fill) {
      this.setShadowParams(context, t);
      context.fill();
    }
    context.restore();
    if (stroke) {
      if (!fill) {
        this.setShadowParams(context, t);
      }
      context.stroke();
    }
  }

  setShadowParams(context: CanvasRenderingContext2D, t: number): void {
    context.shadowColor = this.getColor('shadowColor', t, this.styles.shadowColor) as string;
    context.shadowOffsetX = this.getNumber('shadowOffsetX', t, this.styles.shadowOffsetX);
    context.shadowOffsetY = this.getNumber('shadowOffsetY', t, this.styles.shadowOffsetY);
    context.shadowBlur = this.getNumber('shadowBlur', t, this.styles.shadowBlur);
  }

  endDraw(context: CanvasRenderingContext2D): void {
    context.restore();
  }

  getNumber(prop: string, t: number, def: number): number {
    return valueParser.getNumber(this.props[prop], t, def);
  }

  getColor(prop: string, t: number, def: unknown): string & CanvasGradient {
    return colorParser.getColor(this.props[prop], t, def) as string & CanvasGradient;
  }

  getString<T = string>(prop: string, t: number, def: T): T {
    return valueParser.getString(this.props[prop], t, def);
  }

  getBool(prop: string, t: number, def: boolean): boolean {
    return valueParser.getBool(this.props[prop], t, def);
  }

  getArray(prop: string, t: number, def: number[]): number[] {
    return valueParser.getArray(this.props[prop], t, def);
  }

  getObject<T>(prop: string, t: number, def: T): T {
    return valueParser.getObject(this.props[prop], t, def);
  }
}

import type { ShapeType } from '../shape.js';

interface Point3D {
  x: number;
  y: number;
  z: number;
  sx?: number;
  sy?: number;
}

function makePoints(): Point3D[] {
  return [
    { x: -1, y: -1, z: -1 },
    { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
  ];
}

function scale(points: Point3D[], size: number): void {
  for (const p of points) {
    p.x *= size;
    p.y *= size;
    p.z *= size;
  }
}

function rotateX(points: Point3D[], angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (const p of points) {
    const y = p.y * cos - p.z * sin;
    const z = p.z * cos + p.y * sin;
    p.y = y;
    p.z = z;
  }
}

function rotateY(points: Point3D[], angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (const p of points) {
    const x = p.x * cos - p.z * sin;
    const z = p.z * cos + p.x * sin;
    p.x = x;
    p.z = z;
  }
}

function rotateZ(points: Point3D[], angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (const p of points) {
    const x = p.x * cos - p.y * sin;
    const y = p.y * cos + p.x * sin;
    p.x = x;
    p.y = y;
  }
}

function project(points: Point3D[], z: number): void {
  const fl = 300;
  for (const p of points) {
    const s = fl / (fl + p.z + z);
    p.sx = p.x * s;
    p.sy = p.y * s;
  }
}

export const cube: ShapeType = {
  draw(context, t) {
    const x = this.getNumber('x', t, 100);
    const y = this.getNumber('y', t, 100);
    const z = this.getNumber('z', t, 0);
    const size = this.getNumber('size', t, 100);
    const rotationX = (this.getNumber('rotationX', t, 0) * Math.PI) / 180;
    const rotationY = (this.getNumber('rotationY', t, 0) * Math.PI) / 180;
    const rotationZ = (this.getNumber('rotationZ', t, 0) * Math.PI) / 180;

    const points = makePoints();
    scale(points, size / 2);
    rotateX(points, rotationX);
    rotateY(points, rotationY);
    rotateZ(points, rotationZ);
    project(points, z);

    context.lineJoin = this.getString('lineJoin', t, 'round') as CanvasLineJoin;
    context.lineWidth = this.getNumber('lineWidth', t, 1);

    context.translate(x, y);

    context.moveTo(points[0].sx!, points[0].sy!);
    context.lineTo(points[1].sx!, points[1].sy!);
    context.lineTo(points[2].sx!, points[2].sy!);
    context.lineTo(points[3].sx!, points[3].sy!);
    context.lineTo(points[0].sx!, points[0].sy!);

    context.moveTo(points[4].sx!, points[4].sy!);
    context.lineTo(points[5].sx!, points[5].sy!);
    context.lineTo(points[6].sx!, points[6].sy!);
    context.lineTo(points[7].sx!, points[7].sy!);
    context.lineTo(points[4].sx!, points[4].sy!);

    context.moveTo(points[0].sx!, points[0].sy!);
    context.lineTo(points[4].sx!, points[4].sy!);

    context.moveTo(points[1].sx!, points[1].sy!);
    context.lineTo(points[5].sx!, points[5].sy!);

    context.moveTo(points[2].sx!, points[2].sy!);
    context.lineTo(points[6].sx!, points[6].sy!);

    context.moveTo(points[3].sx!, points[3].sy!);
    context.lineTo(points[7].sx!, points[7].sy!);

    this.setShadowParams(context, t);
    context.stroke();
  },
};

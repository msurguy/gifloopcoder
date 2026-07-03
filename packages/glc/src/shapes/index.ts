// Registry of all 22 shape types. Keys drive the generated renderList.addXxx
// methods (arcSegment -> addArcSegment, etc.). This restores grid and ray,
// which existed in the original GLC but were missing from the standalone build.

import { arcSegment } from './arcSegment.js';
import { arrow } from './arrow.js';
import { bezierCurve } from './bezierCurve.js';
import { bezierSegment } from './bezierSegment.js';
import { circle } from './circle.js';
import { cube } from './cube.js';
import { curve } from './curve.js';
import { curveSegment } from './curveSegment.js';
import { gear } from './gear.js';
import { grid } from './grid.js';
import { heart } from './heart.js';
import { line } from './line.js';
import { oval } from './oval.js';
import { path } from './path.js';
import { poly } from './poly.js';
import { ray } from './ray.js';
import { raySegment } from './raySegment.js';
import { rect } from './rect.js';
import { segment } from './segment.js';
import { spiral } from './spiral.js';
import { star } from './star.js';
import { text } from './text.js';

export const shapeTypes = {
  arcSegment,
  arrow,
  bezierCurve,
  bezierSegment,
  circle,
  cube,
  curve,
  curveSegment,
  gear,
  grid,
  heart,
  line,
  oval,
  path,
  poly,
  ray,
  raySegment,
  rect,
  segment,
  spiral,
  star,
  text,
};

export type ShapeTypeName = keyof typeof shapeTypes;

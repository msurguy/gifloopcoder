// The 20 original GLC example sketches, imported as raw source.

import allshapes from './sketches/allshapes.js?raw';
import arcSegments from './sketches/arcSegments.js?raw';
import bezierSegments from './sketches/bezierSegments.js?raw';
import circles from './sketches/circles.js?raw';
import cube from './sketches/cube.js?raw';
import funcs from './sketches/funcs.js?raw';
import gears from './sketches/gears.js?raw';
import grid from './sketches/grid.js?raw';
import gridlayout from './sketches/gridlayout.js?raw';
import hearts from './sketches/hearts.js?raw';
import phase from './sketches/phase.js?raw';
import poly from './sketches/poly.js?raw';
import rays from './sketches/rays.js?raw';
import rays2 from './sketches/rays2.js?raw';
import rects from './sketches/rects.js?raw';
import segments from './sketches/segments.js?raw';
import single from './sketches/single.js?raw';
import single2 from './sketches/single2.js?raw';
import spiral from './sketches/spiral.js?raw';
import spiral2 from './sketches/spiral2.js?raw';

export interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const EXAMPLES: Example[] = [
  { id: 'circles', title: 'Circles', description: 'Concentric circles with animated radii', code: circles },
  { id: 'poly', title: 'Polygons', description: 'Rotating polygons with animated sides', code: poly },
  { id: 'hearts', title: 'Hearts', description: 'A grid of pulsing hearts', code: hearts },
  { id: 'gears', title: 'Gears', description: 'Meshing gears turning in sync', code: gears },
  { id: 'spiral', title: 'Spiral', description: 'A rotating spiral', code: spiral },
  { id: 'spiral2', title: 'Spiral II', description: 'Spiral with animated turns', code: spiral2 },
  { id: 'rays', title: 'Rays', description: 'Radiating animated rays', code: rays },
  { id: 'rays2', title: 'Rays II', description: 'Ray variations', code: rays2 },
  { id: 'rects', title: 'Rectangles', description: 'Rotating rectangles', code: rects },
  { id: 'segments', title: 'Segments', description: 'Line segments traveling between points', code: segments },
  {
    id: 'arcSegments',
    title: 'Arc Segments',
    description: 'Arc segments orbiting on rings',
    code: arcSegments,
  },
  {
    id: 'bezierSegments',
    title: 'Bezier Segments',
    description: 'Segments gliding along bezier curves',
    code: bezierSegments,
  },
  { id: 'cube', title: 'Cube', description: 'A wireframe 3D cube', code: cube },
  { id: 'grid', title: 'Grid', description: 'Animated grid lines', code: grid },
  { id: 'gridlayout', title: 'Grid Layout', description: 'Shapes laid out on a grid', code: gridlayout },
  { id: 'funcs', title: 'Function Props', description: 'Animating with function-valued props', code: funcs },
  { id: 'phase', title: 'Phase', description: 'Phase-offset animation waves', code: phase },
  { id: 'single', title: 'Single Mode', description: 'One-way (non-bouncing) animation', code: single },
  { id: 'single2', title: 'Single Mode II', description: 'More one-way animation', code: single2 },
  { id: 'allshapes', title: 'All Shapes', description: 'A sampler of many shape types', code: allshapes },
];

export function getExample(id: string): Example | undefined {
  return EXAMPLES.find((e) => e.id === id);
}

export const DEFAULT_SKETCH = `function onGLC(glc) {
    glc.loop();
    glc.size(400, 400);
    // glc.setDuration(2);
    // glc.setFPS(30);
    // glc.setMode("single");
    // glc.setEasing(false);
    var list = glc.renderList,
        width = glc.w,
        height = glc.h,
        color = glc.color;

    // your code goes here:
    list.addCircle({
        x: width / 2,
        y: height / 2,
        radius: [50, 150],
        stroke: true,
        fill: false,
        lineWidth: 8,
        strokeStyle: color.animHSV(180, 300, 1, 1, 0.8, 0.9)
    });

    list.addStar({
        x: width / 2,
        y: height / 2,
        innerRadius: [15, 40],
        outerRadius: [40, 90],
        rotation: [0, 72],
        fillStyle: "#ffcc00"
    });
}
`;

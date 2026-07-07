import { Shape, type ShapeType } from './shape.js';
import type { Interpolation, ShapeProps, Styles } from './types.js';
import { shapeTypes } from './shapes/index.js';

// Generated add-methods: addCircle, addRect, ... one per registered shape type.
export type ShapeAddMethods = {
  [K in keyof typeof shapeTypes as `add${Capitalize<K & string>}`]: (props?: ShapeProps) => void;
};

/** A post-process hook run after all shapes draw; receives the 2D context, its
 * canvas, and the current t. Used to plug in the WebGL effects composer. */
export type PostProcessor = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, t: number) => void;

export interface RenderListBase {
  init(w: number, h: number, styles: Styles, interpolation: Interpolation): void;
  size(w: number, h: number): void;
  getCanvas(): HTMLCanvasElement;
  getContext(): CanvasRenderingContext2D;
  addShape(type: ShapeType, props?: ShapeProps): void;
  clear(): void;
  render(t: number): void;
  /** Register (or clear with null) a post-processing step run at the end of render(). */
  setPostProcessor(fn: PostProcessor | null): void;
}

export type RenderList = RenderListBase & ShapeAddMethods;

export function createRenderList(existingCanvas?: HTMLCanvasElement): RenderList {
  let canvas: HTMLCanvasElement | null = existingCanvas ?? null;
  let context: CanvasRenderingContext2D | null = null;
  let width = 0;
  let height = 0;
  const list: Shape[] = [];
  let styles: Styles | null = null;
  let interpolation: Interpolation | null = null;
  let postProcessor: PostProcessor | null = null;

  function init(w: number, h: number, stylesValue: Styles, interpolationValue: Interpolation): void {
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    width = canvas.width = w;
    height = canvas.height = h;
    context = canvas.getContext('2d')!;
    styles = stylesValue;
    interpolation = interpolationValue;
  }

  function size(w: number, h: number): void {
    width = canvas!.width = w;
    height = canvas!.height = h;
  }

  function addShape(type: ShapeType, props?: ShapeProps): void {
    const item = new Shape(type, props || {}, styles!, interpolation!);
    list.push(item);
    render(0);
  }

  function clear(): void {
    list.length = 0;
  }

  function render(t: number): void {
    if (!context || !styles) return;
    if (styles.backgroundColor === 'transparent') {
      context.clearRect(0, 0, width, height);
    } else {
      context.fillStyle = styles.backgroundColor;
      context.fillRect(0, 0, width, height);
    }
    for (let i = 0; i < list.length; i++) {
      list[i].render(context, t);
    }
    // Post-processing runs after all shapes so it can operate on the whole
    // frame; when no processor is set this path is skipped entirely.
    if (postProcessor) {
      postProcessor(context, canvas!, t);
    }
  }

  function setPostProcessor(fn: PostProcessor | null): void {
    postProcessor = fn;
  }

  const renderList = {
    init,
    size,
    getCanvas: () => canvas!,
    getContext: () => context!,
    addShape,
    clear,
    render,
    setPostProcessor,
  } as RenderList;

  // Generate addCircle, addRect, ... from the shape registry.
  for (const key of Object.keys(shapeTypes) as (keyof typeof shapeTypes)[]) {
    const methodName = ('add' + key[0].toUpperCase() + key.slice(1)) as keyof ShapeAddMethods;
    (renderList as unknown as Record<string, unknown>)[methodName] = (props?: ShapeProps) =>
      addShape(shapeTypes[key], props);
  }

  return renderList;
}

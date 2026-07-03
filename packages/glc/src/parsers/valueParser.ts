// Resolves the four animated-prop forms (constant | [start,end] | keyframes | fn(t)).
// Logic ported verbatim from the original valueParser to preserve sketch behavior.

export function getNumber(prop: unknown, t: number, def: number): number {
  if (typeof prop === 'number') {
    return prop;
  } else if (typeof prop === 'function') {
    return (prop as (t: number) => number)(t);
  } else if (prop && (prop as unknown[]).length === 2) {
    const arr = prop as [number, number];
    const start = arr[0];
    const end = arr[1];
    return start + (end - start) * t;
  } else if (prop && (prop as unknown[]).length) {
    const arr = prop as number[];
    return arr[Math.round(t * (arr.length - 1))];
  }
  return def;
}

export function getString<T = string>(prop: unknown, t: number, def: T): T {
  if (prop === undefined) {
    return def;
  } else if (typeof prop === 'string') {
    return prop as T;
  } else if (typeof prop === 'function') {
    return (prop as (t: number) => T)(t);
  } else if (prop && (prop as unknown[]).length) {
    const arr = prop as T[];
    return arr[Math.round(t * (arr.length - 1))];
  }
  return prop as T;
}

export function getBool(prop: unknown, t: number, def: boolean): boolean {
  if (prop === undefined) {
    return def;
  } else if (typeof prop === 'function') {
    return (prop as (t: number) => boolean)(t);
  } else if (prop && (prop as unknown[]).length) {
    const arr = prop as boolean[];
    return arr[Math.round(t * (arr.length - 1))];
  }
  return prop as boolean;
}

export function getArray(prop: unknown, t: number, def: number[]): number[] {
  // string will have length, but is useless
  if (typeof prop === 'string') {
    return def;
  } else if (typeof prop === 'function') {
    return (prop as (t: number) => number[])(t);
  } else if (
    prop &&
    (prop as unknown[]).length === 2 &&
    (prop as unknown[][])[0]?.length &&
    (prop as unknown[][])[1]?.length
  ) {
    // we seem to have an array of arrays: lerp element-wise
    const arr0 = (prop as number[][])[0];
    const arr1 = (prop as number[][])[1];
    const len = Math.min(arr0.length, arr1.length);
    const result: number[] = [];
    for (let i = 0; i < len; i++) {
      const v0 = arr0[i];
      const v1 = arr1[i];
      result.push(v0 + (v1 - v0) * t);
    }
    return result;
  } else if (prop && (prop as unknown[]).length > 1) {
    return prop as number[];
  }
  return def;
}

export function getObject<T>(prop: unknown, t: number, def: T): T {
  if (prop === undefined) {
    return def;
  } else if (typeof prop === 'function') {
    return (prop as (t: number) => T)(t);
  } else if (prop && (prop as unknown[]).length) {
    const arr = prop as T[];
    return arr[Math.round(t * (arr.length - 1))];
  }
  return prop as T;
}

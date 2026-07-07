// Effect-chain state helpers. The panel's state IS the serializable
// EffectConfig[] shipped into the sandbox; these helpers produce new arrays
// (immutable) so zustand/React updates stay cheap.

import { defaultEffectOptions, type BuiltinEffectName, type EffectOptionValue } from 'gifloopcoder';
import type { EffectConfig } from '../sandbox/protocol';

export const DEFAULT_EFFECTS: EffectConfig[] = [];

/** Appends an effect with fully-populated defaults from its meta. */
export function addEffect(list: EffectConfig[], type: BuiltinEffectName): EffectConfig[] {
  return [...list, { type, options: defaultEffectOptions(type) }];
}

export function removeEffect(list: EffectConfig[], index: number): EffectConfig[] {
  return list.filter((_, i) => i !== index);
}

/** Moves the effect at `index` by `delta` (-1 up / +1 down), clamped. */
export function moveEffect(list: EffectConfig[], index: number, delta: -1 | 1): EffectConfig[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function setEffectOption(
  list: EffectConfig[],
  index: number,
  key: string,
  value: EffectOptionValue
): EffectConfig[] {
  return list.map((cfg, i) => {
    if (i !== index || cfg.type === 'shader') return cfg;
    return { ...cfg, options: { ...cfg.options, [key]: value } };
  });
}

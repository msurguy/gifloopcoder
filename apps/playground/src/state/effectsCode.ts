// Bidirectional sync between the Settings/Effects panels and the sketch source.
//
// The panels own a marker-delimited `onGLCPanel(glc)` block appended to the
// sketch: a settings snapshot (size/fps/duration/mode/easing/maxColors)
// followed by the effect chain. The sandbox runtime calls it after onGLC, so
// panel values win over inline sketch calls and everything is part of the code
// itself — share links, saved projects, and plain copy/paste carry it all.
// Panel edits regenerate the block; loading/running code parses the effects
// back into the panel (settings sync back via the runtime's post-run report).
// Anything a sketch does inside onGLC is code-owned and never touched here.

import { builtinPasses, type BuiltinEffectName, type EffectOptionValue } from 'gifloopcoder';
import type { EffectConfig, SketchSettings } from '../sandbox/protocol';

const BEGIN_MARKER = '// ─ Settings & effects: managed by the panels ─';
const WARN_LINE = '// (edits below are overwritten by the panels)';
const END_MARKER = '// ─ end managed block ─';

// Legacy markers from the effects-only era of the block; still parsed and
// replaced, but new blocks are always written with the current markers.
const LEGACY_BEGIN = '// ─ Effects: managed by the Effects panel ─';
const LEGACY_END = '// ─ end effects ─';

const BLOCK_RE = new RegExp(
  `\\n*(?:${BEGIN_MARKER}|${LEGACY_BEGIN})[\\s\\S]*?(?:${END_MARKER}|${LEGACY_END})\\n?`,
  'u'
);

function serializeValue(value: EffectOptionValue): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.join(', ') + ']';
  return String(value);
}

function serializeOptions(options: Record<string, EffectOptionValue> | undefined): string {
  const entries = Object.entries(options ?? {});
  if (entries.length === 0) return '';
  return ', { ' + entries.map(([k, v]) => `${k}: ${serializeValue(v)}`).join(', ') + ' }';
}

function settingsLines(settings: SketchSettings): string[] {
  return [
    `  glc.size(${settings.w}, ${settings.h});`,
    `  glc.setFPS(${settings.fps});`,
    `  glc.setDuration(${settings.duration});`,
    `  glc.setMode(${JSON.stringify(settings.mode)});`,
    `  glc.setEasing(${settings.easing});`,
    `  glc.setMaxColors(${settings.maxColors});`,
  ];
}

/** Renders the managed block source (settings snapshot + effect chain). */
export function panelToCode(settings: SketchSettings, effects: EffectConfig[]): string {
  const effectLines = effects.map((cfg) => {
    if (cfg.type === 'shader') {
      const uniforms = cfg.uniforms ? `, uniforms: ${JSON.stringify(cfg.uniforms)}` : '';
      return `  glc.effects.addShader({ fragment: ${JSON.stringify(cfg.fragment)}${uniforms} });`;
    }
    return `  glc.effects.add(${JSON.stringify(cfg.type)}${serializeOptions(cfg.options)});`;
  });
  return [
    BEGIN_MARKER,
    WARN_LINE,
    'function onGLCPanel(glc) {',
    ...settingsLines(settings),
    ...effectLines,
    '}',
    END_MARKER,
  ].join('\n');
}

/** Replaces (or appends) the managed block in the sketch source. */
export function replacePanelBlock(code: string, settings: SketchSettings, effects: EffectConfig[]): string {
  const stripped = code.replace(BLOCK_RE, '\n').replace(/\s+$/, '');
  return stripped + '\n\n' + panelToCode(settings, effects) + '\n';
}

const ADD_RE = /glc\.effects\.add\(\s*["']([A-Za-z]+)["']\s*(?:,\s*(\{[^{}]*\}))?\s*\)/g;
// Options literal with at most one level of nesting (shader uniforms objects).
const SHADER_RE = /glc\.effects\.addShader\(\s*(\{(?:[^{}]|\{[^{}]*\})*\})\s*\)\s*;/g;

/** Converts our generated (or lightly hand-edited) options literal to JSON. */
function optionsToJson(literal: string): Record<string, EffectOptionValue> | null {
  const json = literal
    .replace(/'([^']*)'/g, (_m, s: string) => JSON.stringify(s)) // single → double quotes
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":') // quote bare keys
    .replace(/,\s*}/g, ' }'); // tolerate trailing commas
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, EffectOptionValue>;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Parses the managed block back into a chain.
 * - No block in the code → [] (panel clears — the code is the source of truth).
 * - Block present but unparseable (hand-edited beyond recognition) → null
 *   (leave the panel alone rather than clobber it with a partial read).
 */
export function parseEffectsBlock(code: string): EffectConfig[] | null {
  const match = BLOCK_RE.exec(code);
  if (!match) return [];
  const block = match[0];

  // Collect add() and addShader() calls together, sorted by source position,
  // so the parsed chain preserves the order written in the block.
  const found: { index: number; config: EffectConfig }[] = [];

  for (const m of block.matchAll(ADD_RE)) {
    const type = m[1];
    if (!(type in builtinPasses)) return null;
    let config: EffectConfig;
    if (m[2]) {
      const options = optionsToJson(m[2]);
      if (options === null) return null;
      config = { type: type as BuiltinEffectName, options };
    } else {
      config = { type: type as BuiltinEffectName };
    }
    found.push({ index: m.index, config });
  }

  // addShader entries round-trip as opaque shader configs (the panel shows
  // them as "Custom shader" with reorder/remove only).
  for (const m of block.matchAll(SHADER_RE)) {
    const options = optionsToJson(m[1].replace(/\n/g, ' '));
    if (options === null || typeof options.fragment !== 'string') return null;
    found.push({
      index: m.index,
      config: {
        type: 'shader',
        fragment: options.fragment,
        uniforms: options.uniforms as unknown as Record<string, number | number[]> | undefined,
      },
    });
  }

  // Zero effect calls is legitimate — the block may hold only the settings
  // snapshot. (Unparseable matched calls returned null above instead.)
  return found.sort((a, b) => a.index - b.index).map((f) => f.config);
}

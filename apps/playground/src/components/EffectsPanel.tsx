// Metadata-driven effect-stack builder. An "Add effect" selector (grouped by
// category) appends to an ordered chain; every entry renders its controls from
// gifloopcoder's effectMeta — zero per-effect UI code here. Changes flow up as
// a new EffectConfig[] via onChange (the same list shipped into the sandbox).

import { useState } from 'react';
import { Divider } from '@astryxdesign/core/Divider';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Selector } from '@astryxdesign/core/Selector';
import { Slider } from '@astryxdesign/core/Slider';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import {
  EFFECT_CATEGORIES,
  effectMeta,
  type BuiltinEffectName,
  type EffectOptionValue,
  type EffectParamMeta,
} from 'gifloopcoder';
import type { EffectConfig } from '../sandbox/protocol';
import { addEffect, moveEffect, removeEffect, setEffectOption } from '../state/effects';
import { formatSliderValue, snapToStep } from './sliderFormat';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }}
    >
      <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UpIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3.5 10 8 5.5l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3.5 6 8 10.5 12.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

const HEX_RE = /^#?([0-9a-f]{6})$/i;

/** Hex color input that only commits valid #rrggbb values. */
function ColorParamControl({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onCommit: (hex: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value;
  const valid = HEX_RE.test(shown);

  return (
    <TextInput
      label={label}
      value={shown}
      size="sm"
      isDisabled={disabled}
      placeholder="#rrggbb"
      status={valid ? undefined : { type: 'error', message: 'Use #rrggbb' }}
      onChange={(text: string) => {
        setDraft(text);
        const m = HEX_RE.exec(text);
        if (m) {
          onCommit('#' + m[1].toLowerCase());
          setDraft(null);
        }
      }}
    />
  );
}

function ParamControl({
  param,
  value,
  disabled,
  onChange,
}: {
  param: EffectParamMeta;
  value: EffectOptionValue | undefined;
  disabled?: boolean;
  onChange: (value: EffectOptionValue) => void;
}) {
  // Animated values (tuples/keyframes from code, e.g. `angle: [0, 3.5]`) are
  // shown read-only so a slider tick can't silently flatten the animation —
  // they're edited in the code block instead.
  if (param.kind === 'number' && Array.isArray(value)) {
    return (
      <Text type="supporting" color="secondary">
        {param.label}: animated [{value.join(' → ')}] — edit in code
      </Text>
    );
  }

  switch (param.kind) {
    case 'number':
      return (
        <Slider
          label={param.label}
          min={param.min}
          max={param.max}
          step={param.step}
          valueDisplay="text"
          formatValue={(v: number) => formatSliderValue(v, param.step)}
          isDisabled={disabled}
          value={typeof value === 'number' ? value : param.default}
          onChange={(v: number) => onChange(snapToStep(v, param.step))}
        />
      );
    case 'boolean':
      return (
        <Switch
          label={param.label}
          isDisabled={disabled}
          value={typeof value === 'boolean' ? value : param.default}
          onChange={(v: boolean) => onChange(v)}
        />
      );
    case 'enum':
      return (
        <Selector
          label={param.label}
          size="sm"
          isDisabled={disabled}
          options={param.options as string[]}
          value={typeof value === 'string' ? value : param.default}
          onChange={(v: string) => onChange(v)}
        />
      );
    case 'color':
      return (
        <ColorParamControl
          label={param.label}
          disabled={disabled}
          value={typeof value === 'string' ? value : param.default}
          onCommit={onChange}
        />
      );
  }
}

export interface EffectsPanelProps {
  effects: EffectConfig[];
  onChange: (effects: EffectConfig[]) => void;
  /** False when the browser has no WebGL2 — the panel is shown disabled. */
  supported?: boolean;
}

export function EffectsPanel({ effects, onChange, supported = true }: EffectsPanelProps) {
  // Single-expanded accordion keeps the small sidebar scannable.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // Remount key so the "Add effect" selector never retains a selection.
  const [addCount, setAddCount] = useState(0);

  const addOptions = EFFECT_CATEGORIES.map((cat) => ({
    type: 'section' as const,
    title: cat,
    options: (Object.keys(effectMeta) as BuiltinEffectName[])
      .filter((name) => effectMeta[name].category === cat)
      .map((name) => ({ value: name, label: effectMeta[name].label })),
  }));

  function handleAdd(name: string) {
    onChange(addEffect(effects, name as BuiltinEffectName));
    setExpandedIndex(effects.length); // the appended item
    setAddCount((n) => n + 1);
  }

  function handleMove(index: number, delta: -1 | 1) {
    onChange(moveEffect(effects, index, delta));
    // Expansion follows the moved item.
    if (expandedIndex === index) setExpandedIndex(index + delta);
    else if (expandedIndex === index + delta) setExpandedIndex(index);
  }

  function handleRemove(index: number) {
    onChange(removeEffect(effects, index));
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  }

  return (
    <VStack gap={2} data-testid="effects-panel">
      {!supported && (
        <Text type="supporting" color="secondary">
          WebGL2 isn’t available in this browser, so effects can’t run here.
        </Text>
      )}

      <Selector
        key={addCount}
        label="Add effect"
        isLabelHidden
        placeholder="+ Add effect…"
        size="sm"
        hasSearch
        isDisabled={!supported}
        options={addOptions}
        value={undefined}
        onChange={handleAdd}
      />

      {effects.length === 0 && (
        <Text type="supporting" color="secondary">
          No effects — add one above, or call glc.effects.add() in your sketch.
        </Text>
      )}

      {effects.map((cfg, i) => {
        const meta = cfg.type !== 'shader' ? effectMeta[cfg.type] : undefined;
        const open = expandedIndex === i;
        const label = meta?.label ?? (cfg.type === 'shader' ? 'Custom shader' : cfg.type);
        return (
          <VStack key={i} gap={2} data-testid="effect-chain-item">
            {i > 0 && <Divider />}
            <HStack gap={1} vAlign="center" justify="between">
              <HStack gap={1} vAlign="center" style={{ minWidth: 0 }}>
                <IconButton
                  label={open ? `Collapse ${label}` : `Expand ${label}`}
                  icon={<ChevronIcon open={open} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedIndex(open ? null : i)}
                />
                <Text type="label" maxLines={1}>
                  {label}
                </Text>
              </HStack>
              <HStack gap={1} vAlign="center">
                <IconButton
                  label={`Move ${label} up`}
                  icon={<UpIcon />}
                  variant="ghost"
                  size="sm"
                  isDisabled={i === 0}
                  onClick={() => handleMove(i, -1)}
                />
                <IconButton
                  label={`Move ${label} down`}
                  icon={<DownIcon />}
                  variant="ghost"
                  size="sm"
                  isDisabled={i === effects.length - 1}
                  onClick={() => handleMove(i, 1)}
                />
                <IconButton
                  label={`Remove ${label}`}
                  icon={<RemoveIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(i)}
                />
              </HStack>
            </HStack>
            {open && meta && cfg.type !== 'shader' && (
              <VStack gap={2} style={{ paddingLeft: 'var(--spacing-4)' }}>
                {meta.params.map((param) => (
                  <ParamControl
                    key={param.key}
                    param={param}
                    disabled={!supported}
                    value={cfg.options?.[param.key]}
                    onChange={(value) => onChange(setEffectOption(effects, i, param.key, value))}
                  />
                ))}
              </VStack>
            )}
            {open && !meta && (
              <Text type="supporting" color="secondary">
                This effect has no editable parameters here.
              </Text>
            )}
          </VStack>
        );
      })}
    </VStack>
  );
}

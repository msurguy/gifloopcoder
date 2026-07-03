// Animation settings: canvas size, duration, fps, interpolation mode, easing,
// GIF max colors. Changes apply live to the running sketch and are re-applied
// on the next run.

import { HStack, VStack } from '@astryxdesign/core/Layout';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import type { SketchSettings } from '../sandbox/protocol';

export interface SettingsPanelProps {
  settings: SketchSettings;
  onChange: (patch: Partial<SketchSettings>) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <VStack gap={3}>
      <HStack gap={2}>
        <NumberInput
          label="Width"
          value={settings.w}
          min={16}
          max={2048}
          step={10}
          units="px"
          size="sm"
          onChange={(w) => onChange({ w })}
        />
        <NumberInput
          label="Height"
          value={settings.h}
          min={16}
          max={2048}
          step={10}
          units="px"
          size="sm"
          onChange={(h) => onChange({ h })}
        />
      </HStack>
      <HStack gap={2}>
        <NumberInput
          label="Duration"
          value={settings.duration}
          min={0.2}
          max={30}
          step={0.5}
          units="s"
          size="sm"
          onChange={(duration) => onChange({ duration })}
        />
        <NumberInput
          label="FPS"
          value={settings.fps}
          min={1}
          max={60}
          step={1}
          size="sm"
          isIntegerOnly
          onChange={(fps) => onChange({ fps })}
        />
      </HStack>
      <HStack gap={2} vAlign="end">
        <Selector
          label="Mode"
          size="sm"
          options={[
            { value: 'bounce', label: 'Bounce (out and back)' },
            { value: 'single', label: 'Single (one way)' },
          ]}
          value={settings.mode}
          onChange={(mode) => onChange({ mode: mode as 'bounce' | 'single' })}
        />
        <NumberInput
          label="Max colors"
          labelTooltip="Palette size for GIF export (2-256)"
          value={settings.maxColors}
          min={2}
          max={256}
          step={2}
          size="sm"
          isIntegerOnly
          onChange={(maxColors) => onChange({ maxColors })}
        />
      </HStack>
      <Switch label="Easing" value={settings.easing} onChange={(easing) => onChange({ easing })} />
    </VStack>
  );
}

// Playback controls: loop / play once / stop, plus a scrubber over t (0..1).

import { HStack } from '@astryxdesign/core/Layout';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Slider } from '@astryxdesign/core/Slider';
import { Text } from '@astryxdesign/core/Text';

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M4 2.5v11l9-5.5-9-5.5z" />
    </svg>
  );
}

function LoopIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 8a5.5 5.5 0 0 1 9.6-3.6M13.5 8a5.5 5.5 0 0 1-9.6 3.6" />
      <path d="M12.5 1.5v3h-3M3.5 14.5v-3h3" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <rect x="3.5" y="3.5" width="9" height="9" rx="1" />
    </svg>
  );
}

export interface TransportBarProps {
  playing: boolean;
  t: number;
  onLoop: () => void;
  onPlayOnce: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (t: number) => void;
}

export function TransportBar({ playing, t, onLoop, onPlayOnce, onPause, onStop, onSeek }: TransportBarProps) {
  return (
    <HStack gap={2} vAlign="center" style={{ width: '100%' }}>
      {playing ? (
        <IconButton label="Pause" tooltip="Pause" icon={<PauseIcon />} variant="ghost" size="sm" onClick={onPause} />
      ) : (
        <IconButton label="Loop" tooltip="Play looping" icon={<LoopIcon />} variant="ghost" size="sm" onClick={onLoop} />
      )}
      <IconButton
        label="Play once"
        tooltip="Play once"
        icon={<PlayIcon />}
        variant="ghost"
        size="sm"
        onClick={onPlayOnce}
      />
      <IconButton label="Stop" tooltip="Stop and rewind" icon={<StopIcon />} variant="ghost" size="sm" onClick={onStop} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Slider
          label="Timeline"
          isLabelHidden
          value={Math.round(t * 1000)}
          min={0}
          max={999}
          step={1}
          valueDisplay="none"
          onChange={(value: number) => onSeek(value / 1000)}
        />
      </div>
      <Text type="code" size="xsm" color="secondary" hasTabularNumbers>
        t={t.toFixed(2)}
      </Text>
    </HStack>
  );
}

// Console output captured from the sandbox (console.* calls and sketch errors).

import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import type { ConsoleEntry } from '../state/store';

const LEVEL_COLOR: Record<ConsoleEntry['level'], string> = {
  log: 'var(--color-text-primary)',
  info: 'var(--color-text-secondary)',
  warn: 'var(--color-text-warning, #b58a00)',
  error: 'var(--color-text-error, #d33)',
};

export function ConsoleDrawer({ entries, onClear }: { entries: ConsoleEntry[]; onClear: () => void }) {
  return (
    <VStack gap={1} style={{ minHeight: 0 }}>
      <HStack gap={2} vAlign="center" justify="between">
        <Text type="label" color="secondary">
          Console
        </Text>
        <Button label="Clear" variant="ghost" size="sm" onClick={onClear} />
      </HStack>
      <div
        data-testid="console-output"
        style={{
          overflowY: 'auto',
          maxHeight: 140,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          padding: 'var(--spacing-1) 0',
        }}
      >
        {entries.length === 0 ? (
          <Text type="supporting" color="secondary">
            console.log output from your sketch appears here.
          </Text>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ color: LEVEL_COLOR[entry.level], whiteSpace: 'pre-wrap' }}>
              {entry.level !== 'log' ? `[${entry.level}] ` : ''}
              {entry.text}
            </div>
          ))
        )}
      </div>
    </VStack>
  );
}

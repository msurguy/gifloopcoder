// Share the current sketch as a compressed URL.

import { useState } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter, VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';

export interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

export function ShareDialog({ isOpen, onOpenChange, url }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={480}>
      <Layout
        header={<DialogHeader title="Share this loop" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={2}>
              <Text type="body">
                Anyone with this link gets your code and settings as their starting point. The whole
                sketch is encoded in the URL — nothing is uploaded.
              </Text>
              <div
                data-testid="share-url"
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  wordBreak: 'break-all',
                  padding: 'var(--spacing-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-inner)',
                  maxHeight: 96,
                  overflowY: 'auto',
                  userSelect: 'all',
                }}
              >
                {url}
              </div>
              <Text type="supporting" color="secondary">
                {url.length.toLocaleString()} characters
              </Text>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end" style={{ width: '100%' }}>
              <Button label="Close" variant="ghost" onClick={() => onOpenChange(false)} />
              <Button
                label={copied ? 'Copied!' : 'Copy link'}
                variant="primary"
                clickAction={async () => {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

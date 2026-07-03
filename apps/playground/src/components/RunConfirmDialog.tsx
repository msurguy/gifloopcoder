// Shown when the app is opened with someone else's share link: the code is
// displayed read-only and nothing executes until the user opts in. The sandbox
// already isolates execution; this adds informed consent on top.

import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter, VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { CodeBlock } from '@astryxdesign/core/CodeBlock';

export interface RunConfirmDialogProps {
  isOpen: boolean;
  code: string;
  title?: string;
  onAccept: () => void;
  onReject: () => void;
}

export function RunConfirmDialog({ isOpen, code, title, onAccept, onReject }: RunConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onReject()} width={640} purpose="required">
      <Layout
        header={
          <DialogHeader
            title={title ? `Shared sketch: ${title}` : 'Someone shared a sketch with you'}
            onOpenChange={(open) => !open && onReject()}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={2}>
              <Text type="body">
                This link contains GLC sketch code. Review it below — it runs in a sandboxed frame,
                but only run code you trust.
              </Text>
              <CodeBlock code={code} language="javascript" maxHeight={320} />
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end" style={{ width: '100%' }}>
              <Button label="Discard" variant="ghost" onClick={onReject} />
              <Button label="Load and run" variant="primary" onClick={onAccept} />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

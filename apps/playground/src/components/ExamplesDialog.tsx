// Example gallery. Thumbnails are rendered live by a hidden sandbox iframe
// (one example at a time) and cached for the session — no prebuilt images.

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Text } from '@astryxdesign/core/Text';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { EXAMPLES, type Example } from '../examples';
import { DEFAULT_SETTINGS } from '../sandbox/protocol';
import { SandboxFrame, type SandboxAPI } from '../sandbox/SandboxHost';

const thumbnailCache = new Map<string, string>();

export interface ExamplesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (example: Example) => void;
}

export function ExamplesDialog({ isOpen, onOpenChange, onPick }: ExamplesDialogProps) {
  const [thumbs, setThumbs] = useState<Record<string, string>>(() => Object.fromEntries(thumbnailCache));
  const farmRef = useRef<SandboxAPI | null>(null);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || generatingRef.current) return;
    const missing = EXAMPLES.filter((e) => !thumbnailCache.has(e.id));
    if (missing.length === 0) return;
    generatingRef.current = true;
    let canceled = false;

    (async () => {
      for (const example of missing) {
        if (canceled) break;
        const farm = farmRef.current;
        if (!farm) break;
        try {
          const result = await farm.run(example.code, { ...DEFAULT_SETTINGS }, 'none');
          if (!result.ok) continue;
          const dataUrl = await farm.snapshot(0.25, 220);
          thumbnailCache.set(example.id, dataUrl);
          if (!canceled) setThumbs(Object.fromEntries(thumbnailCache));
        } catch {
          // sandbox reloaded mid-generation; skip
        }
      }
      generatingRef.current = false;
    })();

    return () => {
      canceled = true;
      generatingRef.current = false;
    };
  }, [isOpen, thumbs]);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={720} maxHeight="85vh">
      <Layout
        header={<DialogHeader title="Examples" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            {isOpen && (
              <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }} aria-hidden>
                <SandboxFrame ref={farmRef} title="Thumbnail renderer" />
              </div>
            )}
            <Grid columns={{ minWidth: 180 }} gap={3}>
              {EXAMPLES.map((example) => (
                <ClickableCard
                  key={example.id}
                  label={`Load example: ${example.title}`}
                  padding={2}
                  onClick={() => {
                    onPick(example);
                    onOpenChange(false);
                  }}
                >
                  <VStack gap={1}>
                    {thumbs[example.id] ? (
                      <img
                        src={thumbs[example.id]}
                        alt={`${example.title} preview`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-inner)',
                        }}
                      />
                    ) : (
                      <Skeleton width="100%" height={140} radius={2} />
                    )}
                    <Text type="label">{example.title}</Text>
                    <Text type="supporting" color="secondary" maxLines={2}>
                      {example.description}
                    </Text>
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// Export dialog: choose a format (availability gated by WebCodecs capability
// detection), tune GIF options, watch progress, download the result.

import { useMemo, useState } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter, VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import type { ExportFormat, ExportSupportInfo, SketchSettings } from '../sandbox/protocol';
import type { ExportJob } from '../state/store';

export interface ExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  support: ExportSupportInfo | null;
  settings: SketchSettings;
  job: ExportJob | null;
  onExport: (format: ExportFormat, options: { paletteMode?: 'per-frame' | 'global' | 'auto'; transparent?: boolean }) => void;
  onCancel: () => void;
}

export function ExportDialog({ isOpen, onOpenChange, support, settings, job, onExport, onCancel }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('gif');
  const [paletteMode, setPaletteMode] = useState<'auto' | 'per-frame' | 'global'>('auto');
  const [transparent, setTransparent] = useState(false);

  const frames = Math.round(settings.duration * settings.fps);
  const running = job?.status === 'running';

  const options = useMemo(
    () => [
      { value: 'gif', label: 'Animated GIF' },
      {
        value: 'webm',
        label: support && !support.webm ? 'WebM video (not supported by this browser)' : 'WebM video',
        disabled: !!support && !support.webm,
      },
      {
        value: 'mp4',
        label: support && !support.mp4 ? 'MP4 video (not supported by this browser)' : 'MP4 (H.264) video',
        disabled: !!support && !support.mp4,
      },
      { value: 'png', label: 'PNG still (current frame)' },
      { value: 'png-sequence', label: 'PNG sequence (.zip)' },
    ],
    [support]
  );

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={440}>
      <Layout
        header={<DialogHeader title="Export animation" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={3}>
              <Selector
                label="Format"
                options={options}
                value={format}
                onChange={(value) => setFormat(value as ExportFormat)}
                isDisabled={running}
              />
              {format === 'gif' && (
                <>
                  <Selector
                    label="Palette"
                    description="Global palette gives smaller, steadier files; per-frame gives best color fidelity."
                    options={[
                      { value: 'auto', label: 'Auto (per-frame, global for long loops)' },
                      { value: 'per-frame', label: 'Per-frame palette' },
                      { value: 'global', label: 'Global palette' },
                    ]}
                    value={paletteMode}
                    onChange={(value) => setPaletteMode(value as typeof paletteMode)}
                    isDisabled={running}
                  />
                  <Switch
                    label="Transparent background"
                    description='Requires styles.backgroundColor = "transparent" in the sketch'
                    value={transparent}
                    onChange={setTransparent}
                    isDisabled={running}
                  />
                </>
              )}
              <Text type="supporting" color="secondary">
                {frames} frames · {settings.w}×{settings.h} px · {settings.fps} fps ·{' '}
                {settings.duration.toFixed(1)}s loop
              </Text>
              {support && !support.webm && !support.mp4 && (
                <Banner
                  status="info"
                  title="Video export unavailable"
                  description="This browser lacks WebCodecs video encoding. GIF and PNG export always work."
                />
              )}
              {running && (
                <VStack gap={1}>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round((job?.progress ?? 0) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: 'var(--color-border)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round((job?.progress ?? 0) * 100)}%`,
                        background: 'var(--color-text-accent)',
                        transition: 'width 120ms linear',
                      }}
                    />
                  </div>
                  <Text type="supporting" color="secondary">
                    Rendering… {Math.round((job?.progress ?? 0) * 100)}%
                  </Text>
                </VStack>
              )}
              {job?.status === 'error' && (
                <Banner status="error" title="Export failed" description={job.message ?? 'Unknown error'} />
              )}
              {job?.status === 'done' && (
                <Banner status="success" title="Export complete" description={job.message ?? 'Downloaded.'} />
              )}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end" style={{ width: '100%' }}>
              {running ? (
                <Button label="Cancel export" variant="destructive" onClick={onCancel} />
              ) : (
                <>
                  <Button label="Close" variant="ghost" onClick={() => onOpenChange(false)} />
                  <Button
                    label={`Export ${format === 'png-sequence' ? 'PNG sequence' : format.toUpperCase()}`}
                    variant="primary"
                    onClick={() => onExport(format, { paletteMode, transparent })}
                  />
                </>
              )}
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Layout, LayoutContent, LayoutHeader, LayoutPanel, HStack, VStack } from '@astryxdesign/core/Layout';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Divider } from '@astryxdesign/core/Divider';

import { useStore } from './state/store';
import { useRoute, navigate } from './router';
import { SandboxFrame, type SandboxAPI } from './sandbox/SandboxHost';
import type { ExportFormat, SketchSettings } from './sandbox/protocol';
import { EditorPane } from './components/EditorPane';
import { TransportBar } from './components/TransportBar';
import { SettingsPanel } from './components/SettingsPanel';
import { ConsoleDrawer } from './components/ConsoleDrawer';
import { ExportDialog } from './components/ExportDialog';
import { ExamplesDialog } from './components/ExamplesDialog';
import { ShareDialog } from './components/ShareDialog';
import { ProjectsDialog } from './components/ProjectsDialog';
import { RunConfirmDialog } from './components/RunConfirmDialog';
import { DocsView } from './components/DocsView';
import { getExample } from './examples';
import { decodeShare, shareUrl, type SharePayload } from './share';
import { loadDraft, saveDraft, saveProject, type Project } from './projects';

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
      <rect width="32" height="32" rx="6" fill="var(--color-text-primary)" />
      <path
        d="M8 16a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0Zm7 0a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0Z"
        fill="none"
        stroke="var(--color-background-surface)"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function App() {
  const route = useRoute();
  const sandboxRef = useRef<SandboxAPI | null>(null);

  const code = useStore((s) => s.code);
  const settings = useStore((s) => s.settings);
  const playing = useStore((s) => s.playing);
  const t = useStore((s) => s.t);
  const consoleEntries = useStore((s) => s.consoleEntries);
  const runError = useStore((s) => s.runError);
  const support = useStore((s) => s.support);
  const exportJob = useStore((s) => s.exportJob);
  const currentTitle = useStore((s) => s.currentTitle);

  const [examplesOpen, setExamplesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [pendingShare, setPendingShare] = useState<SharePayload | null>(null);
  const [mobileTab, setMobileTab] = useState<'code' | 'preview'>('code');
  const [shareLink, setShareLink] = useState('');

  const editorSplit = useResizable({ defaultSize: '50%', minSizePx: 280, autoSaveId: 'glc-editor-split' });
  const bootedRef = useRef(false);
  const supportProbedRef = useRef(false);

  const runSketch = useCallback(async (codeOverride?: string, settingsOverride?: SketchSettings) => {
    const state = useStore.getState();
    const runCode = codeOverride ?? state.code;
    const runSettings = settingsOverride ?? state.settings;
    state.clearConsole();
    state.setRunError(null);
    const sandbox = sandboxRef.current;
    if (!sandbox) return undefined;
    const result = await sandbox.run(runCode, runSettings, 'loop');
    if (!result.ok) {
      useStore.getState().setRunError(result.error ?? 'Unknown error');
      useStore.getState().setPlaying(false);
      return result;
    }
    if (result.settings) {
      // Reflect settings the sketch itself changed (glc.setDuration etc.).
      useStore.setState({ settings: result.settings });
    }
    if (!supportProbedRef.current) {
      supportProbedRef.current = true;
      sandbox
        .detectSupport()
        .then((s) => useStore.getState().setSupport(s))
        .catch(() => {
          supportProbedRef.current = false;
        });
    }
    return result;
  }, []);

  // Width/height are commonly captured as plain locals at the top of onGLC,
  // so a pure live-resize leaves layout math stale. Re-run the sketch after a
  // pause in dragging/typing, then restore playback position so it doesn't
  // feel like the preview jumped back to the start.
  const resizeRerunTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reRunPreservingPlayback = useCallback(async () => {
    const state = useStore.getState();
    const wasPlaying = state.playing;
    const resumeT = state.t;
    const result = await runSketch();
    const sandbox = sandboxRef.current;
    if (!sandbox || !result?.ok) return;
    if (resumeT > 0) sandbox.seek(resumeT);
    if (wasPlaying) sandbox.play('loop');
  }, [runSketch]);

  useEffect(() => {
    return () => {
      if (resizeRerunTimerRef.current) clearTimeout(resizeRerunTimerRef.current);
    };
  }, []);

  const loadAndRun = useCallback(
    (newCode: string, newSettings?: Partial<SketchSettings>, title?: string, projectId?: string) => {
      const state = useStore.getState();
      state.loadSketch(newCode, newSettings, title, projectId);
      void runSketch(newCode, useStore.getState().settings);
    },
    [runSketch]
  );

  // Boot: handle deep links (example/share) or restore the draft.
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    if (route.name === 'example') {
      const example = getExample(route.id);
      if (example) {
        loadAndRun(example.code, undefined, example.title);
        return;
      }
    }
    if (route.name === 'share') {
      const payload = decodeShare(route.payload);
      if (payload) {
        setPendingShare(payload);
        return;
      }
    }
    const draft = loadDraft();
    if (draft) {
      useStore.getState().loadSketch(draft.code, draft.settings, undefined, draft.projectId);
    }
    void runSketch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to navigation after boot.
  const routeKey = route.name === 'example' ? `example:${route.id}` : route.name === 'share' ? `share:${route.payload}` : route.name;
  const lastRouteKeyRef = useRef(routeKey);
  useEffect(() => {
    if (lastRouteKeyRef.current === routeKey) return;
    lastRouteKeyRef.current = routeKey;
    if (route.name === 'example') {
      const example = getExample(route.id);
      if (example) loadAndRun(example.code, undefined, example.title);
    } else if (route.name === 'share') {
      const payload = decodeShare(route.payload);
      if (payload) {
        if (payload.code === useStore.getState().code) return; // own share link
        setPendingShare(payload);
      }
    }
  }, [route, routeKey, loadAndRun]);

  // Draft autosave (debounced).
  useEffect(() => {
    const timer = setTimeout(() => {
      const state = useStore.getState();
      saveDraft({ code: state.code, settings: state.settings, projectId: state.currentProjectId });
    }, 800);
    return () => clearTimeout(timer);
  }, [code, settings]);

  const handleFrame = useCallback((frameT: number, running: boolean) => {
    useStore.getState().setT(frameT);
    useStore.getState().setPlaying(running);
  }, []);

  const handleConsole = useCallback((level: 'log' | 'info' | 'warn' | 'error', text: string) => {
    useStore.getState().pushConsole(level, text);
  }, []);

  const handleSettingsChange = useCallback(
    (patch: Partial<SketchSettings>) => {
      useStore.getState().setSettings(patch);
      const sandbox = sandboxRef.current;
      if (!sandbox) return;
      let resized = false;
      for (const [key, value] of Object.entries(patch)) {
        if (key === 'w' || key === 'h') {
          resized = true;
        } else {
          sandbox.setParam(key as 'fps' | 'duration' | 'mode' | 'easing' | 'maxColors', value as never);
        }
      }
      if (resized) {
        // Instant visual feedback while dragging/typing...
        const s = useStore.getState().settings;
        sandbox.resize(s.w, s.h);
        // ...then settle on a real re-run so layout code depending on
        // width/height reflows correctly.
        if (resizeRerunTimerRef.current) clearTimeout(resizeRerunTimerRef.current);
        resizeRerunTimerRef.current = setTimeout(() => {
          resizeRerunTimerRef.current = null;
          void reRunPreservingPlayback();
        }, 400);
      }
    },
    [reRunPreservingPlayback]
  );

  const handleSave = useCallback(
    (name?: string) => {
      const state = useStore.getState();
      const project = saveProject(
        name ?? state.currentTitle,
        state.code,
        state.settings,
        name ? undefined : state.currentProjectId
      );
      state.markSaved(project.id, project.name);
    },
    []
  );

  const handleLoadProject = useCallback(
    (project: Project) => {
      loadAndRun(project.code, project.settings, project.name, project.id);
      setProjectsOpen(false);
    },
    [loadAndRun]
  );

  const handleExport = useCallback(
    async (format: ExportFormat, options: { paletteMode?: 'per-frame' | 'global' | 'auto'; transparent?: boolean }) => {
      const sandbox = sandboxRef.current;
      if (!sandbox) return;
      const store = useStore.getState();
      store.setExportJob({ format, progress: 0, status: 'running' });
      try {
        const result = await sandbox.exportMedia(format, { ...options, t: store.t }, (progress) => {
          useStore.getState().setExportJob({ format, progress, status: 'running' });
        });
        const blob = new Blob([result.buffer], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 30_000);
        const sizeKb = (blob.size / 1024).toFixed(0);
        useStore.getState().setExportJob({
          format,
          progress: 1,
          status: 'done',
          message: `${result.filename} — ${sizeKb} kB`,
        });
      } catch (err) {
        useStore.getState().setExportJob({
          format,
          progress: 0,
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    },
    []
  );

  const handleImportFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.txt';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void file.text().then((text) => loadAndRun(text, undefined, file.name.replace(/\.(js|txt)$/, '')));
    };
    input.click();
  }, [loadAndRun]);

  const handleExportFile = useCallback(() => {
    const state = useStore.getState();
    const blob = new Blob([state.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentTitle.replace(/[^\w-]+/g, '-').toLowerCase() || 'sketch'}.js`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }, []);

  const isDocs = route.name === 'docs';
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 800;

  const previewColumn = (
    <VStack gap={0} style={{ height: '100%', minHeight: 0 }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          background:
            'repeating-conic-gradient(color-mix(in srgb, var(--color-border) 35%, transparent) 0% 25%, transparent 0% 50%) 50% / 20px 20px',
        }}
        data-testid="preview"
      >
        <SandboxFrame ref={sandboxRef} onFrame={handleFrame} onConsole={handleConsole} />
      </div>
      {runError && (
        <Banner status="error" title="Sketch error" description={runError} container="section" />
      )}
      <Divider />
      <div style={{ padding: 'var(--spacing-2) var(--spacing-3)' }}>
        <TransportBar
          playing={playing}
          t={t}
          onLoop={() => sandboxRef.current?.play('loop')}
          onPlayOnce={() => sandboxRef.current?.play('once')}
          onPause={() => sandboxRef.current?.pause()}
          onStop={() => sandboxRef.current?.stop()}
          onSeek={(value) => sandboxRef.current?.seek(value)}
        />
      </div>
      <Divider />
      <div style={{ padding: 'var(--spacing-3)', overflowY: 'auto', maxHeight: 300 }}>
        <VStack gap={3}>
          <SettingsPanel settings={settings} onChange={handleSettingsChange} />
          <Divider />
          <ConsoleDrawer entries={consoleEntries} onClear={() => useStore.getState().clearConsole()} />
        </VStack>
      </div>
    </VStack>
  );

  const editorColumn = (
    <VStack gap={0} style={{ height: '100%', minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <EditorPane
          value={code}
          onChange={(value) => useStore.getState().setCode(value)}
          onRun={() => void runSketch()}
          onSave={() => handleSave()}
        />
      </div>
    </VStack>
  );

  return (
    <>
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" justify="between" style={{ width: '100%' }}>
            <HStack gap={2} vAlign="center">
              <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <LogoMark />
                <Text type="label" weight="bold">
                  GIF L∞P Coder
                </Text>
              </a>
              <Text type="supporting" color="secondary" maxLines={1}>
                {currentTitle}
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Button label="Run" variant="primary" size="sm" tooltip="Run sketch (Ctrl/Cmd+Enter)" onClick={() => void runSketch()} />
              <Button label="Examples" variant="ghost" size="sm" onClick={() => setExamplesOpen(true)} />
              <Button label="Docs" variant="ghost" size="sm" onClick={() => navigate('/docs/intro')} />
              <Button label="Projects" variant="ghost" size="sm" onClick={() => setProjectsOpen(true)} />
              <Button label="Import" variant="ghost" size="sm" onClick={handleImportFile} />
              <Button label="Export .js" variant="ghost" size="sm" onClick={handleExportFile} />
              <Button
                label="Share"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const state = useStore.getState();
                  const url = shareUrl(state.code, state.settings, state.currentTitle);
                  setShareLink(url);
                  setShareOpen(true);
                }}
              />
              <Button label="Export media" variant="secondary" size="sm" onClick={() => setExportOpen(true)} />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent isScrollable={false} padding={0}>
          {isDocs ? (
            <DocsView slug={route.name === 'docs' ? route.slug : 'intro'} />
          ) : isNarrow ? (
            <VStack gap={0} style={{ height: '100%', minHeight: 0 }}>
              <TabList value={mobileTab} onChange={(value) => setMobileTab(value as 'code' | 'preview')} hasDivider>
                <Tab value="code" label="Code" />
                <Tab value="preview" label="Preview" />
              </TabList>
              <div style={{ flex: 1, minHeight: 0, display: mobileTab === 'code' ? 'block' : 'none' }}>
                {editorColumn}
              </div>
              <div style={{ flex: 1, minHeight: 0, display: mobileTab === 'preview' ? 'block' : 'none' }}>
                {previewColumn}
              </div>
            </VStack>
          ) : (
            <HStack gap={0} style={{ height: '100%', minHeight: 0, alignItems: 'stretch' }}>
              <LayoutPanel resizable={editorSplit.props} role="region">
                {editorColumn}
              </LayoutPanel>
              <ResizeHandle resizable={editorSplit.props} hasDivider label="Resize editor" />
              <div style={{ flex: 1, minWidth: 0 }}>{previewColumn}</div>
            </HStack>
          )}
        </LayoutContent>
      }
    />
      <ExamplesDialog
        isOpen={examplesOpen}
        onOpenChange={setExamplesOpen}
        onPick={(example) => {
          navigate(`/example/${example.id}`);
          loadAndRun(example.code, undefined, example.title);
        }}
      />
      <ShareDialog isOpen={shareOpen} onOpenChange={setShareOpen} url={shareLink} />
      <ProjectsDialog
        isOpen={projectsOpen}
        onOpenChange={setProjectsOpen}
        onLoad={handleLoadProject}
        onSaveCurrent={(name) => handleSave(name)}
        currentTitle={currentTitle}
      />
      <ExportDialog
        isOpen={exportOpen}
        onOpenChange={(open) => {
          setExportOpen(open);
          if (!open) useStore.getState().setExportJob(null);
        }}
        support={support}
        settings={settings}
        job={exportJob}
        onExport={(format, options) => void handleExport(format, options)}
        onCancel={() => sandboxRef.current?.cancelExport()}
      />
      <RunConfirmDialog
        isOpen={pendingShare !== null}
        code={pendingShare?.code ?? ''}
        title={pendingShare?.title}
        onAccept={() => {
          const payload = pendingShare!;
          setPendingShare(null);
          loadAndRun(payload.code, payload.settings, payload.title ?? 'Shared loop');
        }}
        onReject={() => {
          setPendingShare(null);
          navigate('/');
          void runSketch();
        }}
      />
    </>
  );
}

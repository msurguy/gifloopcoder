import { create } from 'zustand';
import type { EffectConfig, ExportSupportInfo, SketchSettings } from '../sandbox/protocol';
import { DEFAULT_SETTINGS } from '../sandbox/protocol';
import { DEFAULT_SKETCH } from '../examples';
import { DEFAULT_EFFECTS } from './effects';

export interface ConsoleEntry {
  id: number;
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
}

export interface ExportJob {
  format: string;
  progress: number;
  status: 'running' | 'done' | 'error';
  message?: string;
}

interface PlaygroundState {
  code: string;
  settings: SketchSettings;
  dirty: boolean;
  currentProjectId?: string;
  currentTitle: string;

  playing: boolean;
  t: number;

  consoleEntries: ConsoleEntry[];
  runError: string | null;

  support: ExportSupportInfo | null;
  exportJob: ExportJob | null;

  effects: EffectConfig[];

  setCode(code: string): void;
  setSettings(patch: Partial<SketchSettings>): void;
  setEffects(effects: EffectConfig[]): void;
  loadSketch(code: string, settings?: Partial<SketchSettings>, title?: string, projectId?: string): void;
  setPlaying(playing: boolean): void;
  setT(t: number): void;
  pushConsole(level: ConsoleEntry['level'], text: string): void;
  clearConsole(): void;
  setRunError(message: string | null): void;
  setSupport(support: ExportSupportInfo): void;
  setExportJob(job: ExportJob | null): void;
  markSaved(projectId: string, title: string): void;
}

let consoleId = 0;

export const useStore = create<PlaygroundState>((set) => ({
  code: DEFAULT_SKETCH,
  settings: { ...DEFAULT_SETTINGS },
  dirty: false,
  currentProjectId: undefined,
  currentTitle: 'Untitled loop',

  playing: false,
  t: 0,

  consoleEntries: [],
  runError: null,

  support: null,
  exportJob: null,

  effects: [...DEFAULT_EFFECTS],

  setCode: (code) => set({ code, dirty: true }),
  setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch }, dirty: true })),
  setEffects: (effects) => set({ effects }),
  loadSketch: (code, settings, title, projectId) =>
    set({
      code,
      settings: { ...DEFAULT_SETTINGS, ...(settings ?? {}) },
      currentTitle: title ?? 'Untitled loop',
      currentProjectId: projectId,
      dirty: false,
      runError: null,
    }),
  setPlaying: (playing) => set({ playing }),
  setT: (t) => set({ t }),
  pushConsole: (level, text) =>
    set((s) => ({
      consoleEntries: [...s.consoleEntries.slice(-199), { id: consoleId++, level, text }],
    })),
  clearConsole: () => set({ consoleEntries: [] }),
  setRunError: (runError) => set({ runError }),
  setSupport: (support) => set({ support }),
  setExportJob: (exportJob) => set({ exportJob }),
  markSaved: (currentProjectId, currentTitle) => set({ currentProjectId, currentTitle, dirty: false }),
}));

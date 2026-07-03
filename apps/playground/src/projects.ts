// Project persistence in localStorage, plus draft autosave.

import type { SketchSettings } from './sandbox/protocol';
import { DEFAULT_SETTINGS } from './sandbox/protocol';

export interface Project {
  id: string;
  name: string;
  code: string;
  settings: SketchSettings;
  createdAt: number;
  updatedAt: number;
}

const PROJECTS_KEY = 'glc:projects:v1';
const DRAFT_KEY = 'glc:draft:v1';

interface ProjectsFile {
  version: 1;
  projects: Project[];
}

function safeParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function loadProjects(): Project[] {
  const file = safeParse<ProjectsFile>(localStorage.getItem(PROJECTS_KEY));
  return file?.projects ?? [];
}

function persist(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify({ version: 1, projects } satisfies ProjectsFile));
}

export function saveProject(name: string, code: string, settings: SketchSettings, id?: string): Project {
  const projects = loadProjects();
  const now = Date.now();
  if (id) {
    const existing = projects.find((p) => p.id === id);
    if (existing) {
      existing.name = name;
      existing.code = code;
      existing.settings = settings;
      existing.updatedAt = now;
      persist(projects);
      return existing;
    }
  }
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    code,
    settings,
    createdAt: now,
    updatedAt: now,
  };
  projects.unshift(project);
  persist(projects);
  return project;
}

export function renameProject(id: string, name: string): void {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === id);
  if (project) {
    project.name = name;
    project.updatedAt = Date.now();
    persist(projects);
  }
}

export function deleteProject(id: string): void {
  persist(loadProjects().filter((p) => p.id !== id));
}

export interface Draft {
  code: string;
  settings: SketchSettings;
  projectId?: string;
}

export function saveDraft(draft: Draft): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): Draft | null {
  const draft = safeParse<Draft>(localStorage.getItem(DRAFT_KEY));
  if (!draft || typeof draft.code !== 'string') return null;
  return { ...draft, settings: { ...DEFAULT_SETTINGS, ...(draft.settings ?? {}) } };
}

// Saved projects: list, load, rename, delete. Stored in localStorage.

import { useEffect, useState } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter, VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { deleteProject, loadProjects, renameProject, type Project } from '../projects';

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2.5 4h11M5.5 4V2.5h5V4M4 4l.7 9.5h6.6L12 4M6.5 6.7v4.6M9.5 6.7v4.6" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="m10.5 2.5 3 3L5 14H2v-3l8.5-8.5zM9 4l3 3" strokeLinejoin="round" />
    </svg>
  );
}

export interface ProjectsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (project: Project) => void;
  onSaveCurrent: (name: string) => void;
  currentTitle: string;
}

export function ProjectsDialog({ isOpen, onOpenChange, onLoad, onSaveCurrent, currentTitle }: ProjectsDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [saveName, setSaveName] = useState(currentTitle);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProjects(loadProjects());
      setSaveName(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const refresh = () => setProjects(loadProjects());

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={560} maxHeight="80vh">
      <Layout
        header={<DialogHeader title="Projects" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            {projects.length === 0 ? (
              <EmptyState
                title="No saved projects yet"
                description="Save the current sketch below. Projects live in this browser's local storage."
              />
            ) : (
              <VStack gap={2}>
                {projects.map((project) => (
                  <HStack
                    key={project.id}
                    gap={2}
                    vAlign="center"
                    style={{
                      padding: 'var(--spacing-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-element)',
                    }}
                  >
                    <VStack gap={0} style={{ flex: 1, minWidth: 0 }}>
                      {renamingId === project.id ? (
                        <TextInput
                          label="New name"
                          isLabelHidden
                          value={renameValue}
                          size="sm"
                          hasAutoFocus
                          onChange={setRenameValue}
                        />
                      ) : (
                        <Text type="label" maxLines={1}>
                          {project.name}
                        </Text>
                      )}
                      <Text type="supporting" color="secondary">
                        Updated {new Date(project.updatedAt).toLocaleString()}
                      </Text>
                    </VStack>
                    {renamingId === project.id ? (
                      <Button
                        label="Save name"
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          renameProject(project.id, renameValue.trim() || project.name);
                          setRenamingId(null);
                          refresh();
                        }}
                      />
                    ) : (
                      <>
                        <Button label="Load" size="sm" onClick={() => onLoad(project)} />
                        <IconButton
                          label={`Rename ${project.name}`}
                          tooltip="Rename"
                          icon={<PencilIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRenamingId(project.id);
                            setRenameValue(project.name);
                          }}
                        />
                        <IconButton
                          label={`Delete ${project.name}`}
                          tooltip="Delete"
                          icon={<TrashIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteProject(project.id);
                            refresh();
                          }}
                        />
                      </>
                    )}
                  </HStack>
                ))}
              </VStack>
            )}
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} vAlign="end" style={{ width: '100%' }}>
              <div style={{ flex: 1 }}>
                <TextInput label="Save current sketch as" value={saveName} size="sm" onChange={setSaveName} />
              </div>
              <Button
                label="Save"
                variant="primary"
                onClick={() => {
                  onSaveCurrent(saveName.trim() || 'Untitled loop');
                  refresh();
                }}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

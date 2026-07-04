// CodeMirror 6 editor with JS syntax, GLC API autocompletion, and a theme
// driven by Astryx design tokens so it follows light/dark mode.

import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { completeFromList, type Completion } from '@codemirror/autocomplete';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const GLC_COMPLETIONS: Completion[] = [
  // glc instance API
  ...[
    'loop()',
    'playOnce()',
    'stop()',
    'size(width, height)',
    'setDuration(seconds)',
    'setFPS(fps)',
    'setMode("bounce")',
    'setEasing(true)',
    'setMaxColors(256)',
    'renderList',
    'styles',
    'color',
    'w',
    'h',
  ].map((label) => ({ label: `glc.${label}`, type: 'method' as const })),
  // shape add methods
  ...[
    'addArcSegment',
    'addArrow',
    'addBezierCurve',
    'addBezierSegment',
    'addCircle',
    'addCube',
    'addCurve',
    'addCurveSegment',
    'addGear',
    'addGrid',
    'addHeart',
    'addLine',
    'addOval',
    'addPath',
    'addPoly',
    'addRay',
    'addRaySegment',
    'addRect',
    'addSegment',
    'addSpiral',
    'addStar',
    'addText',
  ].map((label) => ({ label: `list.${label}({})`, type: 'function' as const })),
  // color helpers
  ...[
    'rgb(r, g, b)',
    'rgba(r, g, b, a)',
    'hsv(h, s, v)',
    'hsva(h, s, v, a)',
    'animHSV(h0, h1, s0, s1, v0, v1)',
    'randomRGB()',
    'gray(shade)',
    'createLinearGradient(x0, y0, x1, y1)',
    'createRadialGradient(x0, y0, r0, x1, y1, r1)',
  ].map((label) => ({ label: `color.${label}`, type: 'function' as const })),
  // common shape props
  ...[
    'phase',
    'speedMult',
    'lineWidth',
    'strokeStyle',
    'fillStyle',
    'translationX',
    'translationY',
    'globalAlpha',
    'shake',
    'blendMode',
    'drawFromCenter',
  ].map((label) => ({ label, type: 'property' as const })),
];

// Token colors driven by Astryx's --color-syntax-* tokens, which already
// resolve per light/dark mode, so highlighting stays legible in both.
const syntaxHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--color-syntax-keyword)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--color-syntax-string)' },
  { tag: tags.comment, color: 'var(--color-syntax-comment)', fontStyle: 'italic' },
  { tag: tags.number, color: 'var(--color-syntax-number)' },
  { tag: [tags.bool, tags.null, tags.atom], color: 'var(--color-syntax-constant)' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--color-syntax-function)' },
  { tag: [tags.typeName, tags.className], color: 'var(--color-syntax-type)' },
  { tag: tags.variableName, color: 'var(--color-syntax-variable)' },
  { tag: tags.operator, color: 'var(--color-syntax-operator)' },
  { tag: tags.propertyName, color: 'var(--color-syntax-property)' },
  { tag: tags.tagName, color: 'var(--color-syntax-tag)' },
  { tag: tags.attributeName, color: 'var(--color-syntax-attribute)' },
  { tag: [tags.punctuation, tags.bracket], color: 'var(--color-syntax-punctuation)' },
]);

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
  },
  '.cm-content': {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    caretColor: 'var(--color-text-primary)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-secondary)',
    border: 'none',
    borderRight: '1px solid var(--color-border)',
  },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--color-border) 25%, transparent)' },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--color-border) 25%, transparent)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--color-text-accent) 22%, transparent) !important',
  },
});

export interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSave: () => void;
}

export function EditorPane({ value, onChange, onRun, onSave }: EditorPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const callbacksRef = useRef({ onChange, onRun, onSave });
  callbacksRef.current = { onChange, onRun, onSave };
  const readOnlyCompartment = useRef(new Compartment());

  useEffect(() => {
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              callbacksRef.current.onRun();
              return true;
            },
          },
          {
            key: 'Mod-s',
            run: () => {
              callbacksRef.current.onSave();
              return true;
            },
          },
          indentWithTab,
        ]),
        javascript(),
        javascriptLanguage.data.of({ autocomplete: completeFromList(GLC_COMPLETIONS) }),
        syntaxHighlighting(syntaxHighlightStyle),
        editorTheme,
        readOnlyCompartment.current.of([]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            callbacksRef.current.onChange(update.state.doc.toString());
          }
        }),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current! });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor is the source of truth while mounted; external value changes
    // are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (loading examples/projects) into the editor.
  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} data-testid="editor" style={{ height: '100%', overflow: 'hidden' }} />;
}

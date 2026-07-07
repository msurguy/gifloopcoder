// Generates one PNG per built-in post-processing effect (plus a baseline) for
// the docs, and rewrites the EFFECT-GALLERY block in effects.md.
//
// It drives the real playground in a headless browser: for each effect it seeds
// the editor draft (localStorage) with a shared base scene + a one-line
// `glc.effects.add(...)`, reloads, pins a deterministic frame via the sandbox's
// `seek` message, and reads the composited canvas back as a PNG. The effect list
// comes from the built package's `effectMeta`, so it always tracks the source.
//
// Run from apps/playground:  npm run gen:effect-shots
// Env: GLC_BASE_URL (target an already-running server, e.g. the preview build),
//      GLC_PORT (port for the auto-started dev server, default 5199),
//      PLAYWRIGHT_CHROMIUM_PATH (custom Chromium, mirrors playwright.config.ts).

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
// Pure data module (only a type-only import) — loads cleanly in Node. Built by
// the `gen:effect-shots` npm script before this runs, so it mirrors the source.
import { effectMeta, EFFECT_CATEGORIES } from '../../../packages/glc/dist/effects/meta.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLAYGROUND = resolve(HERE, '..');
const OUT_DIR = resolve(PLAYGROUND, 'public/docs-images/effects');
const EFFECTS_MD = resolve(PLAYGROUND, 'src/content/docs/effects.md');
// The script owns this whole markdown section (heading → next `## `). No HTML
// comment markers — Astryx's Markdown renders comments as visible text.
const GALLERY_HEADING = '## Effect gallery';

const SIZE = 360;
const BG_COLOR = '#0d1017';
// Mid-loop so time-driven effects (glitch, crt, shockwave, reflection, oldFilm)
// show visible activity rather than their flat t=0 state.
const FRAME_T = 0.35;

// Alpha/edge effects (glow, outline, drop shadow) key off transparent edges, so
// they're invisible on an opaque background. Render these on a transparent scene
// so the shapes have alpha edges; the capture step then composites every image
// over BG_COLOR, keeping the gallery visually consistent.
const TRANSPARENT_BG_EFFECTS = new Set(['glow', 'outline', 'dropShadow']);

// A single static scene, drawn identically for every effect so the images are
// directly comparable: bright saturated orbs (color), a white core + gold star
// (bloom/glow/edges), and fine line/dot detail (pixelate/ascii/dot/crossHatch).
function baseScene(transparentBg) {
  const bg = `  glc.styles.backgroundColor = "${transparentBg ? 'transparent' : BG_COLOR}";\n`;
  return `function onGLC(glc) {
${bg}  var list = glc.renderList, i;

  // Title + subtitle — typography for text-sensitive effects (ascii, glow, chroma).
  list.addText({ x: 180, y: 48, text: "GLC", fontSize: 54, fontWeight: "bold", fillStyle: "#ffd23f" });
  list.addText({ x: 180, y: 86, text: "shapes · text · color", fontSize: 15, fillStyle: "#9fb2cc" });

  // Bright white core + star: the target for bloom / glow / light effects.
  list.addCircle({ x: 180, y: 208, radius: 48, fillStyle: "#f5f5fa" });
  list.addStar({ x: 180, y: 208, points: 5, innerRadius: 16, outerRadius: 36, fillStyle: "#ff9e1f" });

  // A ring of varied shapes and saturated colors around the core.
  list.addHeart({ x: 78, y: 162, w: 58, h: 52, fillStyle: "#ff4d6d" });
  list.addRect({ x: 284, y: 162, w: 56, h: 56, rotation: 18, fillStyle: "#2f6bff" });
  list.addPoly({ x: 58, y: 262, radius: 32, sides: 6, fillStyle: "#9a4dff" });
  list.addPoly({ x: 302, y: 262, radius: 34, sides: 3, rotation: -90, fillStyle: "#26d07c" });
  list.addCircle({ x: 128, y: 322, radius: 27, fillStyle: "#22d3ee" });
  list.addOval({ x: 232, y: 322, rx: 36, ry: 25, drawFromCenter: true, fillStyle: "#ff5cc8" });

  // Fine parallel lines + dots: structure for pixelate / ascii / dot / crossHatch.
  for (i = 0; i < 5; i++) {
    list.addLine({ x0: 18, y0: 112 + i * 9, x1: 84, y1: 112 + i * 9, strokeStyle: "#5cc8ff", lineWidth: 2 });
  }
  for (i = 0; i < 5; i++) {
    list.addCircle({ x: 300 + i * 11, y: 120, radius: 3, fillStyle: "#ff8ac0" });
  }
}`;
}

// Almost every effect is previewed at its built-in defaults. The few here are
// no-ops (or too subtle) at default, so we pass representative params purely so
// the preview shows something; everything else stays default-driven.
const PREVIEW_OVERRIDES = {
  adjustment: { saturation: 1.9, contrast: 1.35, brightness: 1.05 },
  hslAdjustment: { hue: 130, saturation: 0.25 },
  outline: { thickness: 3, color: '#ffffff' },
};

function draftFor(effectName) {
  const opts = PREVIEW_OVERRIDES[effectName];
  const addCall = effectName
    ? `  glc.effects.add(${JSON.stringify(effectName)}${opts ? ', ' + JSON.stringify(opts) : ''});\n`
    : '';
  const code = `${baseScene(TRANSPARENT_BG_EFFECTS.has(effectName))}

function onGLCPanel(glc) {
  glc.size(${SIZE}, ${SIZE});
  glc.setFPS(30);
  glc.setDuration(4);
  glc.setMode("single");
  glc.setEasing(false);
${addCall}}
`;
  return JSON.stringify({ code });
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error(`Server did not come up at ${url}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function startDevServer(port) {
  const baseUrl = `http://localhost:${port}/`;
  console.log(`Starting dev server on ${baseUrl} ...`);
  const child = spawn('npm', ['run', 'dev', '--', '--port', String(port), '--strictPort'], {
    cwd: PLAYGROUND,
    stdio: 'ignore',
    env: process.env,
  });
  child.on('exit', (code) => {
    if (code && code !== 0 && !child.killed) console.error(`dev server exited with code ${code}`);
  });
  await waitForServer(baseUrl, 120_000);
  return { baseUrl, stop: () => child.kill('SIGTERM') };
}

async function capture(page, effectName, filePath) {
  await page.evaluate(
    ([k, v]) => localStorage.setItem(k, v),
    ['glc:draft:v1', draftFor(effectName)]
  );
  await page.reload({ waitUntil: 'domcontentloaded' });

  const frame = page.frameLocator('iframe[title="GLC animation preview"]');
  const canvas = frame.locator('#stage canvas');
  await canvas.waitFor({ state: 'visible', timeout: 30_000 });

  // Pin a fixed frame: postMessage crosses into the opaque sandbox, the runtime
  // pauses and renders exactly this t (effects included).
  await page.evaluate((t) => {
    const ifr = document.querySelector('iframe[title="GLC animation preview"]');
    ifr?.contentWindow?.postMessage({ type: 'seek', t }, '*');
  }, FRAME_T);
  await page.waitForTimeout(350);

  // Composite over the shared background so alpha/edge effects (rendered on a
  // transparent scene) match the opaque images. A no-op for opaque scenes.
  const dataUrl = await canvas.evaluate((c, bg) => {
    const out = document.createElement('canvas');
    out.width = c.width;
    out.height = c.height;
    const ctx = out.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(c, 0, 0);
    return out.toDataURL('image/png');
  }, BG_COLOR);
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  await writeFile(filePath, Buffer.from(base64, 'base64'));
}

function buildGallerySection() {
  const byCategory = new Map(EFFECT_CATEGORIES.map((c) => [c, []]));
  for (const [name, meta] of Object.entries(effectMeta)) {
    byCategory.get(meta.category)?.push([name, meta.label]);
  }
  const lines = [];
  lines.push(GALLERY_HEADING);
  lines.push('');
  lines.push('Every built-in effect applied to the same base scene, at its default');
  lines.push('settings (a few no-op-at-default effects use representative values so the');
  lines.push('preview shows something). This section is generated — regenerate after');
  lines.push('changing effects with `npm run gen:effect-shots` from `apps/playground`.');
  lines.push('');
  lines.push('![The base scene, with no effect applied](docs-images/effects/baseline.png)');
  lines.push('');
  lines.push('*The shared base scene — every image below applies one effect to it.*');
  lines.push('');
  for (const category of EFFECT_CATEGORIES) {
    const entries = byCategory.get(category) ?? [];
    if (entries.length === 0) continue;
    lines.push(`### ${category}`);
    lines.push('');
    for (const [name, label] of entries) {
      lines.push(`**${label}** · \`${name}\``);
      lines.push('');
      lines.push(`![${label}](docs-images/effects/${name}.png)`);
      lines.push('');
    }
  }
  return lines.join('\n').trimEnd();
}

async function writeGallery() {
  const md = await readFile(EFFECTS_MD, 'utf8');
  const start = md.indexOf(GALLERY_HEADING);
  if (start === -1) {
    throw new Error(`Missing "${GALLERY_HEADING}" heading in ${EFFECTS_MD}. Add it (the script owns that section).`);
  }
  // Replace from the heading to the next top-level (## ) heading, or EOF.
  const rest = md.slice(start + GALLERY_HEADING.length);
  const nextRel = rest.search(/\n## /);
  const end = nextRel === -1 ? md.length : start + GALLERY_HEADING.length + nextRel + 1;
  const before = md.slice(0, start);
  const after = md.slice(end);
  const next = `${before}${buildGallerySection()}\n\n${after}`;
  await writeFile(EFFECTS_MD, next);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let server = null;
  let baseUrl = process.env.GLC_BASE_URL;
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    await waitForServer(baseUrl, 30_000);
  } else {
    server = await startDevServer(Number(process.env.GLC_PORT) || 5199);
    baseUrl = server.baseUrl;
  }

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); // establish origin for localStorage

    const names = ['', ...Object.keys(effectMeta)]; // '' = baseline (no effect)
    for (const name of names) {
      const file = name || 'baseline';
      process.stdout.write(`  ${file} ... `);
      await capture(page, name, resolve(OUT_DIR, `${file}.png`));
      console.log('ok');
    }
  } finally {
    await browser.close();
    server?.stop();
  }

  await writeGallery();
  console.log(`\nWrote ${Object.keys(effectMeta).length} effect images + baseline to ${OUT_DIR}`);
  console.log('Updated EFFECT-GALLERY block in effects.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { test, expect, type Page } from '@playwright/test';

// The preview canvas lives inside the sandboxed iframe.
function sandbox(page: Page) {
  return page.frameLocator('iframe[title="GLC animation preview"]');
}

async function waitForCanvas(page: Page) {
  await expect(sandbox(page).locator('#stage canvas')).toBeVisible({ timeout: 20_000 });
}

test.describe('playground', () => {
  test('boots, runs the default sketch, and animates', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    // The transport readout advances while looping.
    await expect(page.getByText(/^t=0\.\d\d$/)).toBeVisible();
    // Canvas is not blank: sample pixels inside the iframe.
    const nonWhite = await sandbox(page)
      .locator('#stage canvas')
      .evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d')!;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) count++;
        }
        return count;
      });
    expect(nonWhite).toBeGreaterThan(100);
  });

  test('examples gallery lists all 32 examples and loads one', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.getByRole('button', { name: 'Examples' }).click();
    const cards = page.getByRole('dialog').locator('[aria-label^="Load example:"]');
    await expect(cards).toHaveCount(32);
    // ClickableCard's aria button is a hidden overlay; click the card surface
    // like a user would.
    await page
      .getByRole('dialog')
      .locator('.astryx-clickable-card', { hasText: 'Gears' })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).toHaveURL(/#\/example\/gears/);
    await waitForCanvas(page);
  });

  test('WebGL post-processing runs end to end (bloom + custom shader)', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.locator('[data-testid="editor"] .cm-content').click();
    await page.keyboard.press('ControlOrMeta+a');
    // A bright shape on a dark background, with a built-in bloom pass and a
    // custom GLSL pass — exercises the whole WebGL seam and the readback to 2D.
    await page.keyboard.type(
      'function onGLC(glc){glc.loop();glc.styles.backgroundColor="#000";' +
        'glc.renderList.addCircle({x:glc.w/2,y:glc.h/2,radius:80,fill:true,fillStyle:"#fff"});' +
        'glc.effects.add("bloom",{strength:1,threshold:0.3,radius:4});' +
        'glc.effects.addShader({fragment:"fragColor=texture(uTexture,vUv);"});}'
    );
    await page.keyboard.press('ControlOrMeta+Enter');
    await waitForCanvas(page);
    // Looping playback (advancing t) means the sketch + effect chain ran without
    // a runtime/shader-compile error (which would stop playback and banner).
    await expect(page.getByText(/^t=0\.\d\d$/)).toBeVisible();
    // The composited frame reaches the 2D canvas (readback path works).
    const nonBlack = await sandbox(page)
      .locator('#stage canvas')
      .evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d')!;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 10 || data[i + 1] > 10 || data[i + 2] > 10) count++;
        }
        return count;
      });
    expect(nonBlack).toBeGreaterThan(100);
  });

  test('every built-in effect compiles and renders (full chain)', async ({ page }) => {
    // Adding every builtin compiles all shader programs in a real GL context —
    // any GLSL error throws at add() and the count never reaches the total.
    // The sketch is seeded via the draft (typing this much into CodeMirror is
    // slow and fragile with auto-brackets).
    const names = [
      'adjustment', 'ascii', 'bloom', 'blur', 'bulgePinch', 'chromaticAberration', 'colorMatrix',
      'crossHatch', 'crt', 'dot', 'dropShadow', 'emboss', 'filmGrain', 'glitch', 'glow', 'godray',
      'hslAdjustment', 'motionBlur', 'oldFilm', 'outline', 'pixelate', 'radialBlur', 'reflection',
      'rgbSplit', 'shockwave', 'tiltShift', 'twist', 'vignette', 'zoomBlur',
    ];
    const code =
      'function onGLC(glc){glc.loop();' +
      'glc.renderList.addStar({x:glc.w/2,y:glc.h/2,innerRadius:40,outerRadius:120,fillStyle:"#fc0"});' +
      `var names=${JSON.stringify(names)};` +
      'for(var i=0;i<names.length;i++){glc.effects.add(names[i]);}' +
      'console.log("EFFECT_COUNT="+glc.effects.count());}';
    const consoleLines: string[] = [];
    page.on('console', (msg) => consoleLines.push(msg.text()));
    await page.addInitScript(
      ([draft]) => localStorage.setItem('glc:draft:v1', draft),
      [JSON.stringify({ code })]
    );
    await page.goto('./');
    await waitForCanvas(page);
    await expect(page.getByText(/^t=0\.\d\d$/)).toBeVisible();
    await expect
      .poll(() => consoleLines.some((l) => l.includes(`EFFECT_COUNT=${names.length}`)), {
        timeout: 15_000,
      })
      .toBe(true);
  });

  test('effects panel adds, configures, and removes a chain entry', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    const panel = page.getByTestId('effects-panel');
    await panel.scrollIntoViewIfNeeded();
    // Add CRT from the grouped selector (the combobox is the panel's only one).
    await panel.getByRole('combobox').click();
    await page.getByRole('option', { name: 'CRT', exact: true }).click();
    const item = page.getByTestId('effect-chain-item');
    await expect(item).toHaveCount(1);
    await expect(item.getByText('CRT')).toBeVisible();
    // New item auto-expands: a param slider is visible.
    await expect(item.getByText('Curvature')).toBeVisible();
    // Playback still runs with the effect applied.
    await expect(page.getByText(/^t=0\.\d\d$/)).toBeVisible();
    // Remove it.
    await item.getByRole('button', { name: 'Remove CRT' }).click();
    await expect(page.getByTestId('effect-chain-item')).toHaveCount(0);
  });

  test('panel effects sync into code and survive a re-run (bidirectional)', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    const panel = page.getByTestId('effects-panel');
    await panel.scrollIntoViewIfNeeded();

    // Panel → code: adding an effect writes the managed block (debounced),
    // including the settings snapshot.
    await panel.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Pixelate', exact: true }).click();
    const editor = page.locator('[data-testid="editor"] .cm-content');
    await expect(editor).toContainText('onGLCPanel', { timeout: 5_000 });
    await expect(editor).toContainText('glc.effects.add("pixelate"');
    await expect(editor).toContainText('glc.setFPS(30)');

    // Settings panel → code: changing FPS updates the block's snapshot.
    await page.getByLabel('FPS').fill('24');
    await expect(editor).toContainText('glc.setFPS(24)', { timeout: 5_000 });

    // Code → panel: re-running the (now block-carrying) code repopulates the
    // panel from the parsed block, and the runtime report confirms settings.
    await editor.click();
    await page.keyboard.press('ControlOrMeta+Enter');
    await waitForCanvas(page);
    const item = page.getByTestId('effect-chain-item');
    await expect(item).toHaveCount(1);
    await expect(item.getByText('Pixelate')).toBeVisible();
    await expect(page.getByLabel('FPS')).toHaveValue('24');

    // Removing via the panel drops the effect call; the settings snapshot
    // remains in the block.
    await item.getByRole('button', { name: 'Remove Pixelate' }).click();
    await expect(editor).not.toContainText('glc.effects.add(', { timeout: 5_000 });
    await expect(editor).toContainText('glc.setFPS(24)');
  });

  test('loading an example with an effects block populates the panel', async ({ page }) => {
    await page.goto('./#/example/retroTV');
    await waitForCanvas(page);
    // retroTV ships rgbSplit + oldFilm + crt in its managed block.
    const items = page.getByTestId('effect-chain-item');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0).getByText('RGB split')).toBeVisible();
    await expect(items.nth(2).getByText('CRT')).toBeVisible();
    // Animated tuple params render read-only instead of a lossy slider.
    await items.nth(0).getByRole('button', { name: /Expand RGB split/ }).click();
    await expect(page.getByText(/Red X: animated \[-3 → -1\]/)).toBeVisible();
  });

  test('custom-shader block entries round-trip through the panel', async ({ page }) => {
    await page.goto('./#/example/bloomEffect');
    await waitForCanvas(page);
    // bloomEffect ships bloom + chromaticAberration + a custom GLSL pass.
    const items = page.getByTestId('effect-chain-item');
    await expect(items).toHaveCount(3);
    await expect(items.nth(2).getByText('Custom shader')).toBeVisible();
    // Editing a slider regenerates the block; the addShader call must survive.
    await items.nth(0).getByRole('button', { name: /Expand Bloom/ }).click();
    const strength = items.nth(0).getByRole('slider', { name: 'Strength' });
    await strength.focus();
    await page.keyboard.press('ArrowRight');
    const editor = page.locator('[data-testid="editor"] .cm-content');
    await expect(editor).toContainText('glc.effects.addShader', { timeout: 5_000 });
    await expect(editor).toContainText('glc.effects.add("bloom"');
    // And the regenerated block parses back to the same 3-entry chain on re-run.
    await editor.click();
    await page.keyboard.press('ControlOrMeta+Enter');
    await waitForCanvas(page);
    await expect(page.getByTestId('effect-chain-item')).toHaveCount(3);
  });

  test('sketch errors surface in the error banner', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.locator('[data-testid="editor"] .cm-content').click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('function onGLC(glc) { throw new Error("boom-e2e"); }');
    await page.keyboard.press('ControlOrMeta+Enter');
    await expect(page.getByText('boom-e2e')).toBeVisible({ timeout: 15_000 });
  });

  test('share link round-trip shows confirm dialog and runs after accept', async ({ page, context }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Share', exact: true }).click();
    const url = await page.locator('[data-testid="share-url"]').innerText();
    expect(url).toContain('#/s/');

    const other = await context.newPage();
    await other.goto(url);
    // Foreign share links must not auto-run: consent dialog first.
    await expect(other.getByText(/shared a sketch|Shared sketch/i)).toBeVisible({ timeout: 15_000 });
    await other.getByRole('button', { name: 'Load and run' }).click();
    await waitForCanvas(other);
    await other.close();
  });

  test('projects save and load via localStorage', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.getByRole('button', { name: 'Projects' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Save current sketch as').fill('E2E test loop');
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog.getByText('E2E test loop')).toBeVisible();
    await dialog.getByRole('button', { name: 'Load', exact: true }).first().click();
    await waitForCanvas(page);
    const stored = await page.evaluate(() => localStorage.getItem('glc:projects:v1'));
    expect(stored).toContain('E2E test loop');
  });

  test('docs pages render with sidebar navigation', async ({ page }) => {
    await page.goto('./#/docs/intro');
    await expect(page.getByTestId('docs-content')).toContainText(/GIF Loop Coder/i, { timeout: 15_000 });
    await page.getByRole('navigation').getByRole('link', { name: 'Objects' }).click();
    await expect(page.getByTestId('docs-content')).toContainText(/addCircle|Circle/i);
  });
});

test.describe('exports', () => {
  test('GIF export produces a GIF89a file with download', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.getByRole('button', { name: 'Export media' }).click();
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 });
    await page.getByRole('button', { name: 'Export GIF' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.gif$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const bytes = Buffer.concat(chunks);
    expect(bytes.subarray(0, 6).toString('ascii')).toBe('GIF89a');
    expect(bytes.length).toBeGreaterThan(1000);
  });

  test('WebM export produces an EBML file when supported', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.getByRole('button', { name: 'Export media' }).click();
    // Capability detection may disable WebM in stripped-down browsers.
    const webmSupported = await page
      .getByRole('dialog')
      .locator('select, [role="combobox"], label')
      .first()
      .isVisible()
      .then(() => true)
      .catch(() => false);
    test.skip(!webmSupported, 'export dialog missing');

    // Open the format selector and check WebM availability.
    const formatSelector = page.getByRole('dialog').getByLabel('Format');
    await formatSelector.click();
    const webmOption = page.getByRole('option', { name: /^WebM video$/ });
    const available = await webmOption.isVisible().catch(() => false);
    test.skip(!available, 'WebM encoding not supported in this browser build');
    await webmOption.click();

    const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
    await page.getByRole('button', { name: 'Export WEBM' }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const bytes = Buffer.concat(chunks);
    // EBML magic 1A 45 DF A3
    expect(bytes.subarray(0, 4).toString('hex')).toBe('1a45dfa3');
  });
});

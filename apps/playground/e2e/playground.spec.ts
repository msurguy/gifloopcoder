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

  test('examples gallery lists all 20 examples and loads one', async ({ page }) => {
    await page.goto('./');
    await waitForCanvas(page);
    await page.getByRole('button', { name: 'Examples' }).click();
    const cards = page.getByRole('dialog').locator('[aria-label^="Load example:"]');
    await expect(cards).toHaveCount(20);
    await page.getByLabel('Load example: Gears').click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).toHaveURL(/#\/example\/gears/);
    await waitForCanvas(page);
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
    await page.getByRole('link', { name: 'Objects' }).click();
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

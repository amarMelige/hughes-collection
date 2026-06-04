// @ts-check
const { test, expect } = require('@playwright/test');

// Helper: unlock the gate before each test
async function unlock(page) {
  await page.goto('');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.fill('#gate-input', 'Hughes2024');
  await page.keyboard.press('Enter');
  await expect(page.locator('#gate')).toBeHidden({ timeout: 1000 });
}

test.describe('Stats bar', () => {
  test('shows correct total item count', async ({ page }) => {
    await unlock(page);
    const total = await page.locator('#s-total').textContent();
    expect(Number(total)).toBeGreaterThan(0);
  });

  test('shows gun count less than total', async ({ page }) => {
    await unlock(page);
    const total = Number(await page.locator('#s-total').textContent());
    const guns = Number(await page.locator('#s-guns').textContent());
    expect(guns).toBeGreaterThan(0);
    expect(guns).toBeLessThan(total);
  });

  test('shows estimated value range', async ({ page }) => {
    await unlock(page);
    const mid = await page.locator('#s-mid').textContent();
    expect(mid).toMatch(/\$[\d,]+ – \$[\d,]+/);
  });
});

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => { await unlock(page); });

  test('All items shows full collection', async ({ page }) => {
    const total = Number(await page.locator('#cnt-all').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(total));
  });

  test('Firearms filter shows only guns', async ({ page }) => {
    await page.click('button:has-text("Firearms")');
    const gunCount = Number(await page.locator('#cnt-gun').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(gunCount));
    await expect(page.locator('.badge-vehicle')).toHaveCount(0);
  });

  test('Vehicles filter shows only vehicles', async ({ page }) => {
    await page.click('button:has-text("Vehicles")');
    const vehicleCount = Number(await page.locator('#cnt-vehicle').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(vehicleCount));
    await expect(page.locator('.badge-gun')).toHaveCount(0);
  });

  test('Sold items filter shows only sold items', async ({ page }) => {
    await page.click('button:has-text("Sold")');
    const soldCount = Number(await page.locator('#cnt-sold').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(soldCount));
  });

  test('Pistols sub-filter shows only pistols', async ({ page }) => {
    await page.click('button:has-text("Pistols")');
    const pistolCount = Number(await page.locator('#cnt-pistol').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(pistolCount));
    const badges = page.locator('.card-type-badge');
    for (const badge of await badges.all()) {
      await expect(badge).toHaveText('Pistol');
    }
  });

  test('Revolvers sub-filter shows only revolvers', async ({ page }) => {
    await page.click('button:has-text("Revolvers")');
    const count = Number(await page.locator('#cnt-revolver').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(count));
  });

  test('Rifles sub-filter shows only rifles', async ({ page }) => {
    await page.click('button:has-text("Rifles")');
    const count = Number(await page.locator('#cnt-rifle').textContent());
    const secCount = await page.locator('#sec-count').textContent();
    expect(secCount).toContain(String(count));
  });
});

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => { await unlock(page); });

  test('search for "Kimber" returns only Kimber items', async ({ page }) => {
    await page.fill('#search', 'Kimber');
    await expect(page.locator('.item-card')).not.toHaveCount(0);
    const makes = page.locator('.card-make');
    for (const m of await makes.all()) {
      const text = (await m.textContent() || '').toLowerCase();
      expect(text).toContain('kimber');
    }
  });

  test('search for "Smith & Wesson" returns results', async ({ page }) => {
    await page.fill('#search', 'Smith & Wesson');
    const count = await page.locator('.item-card').count();
    expect(count).toBeGreaterThan(0);
  });

  test('search for nonsense shows empty state', async ({ page }) => {
    await page.fill('#search', 'zzzzzzzznotagun');
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText('No items match');
  });

  test('clearing search restores full list', async ({ page }) => {
    const totalBefore = await page.locator('.item-card').count();
    await page.fill('#search', 'Kimber');
    await page.fill('#search', '');
    const totalAfter = await page.locator('.item-card').count();
    expect(totalAfter).toBe(totalBefore);
  });

  test('search works by serial number', async ({ page }) => {
    await page.fill('#search', 'HDV4438');
    const cards = page.locator('.item-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first().locator('.card-serial')).toContainText('HDV4438');
  });

  test('search works by caliber', async ({ page }) => {
    await page.fill('#search', '9MM');
    const count = await page.locator('.item-card').count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Sorting', () => {
  test.beforeEach(async ({ page }) => { await unlock(page); });

  test('sort by ID is default order', async ({ page }) => {
    const firstId = await page.locator('.card-num-val').first().textContent();
    expect(firstId?.trim()).toBe('001');
  });

  test('sort by ask price high–low shows items', async ({ page }) => {
    await page.selectOption('#sort-sel', 'sell');
    const cards = page.locator('.item-card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('sort by make renders alphabetically', async ({ page }) => {
    await page.selectOption('#sort-sel', 'make');
    const makes = await page.locator('.card-make').allTextContents();
    const sorted = [...makes].sort((a, b) => a.localeCompare(b));
    expect(makes).toEqual(sorted);
  });
});

test.describe('View toggle', () => {
  test.beforeEach(async ({ page }) => { await unlock(page); });

  test('list view shows table rows instead of cards', async ({ page }) => {
    await page.click('#btn-list');
    await expect(page.locator('.items-list')).toBeVisible();
    await expect(page.locator('.items-grid')).toHaveCount(0);
  });

  test('grid view is active by default', async ({ page }) => {
    await expect(page.locator('.items-grid')).toBeVisible();
    await expect(page.locator('#btn-grid')).toHaveClass(/active/);
  });

  test('toggling back to grid works', async ({ page }) => {
    await page.click('#btn-list');
    await page.click('#btn-grid');
    await expect(page.locator('.items-grid')).toBeVisible();
    await expect(page.locator('.items-list')).toHaveCount(0);
  });
});

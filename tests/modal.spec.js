// @ts-check
const { test, expect } = require('@playwright/test');

async function unlock(page) {
  await page.goto('');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.fill('#gate-input', 'Hughes2024');
  await page.keyboard.press('Enter');
  await expect(page.locator('#gate')).toBeHidden({ timeout: 1000 });
}

test.describe('Item modal', () => {
  test.beforeEach(async ({ page }) => { await unlock(page); });

  test('clicking a card opens the modal', async ({ page }) => {
    await page.locator('.item-card').first().click();
    await expect(page.locator('#modal')).toHaveClass(/open/);
  });

  test('modal shows item number, make, and serial', async ({ page }) => {
    await page.locator('.item-card').first().click();
    await expect(page.locator('.modal-num')).toBeVisible();
    await expect(page.locator('.modal-make')).toBeVisible();
    const modalNum = await page.locator('.modal-num').textContent();
    expect(modalNum).toMatch(/Item #\d+/);
  });

  test('modal shows value strip with Est. Low and Est. High', async ({ page }) => {
    await page.locator('.item-card').first().click();
    await expect(page.locator('.vs-lbl').filter({ hasText: 'Est. Low' })).toBeVisible();
    await expect(page.locator('.vs-lbl').filter({ hasText: 'Est. High' })).toBeVisible();
    await expect(page.locator('.vs-lbl').filter({ hasText: 'Mid Estimate' })).toBeVisible();
  });

  test('modal closes with close button', async ({ page }) => {
    await page.locator('.item-card').first().click();
    await expect(page.locator('#modal')).toHaveClass(/open/);
    await page.click('.modal-close');
    await expect(page.locator('#modal')).not.toHaveClass(/open/);
  });

  test('modal closes with Escape key', async ({ page }) => {
    await page.locator('.item-card').first().click();
    await expect(page.locator('#modal')).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).not.toHaveClass(/open/);
  });

  test('modal shows notes section when notes exist', async ({ page }) => {
    // Item 001 has notes
    await page.locator('.item-card[onclick*="\'001\'"]').click();
    await expect(page.locator('.notes-section')).toBeVisible();
    await expect(page.locator('.notes-lbl')).toContainText('Notes');
  });

  test('multi-image item shows gallery nav arrows', async ({ page }) => {
    // Item 001 has 3 images
    await page.locator('.item-card[onclick*="\'001\'"]').click();
    await expect(page.locator('.gal-nav.next')).toBeVisible();
    await expect(page.locator('.gal-nav.prev')).toBeVisible();
  });

  test('gallery next/prev navigation updates image counter', async ({ page }) => {
    await page.locator('.item-card[onclick*="\'001\'"]').click();
    await expect(page.locator('.gal-counter')).toContainText('1 /');
    await page.click('.gal-nav.next');
    await expect(page.locator('.gal-counter')).toContainText('2 /');
    await page.click('.gal-nav.prev');
    await expect(page.locator('.gal-counter')).toContainText('1 /');
  });

  test('arrow keys navigate gallery images', async ({ page }) => {
    await page.locator('.item-card[onclick*="\'001\'"]').click();
    await expect(page.locator('.gal-counter')).toContainText('1 /');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.gal-counter')).toContainText('2 /');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.gal-counter')).toContainText('1 /');
  });

  test('sold item shows sold banner in modal', async ({ page }) => {
    // Item 021 (S&W 460) is sold
    await page.locator('.item-card[onclick*="\'021\'"]').click();
    await expect(page.locator('#modal')).toContainText('This item has been sold');
  });

  test('sold item shows "Sold" status field', async ({ page }) => {
    await page.locator('.item-card[onclick*="\'021\'"]').click();
    const statusField = page.locator('.field').filter({ hasText: 'Status' });
    await expect(statusField.locator('.sold-tag')).toBeVisible();
  });
});

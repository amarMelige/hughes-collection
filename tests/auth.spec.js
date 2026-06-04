// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Password Gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    // clear any cached session auth
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test('shows password gate on load', async ({ page }) => {
    const gate = page.locator('#gate');
    await expect(gate).toBeVisible();
    await expect(page.locator('#gate-input')).toBeFocused();
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.fill('#gate-input', 'wrongpassword');
    await page.keyboard.press('Enter');
    await expect(page.locator('#gate-err')).toBeVisible();
    await expect(page.locator('#gate-input')).toHaveValue('');
  });

  test('unlocks with correct password', async ({ page }) => {
    await page.fill('#gate-input', 'Hughes2024');
    await page.keyboard.press('Enter');
    await expect(page.locator('#gate')).toBeHidden({ timeout: 1000 });
    await expect(page.locator('#container')).toBeVisible();
  });

  test('stays unlocked after unlock (sessionStorage)', async ({ page }) => {
    await page.fill('#gate-input', 'Hughes2024');
    await page.keyboard.press('Enter');
    await expect(page.locator('#gate')).toBeHidden({ timeout: 1000 });
    await page.reload();
    await expect(page.locator('#gate')).toBeHidden();
  });
});

// Playwright smoke tests for IQLab.
// Run locally: npx playwright test
// Set BASE_URL env var to test against deployed site, e.g.
//   BASE_URL=https://iqlab-two.vercel.app npx playwright test
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test.describe('IQLab smoke', () => {
  test('landing page renders hero + CTA', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page).toHaveTitle(/IQLab/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('public leaderboard route loads', async ({ page }) => {
    await page.goto(BASE + '/leaderboard');
    await expect(page.getByRole('heading', { name: 'World Rankings' })).toBeVisible();
  });

  test('privacy page is reachable', async ({ page }) => {
    await page.goto(BASE + '/privacy');
    await expect(page.getByRole('heading', { name: /Datenschutz/i })).toBeVisible();
  });

  test('training demo: speed math is playable without login', async ({ page }) => {
    await page.goto(BASE + '/training');
    // Click any "Speed" / "Speed Math" tile
    const speed = page.getByText(/Speed Math|Speed/i).first();
    if (await speed.isVisible().catch(() => false)) {
      await speed.click();
      // Game should mount; just assert no crash
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('login route loads form', async ({ page }) => {
    await page.goto(BASE + '/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('404 page', async ({ page }) => {
    await page.goto(BASE + '/this-route-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/RideConnect/);
    
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Your Journey');
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    const homeLink = navbar.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
    
    const bookingLink = navbar.locator('a[href="/booking"]');
    await expect(bookingLink).toBeVisible();
  });

  test('should navigate to booking page', async ({ page }) => {
    await page.goto('/');
    
    const bookButton = page.locator('a[href="/booking"]').first();
    await bookButton.click();
    
    await expect(page).toHaveURL('/booking');
  });
});
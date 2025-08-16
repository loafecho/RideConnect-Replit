import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page).toHaveURL('/admin-login');
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('should login with correct credentials', async ({ page }) => {
    await page.goto('/admin-login');
    
    await page.fill('input[type="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL('/admin');
    
    const dashboard = page.locator('h1');
    await expect(dashboard).toContainText('Admin Dashboard');
  });

  test('should display bookings table', async ({ page }) => {
    await page.goto('/admin-login');
    await page.fill('input[type="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('/admin');
    
    const bookingsTable = page.locator('table');
    await expect(bookingsTable).toBeVisible();
    
    const headers = bookingsTable.locator('th');
    await expect(headers).toContainText(['ID', 'Customer', 'Date', 'Status']);
  });

  test('should allow creating time slots', async ({ page }) => {
    await page.goto('/admin-login');
    await page.fill('input[type="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('/admin');
    
    const createSlotButton = page.locator('button:has-text("Create Time Slot")');
    await expect(createSlotButton).toBeVisible();
  });
});
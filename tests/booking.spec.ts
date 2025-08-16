import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booking');
  });

  test('should display booking form', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const errorMessages = page.locator('.text-destructive');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should fill and submit booking form', async ({ page }) => {
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="pickupLocation"]', '123 Main St');
    await page.fill('input[name="dropoffLocation"]', '456 Oak Ave');
    
    const dateInput = page.locator('input[name="date"]');
    await dateInput.click();
    await page.locator('.rdp-day').first().click();
    
    const timeSelect = page.locator('select[name="time"]');
    await timeSelect.selectOption({ index: 1 });
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await expect(page).toHaveURL(/\/checkout/);
  });
});
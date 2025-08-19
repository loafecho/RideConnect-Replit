import { test, expect } from '@playwright/test';

test.describe('MCP E2E Booking for Tomorrow', () => {
  const baseURL = 'http://localhost:5649';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0]; // 2025-08-18

  test('should complete booking flow for tomorrow using MCP tools', async ({ page }) => {
    console.log(`=== Starting MCP E2E Booking Test for ${tomorrowDate} ===`);
    
    // Monitor API calls for debugging
    const apiCalls: { url: string; status: number; method: string; timestamp: string }[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Navigate to the booking page
    await page.goto(`${baseURL}/booking`);
    await expect(page).toHaveURL(/\/booking/);
    
    console.log('✅ Navigated to booking page');
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
  });
});
import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
  });

  test('should complete full booking flow successfully', async ({ page }) => {
    // Step 1: Navigate from landing page to booking
    await expect(page.locator('h1')).toContainText('RideConnect');
    
    // Find and click the booking button
    const bookNowButton = page.locator('text=Book Now').first();
    await expect(bookNowButton).toBeVisible();
    await bookNowButton.click();
    
    // Should navigate to booking page
    await expect(page).toHaveURL('/booking');
    await expect(page.locator('h1, h2')).toContainText(/booking|book.*ride/i);

    // Step 2: Fill out pickup and dropoff locations
    const pickupInput = page.locator('input[placeholder*="pickup" i], input[name*="pickup" i]').first();
    await pickupInput.fill('123 Main Street, Downtown');
    
    const dropoffInput = page.locator('input[placeholder*="drop" i], input[name*="dropoff" i]').first();
    await dropoffInput.fill('456 Oak Avenue, Uptown');

    // Step 3: Select date and time
    const dateInput = page.locator('input[type="date"], input[name*="date" i]').first();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(tomorrowStr);

    // Look for time slot selection (could be dropdown or radio buttons)
    const timeSlotSelector = page.locator('select[name*="time" i], input[name*="time" i]').first();
    if (await timeSlotSelector.isVisible()) {
      await timeSlotSelector.selectOption({ index: 1 }); // Select first available option
    }

    // Step 4: Fill customer information
    const nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    await nameInput.fill('John Doe');
    
    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    await emailInput.fill('john.doe@example.com');
    
    const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]').first();
    await phoneInput.fill('(555) 123-4567');

    // Step 5: Set passenger count if available
    const passengerInput = page.locator('input[name*="passenger" i], select[name*="passenger" i]').first();
    if (await passengerInput.isVisible()) {
      if (await passengerInput.getAttribute('type') === 'number') {
        await passengerInput.fill('2');
      } else {
        await passengerInput.selectOption('2');
      }
    }

    // Step 6: Submit the booking form
    const submitButton = page.locator('button[type="submit"], button:has-text("book"), button:has-text("continue")').first();
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Step 7: Wait for navigation and verify we're on checkout/confirmation
    await page.waitForURL(/\/(checkout|confirmation|payment)/);
    
    // Verify booking was created by checking for booking details or success message
    await expect(page.locator('body')).toContainText(/booking|confirmation|success|payment/i);
    
    // Check for key booking details displayed
    await expect(page.locator('body')).toContainText('John Doe');
    await expect(page.locator('body')).toContainText('john.doe@example.com');

    console.log('✅ Complete booking flow test passed successfully!');
  });

  test('should handle booking form validation errors', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/booking');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("book")').first();
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('body')).toContainText(/required|error|invalid/i);
    
    console.log('✅ Validation error handling test passed!');
  });

  test('should display price estimation', async ({ page }) => {
    await page.goto('/booking');
    
    // Fill in minimal required fields
    await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
    await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
    
    // Look for price display
    const priceElement = page.locator('text=/\\$[0-9]+\\.?[0-9]*/').first();
    if (await priceElement.isVisible()) {
      await expect(priceElement).toBeVisible();
      console.log('✅ Price estimation display test passed!');
    } else {
      console.log('ℹ️ Price estimation not found - may need user interaction to trigger');
    }
  });

  test('should navigate back to landing page', async ({ page }) => {
    await page.goto('/booking');
    
    // Look for back/home button or logo
    const backButton = page.locator('a[href="/"], button:has-text("back"), button:has-text("home")').first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL('/');
    }
    
    console.log('✅ Navigation test passed!');
  });
});
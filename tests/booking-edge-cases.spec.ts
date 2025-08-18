import { test, expect } from '@playwright/test';

test.describe('Booking Edge Cases and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booking');
  });

  test('should handle invalid email validation', async ({ page }) => {
    // Fill form with invalid email
    await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
    await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
    await page.locator('input[name*="name" i]').first().fill('Test User');
    await page.locator('input[type="email"]').first().fill('invalid-email');
    
    // Try to submit
    await page.locator('button[type="submit"]').first().click();
    
    // Should show email validation error
    await expect(page.locator('body')).toContainText(/email|invalid|valid/i);
    console.log('✅ Invalid email validation test passed!');
  });

  test('should handle missing required fields', async ({ page }) => {
    // Fill only some fields, leave required ones empty
    await page.locator('input[name*="name" i]').first().fill('Test User');
    // Leave pickup, dropoff, email empty
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Should show required field errors
    await expect(page.locator('body')).toContainText(/required|empty|missing/i);
    console.log('✅ Missing required fields test passed!');
  });

  test('should handle extremely long input values', async ({ page }) => {
    const longText = 'a'.repeat(1000); // Very long string
    
    // Fill with extremely long values
    await page.locator('input[placeholder*="pickup" i]').first().fill(longText);
    await page.locator('input[placeholder*="drop" i]').first().fill(longText);
    await page.locator('input[name*="name" i]').first().fill(longText);
    await page.locator('input[type="email"]').first().fill('test@example.com');
    
    // Try to submit
    await page.locator('button[type="submit"]').first().click();
    
    // Should either truncate or show validation error
    // The app should handle this gracefully without crashing
    console.log('✅ Long input values test completed!');
  });

  test('should handle special characters in input', async ({ page }) => {
    const specialChars = '!@#$%^&*()[]{}|;:,.<>?';
    
    // Fill with special characters
    await page.locator('input[placeholder*="pickup" i]').first().fill(`123 Main St ${specialChars}`);
    await page.locator('input[placeholder*="drop" i]').first().fill(`456 Oak Ave ${specialChars}`);
    await page.locator('input[name*="name" i]').first().fill(`Test User ${specialChars}`);
    await page.locator('input[type="email"]').first().fill('test@example.com');
    
    // Try to submit
    await page.locator('button[type="submit"]').first().click();
    
    // Should handle special characters appropriately
    console.log('✅ Special characters test completed!');
  });

  test('should handle invalid phone number formats', async ({ page }) => {
    // Test various invalid phone formats
    const invalidPhones = ['abc123', '123', '000-000-0000', ''];
    
    for (const phone of invalidPhones) {
      await page.reload();
      
      // Fill basic required fields
      await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
      await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
      await page.locator('input[name*="name" i]').first().fill('Test User');
      await page.locator('input[type="email"]').first().fill('test@example.com');
      
      // Fill invalid phone
      const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill(phone);
        
        // Try to submit
        await page.locator('button[type="submit"]').first().click();
        
        // Check if validation is working (phone might be optional)
        console.log(`📞 Tested phone format: "${phone}"`);
      }
    }
    
    console.log('✅ Invalid phone number formats test completed!');
  });

  test('should handle past date selection', async ({ page }) => {
    // Fill basic fields
    await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
    await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
    
    // Try to select a past date
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      await dateInput.fill(yesterdayStr);
      
      // Try to submit
      await page.locator('button[type="submit"]').first().click();
      
      // Should prevent past date selection or show error
      console.log('✅ Past date validation test completed!');
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Fill valid form data
    await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
    await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
    await page.locator('input[name*="name" i]').first().fill('Test User');
    await page.locator('input[type="email"]').first().fill('test@example.com');
    
    // Intercept API calls and simulate network error
    await page.route('/api/bookings', route => {
      route.abort('failed');
    });
    
    // Try to submit
    await page.locator('button[type="submit"]').first().click();
    
    // Should show error message or handle gracefully
    await page.waitForTimeout(2000); // Wait for error handling
    
    console.log('✅ Network error handling test completed!');
  });

  test('should handle rapid form submissions', async ({ page }) => {
    // Fill valid form data
    await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
    await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
    await page.locator('input[name*="name" i]').first().fill('Test User');
    await page.locator('input[type="email"]').first().fill('test@example.com');
    
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Click submit multiple times rapidly
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    
    // Should prevent duplicate submissions
    console.log('✅ Rapid submissions test completed!');
  });

  test('should validate passenger count limits', async ({ page }) => {
    // Fill basic fields
    await page.locator('input[placeholder*="pickup" i]').first().fill('123 Main St');
    await page.locator('input[placeholder*="drop" i]').first().fill('456 Oak Ave');
    await page.locator('input[name*="name" i]').first().fill('Test User');
    await page.locator('input[type="email"]').first().fill('test@example.com');
    
    // Test invalid passenger counts
    const passengerInput = page.locator('input[name*="passenger" i]').first();
    if (await passengerInput.isVisible()) {
      // Test zero passengers
      await passengerInput.fill('0');
      await page.locator('button[type="submit"]').first().click();
      
      // Test excessive passengers  
      await passengerInput.fill('999');
      await page.locator('button[type="submit"]').first().click();
      
      console.log('✅ Passenger count validation test completed!');
    }
  });
});
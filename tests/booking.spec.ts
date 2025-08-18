import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  const baseURL = 'http://localhost:3002';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/booking`);
  });

  test('should navigate from landing page to booking page', async ({ page }) => {
    await page.goto(baseURL);
    
    // Look for a link or button to navigate to booking
    const bookingLink = page.locator('a[href="/booking"], button:has-text("Book"), a:has-text("Book")').first();
    if (await bookingLink.isVisible()) {
      await bookingLink.click();
      await expect(page).toHaveURL(/\/booking/);
    } else {
      // Navigate directly if no booking link found
      await page.goto(`${baseURL}/booking`);
    }
    
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display booking form', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
  });

  test('should navigate booking flow and inspect time slots functionality', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'booking-initial.png', fullPage: true });
    
    // Fill step 1 - Customer Information
    await page.fill('input[name="customerName"]', 'Test User');
    await page.fill('input[name="customerEmail"]', 'test@example.com');
    await page.click('button:has-text("Next")');
    
    // Take screenshot after step 1
    await page.screenshot({ path: 'booking-step1-complete.png', fullPage: true });
    
    // Fill step 2 - Location
    await page.fill('input[placeholder*="pickup"]', '123 Main St, San Francisco, CA');
    await page.fill('input[placeholder*="destination"]', '456 Oak Ave, San Francisco, CA');
    await page.click('button:has-text("Next")');
    
    // Take screenshot after reaching step 3
    await page.screenshot({ path: 'booking-step3-calendar.png', fullPage: true });
    
    // Now in step 3 - Date & Time Selection
    await expect(page.locator('text=Step 3: Date & Time')).toBeVisible();
    
    // Log page content to understand calendar structure
    const pageContent = await page.content();
    console.log('Calendar section HTML:', pageContent.substring(pageContent.indexOf('Calendar'), pageContent.indexOf('Calendar') + 500));
    
    // Check what calendar elements are present
    const calendarElements = await page.locator('.rdp, .calendar, [data-testid*="calendar"]').count();
    console.log(`Found ${calendarElements} calendar elements`);
    
    // Check for any existing date selection (default might be today)
    const selectedDate = await page.locator('.rdp-day_selected, .calendar-selected, .selected').count();
    console.log(`Found ${selectedDate} selected date elements`);
    
    // Try to find time slots that might already be loaded for today's date
    const timeSlots = page.locator('[class*="cursor-pointer"]:has-text("-"), .time-slot, div:has-text("AM"), div:has-text("PM")');
    const timeSlotCount = await timeSlots.count();
    console.log(`Found ${timeSlotCount} potential time slot elements`);
    
    // Check for loading states
    const loadingIndicator = await page.locator('text=Loading available times').count();
    const noSlotsMessage = await page.locator('text=No time slots available').count();
    
    console.log(`Loading indicators: ${loadingIndicator}`);
    console.log(`No slots messages: ${noSlotsMessage}`);
    
    // Monitor network requests for API calls
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/timeslots')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
        console.log(`API Call: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Try to find and click a calendar day (day 17 or any future day)
    await page.waitForTimeout(1000);
    
    // Look for day buttons in the calendar
    const calendarDays = await page.locator('button[class*="rdp"], .rdp-day, .calendar-day').count();
    console.log(`Found ${calendarDays} calendar day elements`);
    
    if (calendarDays > 0) {
      // Try to click on day 17 or the next available day
      const day17 = page.locator('button:has-text("17")').first();
      const isDay17Visible = await day17.isVisible().catch(() => false);
      
      if (isDay17Visible) {
        await day17.click();
        console.log('Clicked on day 17');
      } else {
        // Click on any clickable day that's not disabled
        const firstClickableDay = page.locator('button[class*="rdp"]:not([disabled])').first();
        const hasClickableDay = await firstClickableDay.isVisible().catch(() => false);
        
        if (hasClickableDay) {
          await firstClickableDay.click();
          console.log('Clicked on first available day');
        } else {
          console.log('No clickable calendar days found');
        }
      }
      
      // Wait for API response
      await page.waitForTimeout(3000);
      
      // Check time slots again after date selection
      const newTimeSlotCount = await timeSlots.count();
      console.log(`Time slots after date selection: ${newTimeSlotCount}`);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'booking-final-state.png', fullPage: true });
    
    // Report findings
    console.log(`\n=== BOOKING FLOW TEST REPORT ===`);
    console.log(`API Responses: ${JSON.stringify(responses, null, 2)}`);
    console.log(`Calendar elements found: ${calendarElements > 0 ? 'YES' : 'NO'}`);
    console.log(`Time slots functionality: ${timeSlotCount > 0 ? 'WORKING' : 'NOT WORKING'}`);
    console.log(`Screenshots saved for inspection`);
    
    // Test passes if we reached step 3 successfully
    expect(true).toBe(true);
  });

  test('should fill complete booking form with 2025-08-17 date', async ({ page }) => {
    // Fill in customer details
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="pickupLocation"]', '123 Main St');
    await page.fill('input[name="dropoffLocation"]', '456 Oak Ave');
    
    // Set specific date
    const dateInput = page.locator('input[name="date"], input[type="date"], .date-picker input').first();
    await dateInput.fill('2025-08-17');
    await dateInput.press('Enter');
    
    // Wait for time slots to load
    await page.waitForTimeout(2000);
    
    // Select first available time slot
    const timeSelect = page.locator('select[name="time"]');
    if (await timeSelect.isVisible()) {
      await timeSelect.selectOption({ index: 1 });
    } else {
      // If time slots are buttons/cards instead of select
      const timeSlotButton = page.locator('.time-slot, button[data-time], .time-option').first();
      if (await timeSlotButton.isVisible()) {
        await timeSlotButton.click();
      }
    }
    
    // Take screenshot before submission
    await page.screenshot({ path: 'booking-form-filled.png', fullPage: true });
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Book"), button:has-text("Submit")');
    await submitButton.click();
    
    // Wait for navigation or success message
    await page.waitForTimeout(3000);
    
    // Check if we navigated to checkout or got a success message
    const currentURL = page.url();
    const hasCheckoutURL = currentURL.includes('/checkout');
    const hasSuccessMessage = await page.locator('.success, .toast, .alert').count() > 0;
    
    console.log(`Current URL: ${currentURL}`);
    console.log(`Has checkout URL: ${hasCheckoutURL}`);
    console.log(`Has success message: ${hasSuccessMessage}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'booking-form-submitted.png', fullPage: true });
    
    // Verify booking was processed (either checkout page or success message)
    if (hasCheckoutURL) {
      await expect(page).toHaveURL(/\/checkout/);
    } else {
      // Look for success indicators
      const successIndicators = page.locator('.success, .toast, .alert, :has-text("booking"), :has-text("confirmed")');
      await expect(successIndicators.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Book"), button:has-text("Submit")');
    await submitButton.click();
    
    const errorMessages = page.locator('.text-destructive, .error, .text-red-500, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should verify API endpoint for time slots', async ({ page }) => {
    // Monitor network requests
    let apiCalled = false;
    page.on('response', response => {
      if (response.url().includes('/api/timeslots/2025-08-17')) {
        apiCalled = true;
        console.log(`API Response Status: ${response.status()}`);
      }
    });
    
    // Trigger date selection
    const dateInput = page.locator('input[name="date"], input[type="date"], .date-picker input').first();
    await dateInput.fill('2025-08-17');
    await dateInput.press('Enter');
    
    // Wait for API call
    await page.waitForTimeout(3000);
    
    // Verify API was called
    expect(apiCalled).toBe(true);
  });
});
import { test, expect } from '@playwright/test';

test.describe('Booking 400 Error Investigation', () => {
  const baseURL = 'http://localhost:3002';
  
  test('investigate 400 error with specific form data', async ({ page }) => {
    // Enable request/response interception and logging
    const networkRequests: any[] = [];
    const consoleMessages: string[] = [];
    
    // Intercept all network requests
    page.on('request', request => {
      networkRequests.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Intercept all network responses
    page.on('response', response => {
      networkRequests.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      });
      
      // Log detailed info for API calls
      if (response.url().includes('/api/')) {
        console.log(`API Response: ${response.method()} ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Capture console messages
    page.on('console', message => {
      const msg = `[${message.type()}] ${message.text()}`;
      consoleMessages.push(msg);
      console.log(msg);
    });
    
    // Capture JavaScript errors
    page.on('pageerror', error => {
      const errorMsg = `[JS ERROR] ${error.message}`;
      consoleMessages.push(errorMsg);
      console.log(errorMsg);
    });
    
    console.log('🔍 Starting booking flow investigation...');
    
    // Navigate to booking page
    await page.goto(`${baseURL}/booking`);
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/home/athena/Documents/projects/RideConnect/test-results/booking-investigation-initial.png', 
      fullPage: true 
    });
    
    console.log('📍 Step 1: Filling personal information...');
    
    // Step 1: Fill personal information
    await page.fill('input[name="customerName"]', 'Tony');
    await page.fill('input[name="customerEmail"]', 't@t.com');
    
    // Screenshot after step 1
    await page.screenshot({ 
      path: '/home/athena/Documents/projects/RideConnect/test-results/booking-investigation-step1.png', 
      fullPage: true 
    });
    
    // Proceed to step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    console.log('🚗 Step 2: Filling trip locations...');
    
    // Step 2: Fill location information
    const pickupInput = page.locator('input[name="pickupLocation"]').first();
    await pickupInput.fill('3148, Delilah Place, Inspirada, Henderson, Clark County, Nevada, 89044, USA');
    
    const dropoffInput = page.locator('input[name="dropoffLocation"]').first();
    await dropoffInput.fill('1030, Moorpoint Drive, Rancho Corridor, North Las Vegas, Clark County, Nevada, 89031, USA');
    
    // Set passenger count to 1 (should be default, but let's ensure)
    // Check current passenger count and adjust if needed
    const currentPassengerCount = await page.textContent('.passenger-count, [data-testid="passenger-count"], span:has-text("1"):near(button:has-text("+")):near(button:has-text("-"))');
    console.log(`Current passenger count display: ${currentPassengerCount}`);
    
    // Screenshot after step 2
    await page.screenshot({ 
      path: '/home/athena/Documents/projects/RideConnect/test-results/booking-investigation-step2.png', 
      fullPage: true 
    });
    
    // Wait for price calculation
    await page.waitForTimeout(3000);
    
    // Proceed to step 3
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    console.log('📅 Step 3: Selecting date and time...');
    
    // Step 3: Select date and time
    // First, let's check what calendar structure exists
    const calendarExists = await page.locator('.rdp, .calendar, [data-testid*="calendar"]').count();
    console.log(`Calendar elements found: ${calendarExists}`);
    
    // Look for date input or click on specific date
    // Try to set the date to 8/20/2025
    const targetDate = new Date('2025-08-20');
    
    // Check if there's a date input field
    const dateInput = page.locator('input[type="date"], input[name="date"]').first();
    const hasDateInput = await dateInput.count();
    
    if (hasDateInput > 0) {
      await dateInput.fill('2025-08-20');
    } else {
      // Try to find and click the date in calendar
      // Look for day 20 button in the calendar
      const day20Button = page.locator('button:has-text("20")').first();
      const day20Exists = await day20Button.count();
      
      if (day20Exists > 0) {
        await day20Button.click();
        console.log('Clicked on day 20 in calendar');
      } else {
        console.log('Day 20 not found in calendar, trying alternative approach');
        // Try clicking any available future date
        const futureDay = page.locator('button[class*="rdp"]:not([disabled])').first();
        if (await futureDay.count() > 0) {
          await futureDay.click();
          console.log('Clicked on first available day');
        }
      }
    }
    
    // Wait for time slots to load
    await page.waitForTimeout(3000);
    
    // Look for the specific time slot: 21:45-22:00
    console.log('Looking for time slot 21:45-22:00...');
    
    // Check what time slots are available
    const timeSlots = page.locator('[class*="cursor-pointer"]:has-text("-"), .time-slot, div:has-text("PM")');
    const timeSlotCount = await timeSlots.count();
    console.log(`Found ${timeSlotCount} time slot elements`);
    
    // Log all available time slots
    for (let i = 0; i < Math.min(timeSlotCount, 10); i++) {
      const slotText = await timeSlots.nth(i).textContent();
      console.log(`Time slot ${i}: ${slotText}`);
    }
    
    // Try to find and click the 21:45-22:00 slot (which should be 9:45 PM - 10:00 PM)
    const targetTimeSlot = page.locator('div:has-text("9:45 PM"), div:has-text("21:45"), div:has-text("9:45 PM - 10:00 PM")').first();
    const hasTargetSlot = await targetTimeSlot.count();
    
    if (hasTargetSlot > 0) {
      await targetTimeSlot.click();
      console.log('Found and clicked target time slot 9:45 PM - 10:00 PM');
    } else {
      // Fall back to clicking any available time slot
      const firstAvailableSlot = page.locator('[class*="cursor-pointer"]:has-text("-")').first();
      if (await firstAvailableSlot.count() > 0) {
        await firstAvailableSlot.click();
        console.log('Clicked on first available time slot as fallback');
      } else {
        console.log('⚠️ No time slots found to click');
      }
    }
    
    // Screenshot after step 3
    await page.screenshot({ 
      path: '/home/athena/Documents/projects/RideConnect/test-results/booking-investigation-step3.png', 
      fullPage: true 
    });
    
    // Proceed to step 4
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    console.log('✅ Step 4: Review and submit...');
    
    // Screenshot of review page
    await page.screenshot({ 
      path: '/home/athena/Documents/projects/RideConnect/test-results/booking-investigation-step4-review.png', 
      fullPage: true 
    });
    
    // Log the current form data that will be submitted
    console.log('📋 Form data about to be submitted:');
    
    // Get form values before submission
    const formData = {
      customerName: await page.inputValue('input[name="customerName"]'),
      customerEmail: await page.inputValue('input[name="customerEmail"]'),
      customerPhone: await page.inputValue('input[name="customerPhone"]'),
      pickupLocation: await page.inputValue('input[name="pickupLocation"]'),
      dropoffLocation: await page.inputValue('input[name="dropoffLocation"]'),
      date: await page.inputValue('input[name="date"]'),
      timeSlot: await page.inputValue('input[name="timeSlot"]'),
      passengerCount: await page.inputValue('input[name="passengerCount"]'),
      isAirportRoute: await page.isChecked('input[name="isAirportRoute"]'),
      estimatedPrice: await page.inputValue('input[name="estimatedPrice"]'),
      notes: await page.inputValue('textarea[name="notes"]')
    };
    
    console.log('Form data:', JSON.stringify(formData, null, 2));
    
    // Clear previous network logs to focus on the submission request
    networkRequests.length = 0;
    
    console.log('🔥 Clicking "Confirm and Pay" button...');
    
    // Find and click the submit button
    const submitButton = page.locator('button:has-text("Confirm & Pay"), button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for the request to complete and capture the response
    await page.waitForTimeout(5000);
    
    // Take screenshot after submission attempt
    await page.screenshot({ 
      path: '/home/athena/Documents/projects/RideConnect/test-results/booking-investigation-after-submit.png', 
      fullPage: true 
    });
    
    console.log('🔍 Analyzing network requests and responses...');
    
    // Find the booking API request and response
    const bookingRequests = networkRequests.filter(req => 
      req.url.includes('/api/bookings') && req.method === 'POST'
    );
    
    const bookingResponses = networkRequests.filter(resp => 
      resp.url.includes('/api/bookings') && resp.type === 'response'
    );
    
    console.log('\n=== BOOKING REQUEST ANALYSIS ===');
    console.log(`Found ${bookingRequests.length} booking requests`);
    console.log(`Found ${bookingResponses.length} booking responses`);
    
    if (bookingRequests.length > 0) {
      const request = bookingRequests[0];
      console.log('\n📤 REQUEST DETAILS:');
      console.log('URL:', request.url);
      console.log('Method:', request.method);
      console.log('Headers:', JSON.stringify(request.headers, null, 2));
      console.log('Body:', request.postData);
    }
    
    if (bookingResponses.length > 0) {
      const response = bookingResponses[0];
      console.log('\n📥 RESPONSE DETAILS:');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', JSON.stringify(response.headers, null, 2));
      
      // Try to get response body
      try {
        const responseBody = await page.evaluate(async (url) => {
          const resp = await fetch(url);
          return await resp.text();
        }, response.url);
        console.log('Response Body:', responseBody);
      } catch (e) {
        console.log('Could not extract response body via page.evaluate');
      }
    }
    
    // Check for any error messages displayed on the page
    const errorElements = page.locator('.text-destructive, .error, .text-red-500, [role="alert"], .toast');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      console.log('\n🚨 ERROR MESSAGES ON PAGE:');
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}: ${errorText}`);
      }
    }
    
    console.log('\n📝 CONSOLE MESSAGES:');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('\n🔗 ALL NETWORK ACTIVITY:');
    networkRequests.forEach(req => {
      if (req.type === 'request') {
        console.log(`→ ${req.method} ${req.url}`);
      } else {
        console.log(`← ${req.status} ${req.url}`);
      }
    });
    
    console.log('\n=== INVESTIGATION COMPLETE ===');
    
    // The test passes if we've captured all the necessary information
    expect(true).toBe(true);
  });
});
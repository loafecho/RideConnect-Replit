import { google } from 'googleapis';
import type { IBooking as Booking } from "@shared/mongoSchema";

// Google Calendar API Configuration
interface GoogleCalendarConfig {
  serviceAccountKeyPath: string;
  calendarId: string;
}

// Google Calendar Event Types
interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
}

interface GoogleCalendarEventResponse {
  id: string;
  htmlLink: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  status: string;
}

class GoogleCalendarError extends Error {
  statusCode: number;
  details?: any;
  
  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'GoogleCalendarError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class GoogleCalendarService {
  private calendar: any;
  private config: GoogleCalendarConfig;
  private isEnabled: boolean;

  constructor() {
    this.config = {
      serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || '',
      calendarId: process.env.GOOGLE_CALENDAR_ID || '',
    };

    // Check if Google Calendar is properly configured
    this.isEnabled = !!(this.config.serviceAccountKeyPath && this.config.calendarId);

    if (this.isEnabled) {
      try {
        this.initializeCalendarClient();
        console.log("✅ Google Calendar service initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize Google Calendar service:", error);
        this.isEnabled = false;
      }
    } else {
      console.log("⚠️ Google Calendar not configured - calendar features will be disabled");
    }
  }

  /**
   * Initialize Google Calendar API client with service account
   */
  private initializeCalendarClient() {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: this.config.serviceAccountKeyPath,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
    } catch (error) {
      throw new Error(`Failed to initialize Google Calendar client: ${error}`);
    }
  }

  /**
   * Check if Google Calendar integration is enabled
   */
  isGoogleCalendarEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Create a calendar event for a booking
   */
  async createEvent(booking: Booking): Promise<GoogleCalendarEventResponse | null> {
    if (!this.isEnabled) {
      console.log("Google Calendar not configured, skipping event creation");
      return null;
    }

    try {
      const eventData = this.mapBookingToGoogleCalendarEvent(booking);
      
      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: eventData,
      });

      const event = response.data;
      console.log(`✅ Google Calendar event created: ${event.id}`);
      return {
        id: event.id,
        htmlLink: event.htmlLink,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        status: event.status,
      };

    } catch (error) {
      console.error('Google Calendar event creation failed:', error);
      
      // Don't throw - allow the booking to proceed without Google Calendar
      // This ensures graceful degradation
      return null;
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    eventId: string, 
    booking: Booking
  ): Promise<GoogleCalendarEventResponse | null> {
    if (!this.isEnabled || !eventId) {
      return null;
    }

    try {
      const eventData = this.mapBookingToGoogleCalendarEvent(booking);
      
      const response = await this.calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: eventId,
        resource: eventData,
      });

      const event = response.data;
      console.log(`✅ Google Calendar event updated: ${eventId}`);
      return {
        id: event.id,
        htmlLink: event.htmlLink,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        status: event.status,
      };

    } catch (error) {
      console.error('Google Calendar event update failed:', error);
      return null;
    }
  }

  /**
   * Cancel/delete a calendar event
   */
  async cancelEvent(eventId: string): Promise<boolean> {
    if (!this.isEnabled || !eventId) {
      return false;
    }

    try {
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId,
      });

      console.log(`✅ Google Calendar event cancelled: ${eventId}`);
      return true;

    } catch (error) {
      console.error('Google Calendar event cancellation failed:', error);
      return false;
    }
  }

  /**
   * Get event details from Google Calendar
   */
  async getEvent(eventId: string): Promise<GoogleCalendarEventResponse | null> {
    if (!this.isEnabled || !eventId) {
      return null;
    }

    try {
      const response = await this.calendar.events.get({
        calendarId: this.config.calendarId,
        eventId: eventId,
      });

      const event = response.data;
      return {
        id: event.id,
        htmlLink: event.htmlLink,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        status: event.status,
      };

    } catch (error) {
      console.error('Google Calendar event fetch failed:', error);
      return null;
    }
  }

  /**
   * Check for conflicts in the specified time slot
   */
  async checkAvailability(date: string, timeSlot: string): Promise<boolean> {
    if (!this.isEnabled) {
      return true; // Assume available if calendar not configured
    }

    try {
      const [startTime, endTime] = timeSlot.split('-');
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDateTime,
        timeMax: endDateTime,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      const hasConflict = events.length > 0;

      if (hasConflict) {
        console.log(`⚠️ Calendar conflict detected for ${date} ${timeSlot}`);
        console.log(`Conflicting events: ${events.map((e: any) => e.summary).join(', ')}`);
      }

      return !hasConflict; // Return true if available (no conflicts)

    } catch (error) {
      console.error('Google Calendar availability check failed:', error);
      return true; // Assume available on error
    }
  }

  /**
   * Map RideConnect booking to Google Calendar event format
   */
  private mapBookingToGoogleCalendarEvent(booking: Booking): GoogleCalendarEvent {
    // Parse time slot (e.g., "14:00-14:15" or "16:00-16:15")
    const [startTime, endTime] = booking.timeSlot.split('-');
    
    // Create ISO datetime strings (assuming Pacific Time for now)
    const timeZone = 'America/Los_Angeles';
    const startDateTime = `${booking.date}T${startTime}:00`;
    const endDateTime = `${booking.date}T${endTime}:00`;

    // Build comprehensive event description
    const eventDescription = [
      `🚗 Ride Booking #${booking.id}`,
      ``,
      `📋 Booking Details:`,
      `• Customer: ${booking.customerName}`,
      `• Email: ${booking.customerEmail}`,
      `• Phone: ${booking.customerPhone || 'Not provided'}`,
      `• Passengers: ${booking.passengerCount}`,
      ``,
      `📍 Route:`,
      `• Pickup: ${booking.pickupLocation}`,
      `• Drop-off: ${booking.dropoffLocation}`,
      `${booking.isAirportRoute ? '• ✈️ Airport Route (Premium Rate)' : ''}`,
      ``,
      `💰 Pricing:`,
      `• Estimated Price: $${booking.estimatedPrice}`,
      `• Status: ${booking.status || 'Pending'}`,
      ``,
      booking.notes ? `📝 Additional Notes:\n${booking.notes}` : null,
    ].filter(Boolean).join('\n');

    // Create event summary (title)
    const summary = `Ride: ${this.truncateLocation(booking.pickupLocation)} → ${this.truncateLocation(booking.dropoffLocation)}`;

    return {
      summary,
      description: eventDescription,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      // attendees: [
      //   {
      //     email: booking.customerEmail,
      //     displayName: booking.customerName,
      //   },
      // ], // Disabled - requires Domain-Wide Delegation
      location: booking.pickupLocation,
    };
  }

  /**
   * Truncate location strings for cleaner titles
   */
  private truncateLocation(location: string, maxLength: number = 30): string {
    if (location.length <= maxLength) {
      return location;
    }
    
    // Try to find a logical break point (comma, address components)
    const commaIndex = location.indexOf(',');
    if (commaIndex > 0 && commaIndex <= maxLength) {
      return location.substring(0, commaIndex);
    }
    
    return location.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get service status for monitoring
   */
  getServiceStatus() {
    return {
      enabled: this.isEnabled,
      configured: {
        serviceAccountKeyPath: !!this.config.serviceAccountKeyPath,
        calendarId: !!this.config.calendarId,
      },
      config: {
        serviceAccountKeyPath: this.config.serviceAccountKeyPath,
        calendarId: this.config.calendarId,
      }
    };
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Export types for use in other modules
export type { GoogleCalendarEventResponse, GoogleCalendarEvent, GoogleCalendarError };
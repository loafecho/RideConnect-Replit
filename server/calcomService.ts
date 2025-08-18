import type { Booking } from "@shared/schema";

// Cal.com API Configuration
interface CalComConfig {
  apiUrl: string;
  accessToken: string;
  eventTypeId: string;
  userId: string;
}

// Cal.com API Types
interface CalComBookingRequest {
  eventTypeId: string;
  name: string;
  email: string;
  start: string;
  end: string;
  title?: string;
  notes?: string;
  timeZone?: string;
  language?: string;
}

interface CalComBookingResponse {
  id: string;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees: Array<{
    name: string;
    email: string;
  }>;
}

interface CalComError {
  message: string;
  statusCode: number;
  details?: any;
}

export class CalComService {
  private config: CalComConfig;
  private isEnabled: boolean;

  constructor() {
    this.config = {
      apiUrl: process.env.CAL_COM_API_URL || 'https://api.cal.com/v2',
      accessToken: process.env.CAL_COM_ACCESS_TOKEN || '',
      eventTypeId: process.env.CAL_COM_EVENT_TYPE_ID || '',
      userId: process.env.CAL_COM_USER_ID || '',
    };

    // Check if Cal.com is properly configured
    this.isEnabled = !!(
      this.config.accessToken && 
      this.config.eventTypeId && 
      this.config.userId
    );

    if (this.isEnabled) {
      console.log("✅ Cal.com service initialized successfully");
    } else {
      console.log("⚠️ Cal.com not configured - calendar features will be disabled");
    }
  }

  /**
   * Check if Cal.com integration is enabled
   */
  isCalComEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Create a booking in Cal.com
   */
  async createBooking(booking: Booking): Promise<CalComBookingResponse | null> {
    if (!this.isEnabled) {
      console.log("Cal.com not configured, skipping booking creation");
      return null;
    }

    try {
      const calBookingData = this.mapBookingToCalCom(booking);
      
      const response = await fetch(`${this.config.apiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calBookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new CalComError(
          error.message || 'Failed to create Cal.com booking',
          response.status,
          error
        );
      }

      const calBooking = await response.json();
      console.log(`✅ Cal.com booking created: ${calBooking.id}`);
      return calBooking;

    } catch (error) {
      console.error('Cal.com booking creation failed:', error);
      
      // Don't throw - allow the booking to proceed without Cal.com
      // This ensures graceful degradation
      return null;
    }
  }

  /**
   * Update a booking in Cal.com
   */
  async updateBooking(
    calBookingId: string, 
    updates: Partial<CalComBookingRequest>
  ): Promise<CalComBookingResponse | null> {
    if (!this.isEnabled || !calBookingId) {
      return null;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/bookings/${calBookingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new CalComError(
          error.message || 'Failed to update Cal.com booking',
          response.status,
          error
        );
      }

      const updatedBooking = await response.json();
      console.log(`✅ Cal.com booking updated: ${calBookingId}`);
      return updatedBooking;

    } catch (error) {
      console.error('Cal.com booking update failed:', error);
      return null;
    }
  }

  /**
   * Cancel a booking in Cal.com
   */
  async cancelBooking(calBookingId: string): Promise<boolean> {
    if (!this.isEnabled || !calBookingId) {
      return false;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/bookings/${calBookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new CalComError(
          error.message || 'Failed to cancel Cal.com booking',
          response.status,
          error
        );
      }

      console.log(`✅ Cal.com booking cancelled: ${calBookingId}`);
      return true;

    } catch (error) {
      console.error('Cal.com booking cancellation failed:', error);
      return false;
    }
  }

  /**
   * Get booking details from Cal.com
   */
  async getBooking(calBookingId: string): Promise<CalComBookingResponse | null> {
    if (!this.isEnabled || !calBookingId) {
      return null;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/bookings/${calBookingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new CalComError(
          error.message || 'Failed to get Cal.com booking',
          response.status,
          error
        );
      }

      return await response.json();

    } catch (error) {
      console.error('Cal.com booking fetch failed:', error);
      return null;
    }
  }

  /**
   * Map RideConnect booking to Cal.com booking format
   */
  private mapBookingToCalCom(booking: Booking): CalComBookingRequest {
    // Parse time slot (e.g., "14:00-14:15" or "16:00-16:15")
    const [startTime, endTime] = booking.timeSlot.split('-');
    
    // Create ISO datetime strings
    const startDateTime = `${booking.date}T${startTime}:00`;
    const endDateTime = `${booking.date}T${endTime}:00`;

    // Build comprehensive booking notes
    const bookingNotes = [
      `🚗 Ride Booking #${booking.id}`,
      `📍 Pickup: ${booking.pickupLocation}`,
      `📍 Drop-off: ${booking.dropoffLocation}`,
      `👥 Passengers: ${booking.passengerCount}`,
      booking.customerPhone ? `📞 Phone: ${booking.customerPhone}` : null,
      booking.isAirportRoute ? '✈️ Airport Route (Premium Rate)' : null,
      booking.notes ? `📝 Notes: ${booking.notes}` : null,
      `💰 Price: $${booking.estimatedPrice}`,
    ].filter(Boolean).join('\n');

    return {
      eventTypeId: this.config.eventTypeId,
      name: booking.customerName,
      email: booking.customerEmail,
      start: startDateTime,
      end: endDateTime,
      title: `Ride: ${this.truncateLocation(booking.pickupLocation)} → ${this.truncateLocation(booking.dropoffLocation)}`,
      notes: bookingNotes,
      timeZone: 'America/Los_Angeles', // TODO: Make configurable
      language: 'en',
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
        apiUrl: !!this.config.apiUrl,
        accessToken: !!this.config.accessToken,
        eventTypeId: !!this.config.eventTypeId,
        userId: !!this.config.userId,
      },
      config: {
        apiUrl: this.config.apiUrl,
        eventTypeId: this.config.eventTypeId,
        userId: this.config.userId,
      }
    };
  }
}

// Export singleton instance
export const calcomService = new CalComService();

// Export types for use in other modules
export type { CalComBookingResponse, CalComBookingRequest, CalComError };
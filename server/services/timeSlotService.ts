import { storage } from "../storage";
import { InsertTimeSlot } from "@shared/mongoSchema";

// Business hours configuration
const TIME_SLOT_CONFIG = {
  START_HOUR: 15, // 3 PM
  END_HOUR: 23,    // 11 PM
  INTERVAL_MINUTES: 15
};

/**
 * Generate default time slots for a given date
 */
export async function generateDefaultTimeSlots(date: string): Promise<void> {
  const slots: InsertTimeSlot[] = [];
  
  for (let hour = TIME_SLOT_CONFIG.START_HOUR; hour < TIME_SLOT_CONFIG.END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIME_SLOT_CONFIG.INTERVAL_MINUTES) {
      const startTime = formatTime(hour, minute);
      const { endHour, endMinute } = calculateEndTime(hour, minute);
      const endTime = formatTime(endHour, endMinute);
      
      slots.push({
        date,
        startTime,
        endTime,
        isAvailable: true
      });
    }
  }
  
  // Create all slots in the database
  for (const slot of slots) {
    await storage.createTimeSlot(slot);
  }
}

/**
 * Format hour and minute to HH:MM string
 */
function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Calculate end time based on start time and interval
 */
function calculateEndTime(hour: number, minute: number): { endHour: number; endMinute: number } {
  const endMinute = minute === 45 ? 0 : minute + TIME_SLOT_CONFIG.INTERVAL_MINUTES;
  const endHour = minute === 45 ? hour + 1 : hour;
  return { endHour, endMinute };
}

/**
 * Check if a date should have default time slots generated
 */
export function shouldGenerateSlots(requestedDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return requestedDate >= today;
}

/**
 * Get or create time slots for a specific date
 */
export async function getOrCreateTimeSlots(date: string) {
  let slots = await storage.getTimeSlotsByDate(date);
  
  if (slots.length === 0) {
    const requestedDate = new Date(date + 'T00:00:00');
    
    if (shouldGenerateSlots(requestedDate)) {
      await generateDefaultTimeSlots(date);
      slots = await storage.getTimeSlotsByDate(date);
    }
  }
  
  return slots;
}

/**
 * Validate time slot data
 */
export function validateTimeSlot(slot: any): string | null {
  if (!slot.date) return "Date is required";
  if (!slot.startTime) return "Start time is required";
  if (!slot.endTime) return "End time is required";
  
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(slot.startTime)) return "Invalid start time format";
  if (!timeRegex.test(slot.endTime)) return "Invalid end time format";
  
  // Validate that end time is after start time
  const [startHour, startMinute] = slot.startTime.split(':').map(Number);
  const [endHour, endMinute] = slot.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    return "End time must be after start time";
  }
  
  return null;
}

/**
 * Get available time slots for booking
 */
export async function getAvailableSlots(date: string) {
  const allSlots = await getOrCreateTimeSlots(date);
  return allSlots.filter(slot => slot.isAvailable);
}

/**
 * Mark a time slot as booked
 */
export async function markSlotAsBooked(date: string, timeSlot: string) {
  const slots = await storage.getTimeSlotsByDate(date);
  const slot = slots.find(s => `${s.startTime}-${s.endTime}` === timeSlot);
  
  if (slot && slot._id) {
    await storage.updateTimeSlot(slot._id.toString(), { isAvailable: false });
  }
}

export const timeSlotService = {
  generateDefaultTimeSlots,
  getOrCreateTimeSlots,
  validateTimeSlot,
  getAvailableSlots,
  markSlotAsBooked,
  shouldGenerateSlots
};
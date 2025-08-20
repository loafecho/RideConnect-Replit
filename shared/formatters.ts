/**
 * Shared formatting utilities for consistent display across the application
 */

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * @param time24 - Time in HH:MM format
 * @returns Time in h:mm AM/PM format
 */
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert 12-hour time to 24-hour format
 * @param time12 - Time in h:mm AM/PM format
 * @returns Time in HH:MM format
 */
export function formatTime24Hour(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12;
  
  let [, hoursStr, minutes, period] = match;
  let hours = parseInt(hoursStr, 10);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Format currency amount
 * @param amount - Numeric amount
 * @param currency - Currency code (default USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @param format - Display format (short, long, full)
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  let options: Intl.DateTimeFormatOptions;
  switch (format) {
    case 'short':
      options = { month: '2-digit', day: '2-digit', year: 'numeric' };
      break;
    case 'long':
      options = { month: 'long', day: 'numeric', year: 'numeric' };
      break;
    case 'full':
      options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      break;
    default:
      options = { month: '2-digit', day: '2-digit', year: 'numeric' };
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if format doesn't match
}

/**
 * Format booking ID for display
 * @param id - MongoDB ObjectId or numeric ID
 * @returns Formatted booking reference (e.g., RC0001-2025)
 */
export function formatBookingId(id: string | number): string {
  const year = new Date().getFullYear();
  const numericId = typeof id === 'string' ? 
    parseInt(id.slice(-4), 16) : // Extract last 4 hex chars for MongoDB ID
    id;
  
  return `RC${numericId.toString().padStart(4, '0')}-${year}`;
}

/**
 * Format distance for display
 * @param miles - Distance in miles
 * @returns Formatted distance string
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return '< 0.1 mi';
  }
  
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  
  return `${Math.round(miles)} mi`;
}

/**
 * Format duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (mins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
}

/**
 * Format time slot for display
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Formatted time slot string
 */
export function formatTimeSlot(startTime: string, endTime: string): string {
  return `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
}

/**
 * Format address for display (truncate if too long)
 * @param address - Full address string
 * @param maxLength - Maximum length before truncation
 * @returns Formatted address string
 */
export function formatAddress(address: string, maxLength = 50): string {
  if (address.length <= maxLength) {
    return address;
  }
  
  // Try to truncate at a comma or space
  const truncated = address.substring(0, maxLength);
  const lastComma = truncated.lastIndexOf(',');
  const lastSpace = truncated.lastIndexOf(' ');
  
  const cutPoint = Math.max(lastComma, lastSpace);
  
  if (cutPoint > maxLength * 0.6) { // Only use if it's not too short
    return address.substring(0, cutPoint) + '...';
  }
  
  return truncated + '...';
}

/**
 * Format percentage for display
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default {
  formatTime12Hour,
  formatTime24Hour,
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatBookingId,
  formatDistance,
  formatDuration,
  formatTimeSlot,
  formatAddress,
  formatPercentage,
  formatFileSize
};
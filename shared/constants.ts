/**
 * Business Configuration Constants
 */

// Pricing Configuration
export const PRICING = {
  STANDARD_HOURLY_RATE: 60,
  AIRPORT_HOURLY_RATE: 80,
  BASE_FARE: 10,
  MINIMUM_FARE: 35,
  AVERAGE_SPEED_MPH: 30,
  PRICE_PER_PASSENGER: 5,
  MAX_PASSENGERS: 6,
  DEFAULT_PASSENGERS: 1
} as const;

// Business Hours Configuration
export const BUSINESS_HOURS = {
  START_HOUR: 15, // 3 PM
  END_HOUR: 23,    // 11 PM  
  INTERVAL_MINUTES: 15,
  TIMEZONE: 'America/Los_Angeles'
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

// Airport Keywords for Detection
export const AIRPORT_KEYWORDS = [
  'airport',
  'terminal',
  'airfield',
  'aerodrome',
  'LAS', // Las Vegas Airport Code
  'LAX', // Los Angeles Airport Code
  'SFO', // San Francisco Airport Code
  'JFK', // New York JFK
  'ORD', // Chicago O'Hare
  'ATL', // Atlanta
  'DFW', // Dallas Fort Worth
  'SEA', // Seattle-Tacoma
  'PHX', // Phoenix Sky Harbor
  'MCO', // Orlando
  'EWR', // Newark
  'BOS', // Boston Logan
  'IAH', // Houston
  'MSP', // Minneapolis
  'DTW', // Detroit
  'PHL', // Philadelphia
  'LGA', // LaGuardia
  'FLL', // Fort Lauderdale
  'BWI', // Baltimore
  'DCA', // Reagan National
  'SLC', // Salt Lake City
  'MDW', // Chicago Midway
  'SAN', // San Diego
  'HNL', // Honolulu
  'TPA', // Tampa
  'PDX'  // Portland
];

// Validation Rules
export const VALIDATION = {
  PHONE_REGEX: /^[\d\s\-\(\)\+]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME_FORMAT_REGEX: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_NOTES_LENGTH: 500,
  MIN_PICKUP_LOCATION_LENGTH: 5,
  MIN_DROPOFF_LOCATION_LENGTH: 5
} as const;

// API Configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  ADMIN_KEY: 'admin123' // TODO: Move to environment variable
} as const;

// Date/Time Configuration
export const DATE_CONFIG = {
  MIN_BOOKING_HOURS_AHEAD: 1, // Minimum hours ahead for booking
  MAX_BOOKING_DAYS_AHEAD: 30, // Maximum days ahead for booking
  DEFAULT_DURATION_MINUTES: 60 // Default ride duration
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 36.1699, // Las Vegas
    lng: -115.1398
  },
  DEFAULT_ZOOM: 11
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  BOOKING_NOT_FOUND: 'Booking not found',
  TIMESLOT_NOT_AVAILABLE: 'This time slot is no longer available',
  INVALID_DATE: 'Please select a valid date',
  INVALID_TIME: 'Please select a valid time',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  STRIPE_NOT_CONFIGURED: 'Payment processing is currently disabled',
  GOOGLE_CALENDAR_ERROR: 'Failed to sync with calendar',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Your booking has been created successfully!',
  BOOKING_CONFIRMED: 'Your booking has been confirmed!',
  PAYMENT_SUCCESSFUL: 'Payment processed successfully!',
  TIMESLOT_CREATED: 'Time slot created successfully',
  TIMESLOT_UPDATED: 'Time slot updated successfully',
  TIMESLOT_DELETED: 'Time slot deleted successfully'
} as const;

// UI Configuration
export const UI_CONFIG = {
  STEPS_TOTAL: 4,
  DEBOUNCE_DELAY: 500, // milliseconds
  TOAST_DURATION: 5000, // milliseconds
  ANIMATION_DURATION: 300 // milliseconds
} as const;

export default {
  PRICING,
  BUSINESS_HOURS,
  BOOKING_STATUS,
  AIRPORT_KEYWORDS,
  VALIDATION,
  API_CONFIG,
  DATE_CONFIG,
  MAP_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONFIG
};
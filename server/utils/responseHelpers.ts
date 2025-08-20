import { Response, Request, NextFunction } from "express";

/**
 * Transform MongoDB document with _id to have id field for frontend compatibility
 */
export function transformMongoId<T extends Record<string, any>>(doc: T): T & { id: string } {
  if (!doc || typeof doc !== 'object') return doc as T & { id: string };
  
  const transformed = { ...doc } as any;
  if ('_id' in doc) {
    transformed.id = (doc as any)._id.toString();
  }
  return transformed as T & { id: string };
}

/**
 * Transform array of MongoDB documents
 */
export function transformMongoIds<T extends Record<string, any>>(docs: T[]): (T & { id: string })[] {
  return docs.map(doc => transformMongoId(doc));
}

/**
 * Send successful JSON response
 */
export function sendSuccess(res: Response, data: any, statusCode = 200) {
  res.status(statusCode).json(data);
}

/**
 * Send error JSON response
 */
export function sendError(res: Response, message: string, statusCode = 500) {
  res.status(statusCode).json({ message });
}

/**
 * Async route handler wrapper to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Format MongoDB document for API response
 */
export function formatBookingResponse(booking: any) {
  if (!booking) return null;
  
  // If it's a Mongoose document, convert to JSON first
  const bookingData = booking.toJSON ? booking.toJSON() : booking;
  
  return transformMongoId(bookingData);
}

/**
 * Format array of MongoDB documents for API response
 */
export function formatBookingsResponse(bookings: any[]) {
  return bookings.map(booking => formatBookingResponse(booking));
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(body: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

/**
 * Parse and validate date string
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

/**
 * Check if date is today or in the future
 */
export function isFutureOrToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}
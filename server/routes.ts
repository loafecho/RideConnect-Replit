import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertBookingSchema, insertTimeSlotSchema } from "@shared/schema";
import { calcomService } from "./calcomService";

// Optional Stripe setup - allows app to run without Stripe for development
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
  });
  console.log("✅ Stripe initialized successfully");
} else {
  console.log("⚠️ Stripe not configured - payment features will be disabled");
}

// Simple admin middleware for demo
const isAdmin = (req: any, res: any, next: any) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  if (adminKey === 'admin123') {
    next();
  } else {
    res.status(401).json({ message: "Admin access required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple auth status endpoint
  app.get('/api/auth/user', (req, res) => {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    if (adminKey === 'admin123') {
      res.json({ isAdmin: true, id: 'admin', email: 'admin@demo.com' });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
  
  // Get time slots for a specific date
  app.get("/api/timeslots/:date", async (req, res) => {
    try {
      const { date } = req.params;
      let slots = await storage.getTimeSlotsByDate(date);
      
      // If no time slots exist, create default ones for today and future dates
      if (slots.length === 0) {
        const requestedDate = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to beginning of day
        
        // Only create slots for today or future dates
        if (requestedDate >= today) {
          const defaultSlots = [];
          
          // Create slots from 3 PM to 11 PM PT in 15-minute increments
          for (let hour = 15; hour < 23; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
              const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              const endHour = minute === 45 ? hour + 1 : hour;
              const endMinute = minute === 45 ? 0 : minute + 15;
              const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
              
              defaultSlots.push({
                date,
                startTime: timeString,
                endTime: endTimeString,
                isAvailable: true
              });
            }
          }
          
          // Create all default slots in the database
          for (const slot of defaultSlots) {
            await storage.createTimeSlot(slot);
          }
          
          // Fetch the newly created slots
          slots = await storage.getTimeSlotsByDate(date);
        }
      }
      
      res.json(slots);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching time slots: " + error.message });
    }
  });

  // Create new time slot (admin only)
  app.post("/api/timeslots", isAdmin, async (req, res) => {
    try {
      const validatedData = insertTimeSlotSchema.parse(req.body);
      const slot = await storage.createTimeSlot(validatedData);
      res.json(slot);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating time slot: " + error.message });
    }
  });

  // Update time slot availability (admin only)
  app.patch("/api/timeslots/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const slot = await storage.updateTimeSlot(id, req.body);
      if (!slot) {
        return res.status(404).json({ message: "Time slot not found" });
      }
      res.json(slot);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating time slot: " + error.message });
    }
  });

  // Delete time slot (admin only)
  app.delete("/api/timeslots/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTimeSlot(id);
      if (!deleted) {
        return res.status(404).json({ message: "Time slot not found" });
      }
      res.json({ message: "Time slot deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Error deleting time slot: " + error.message });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Create booking in local database first
      const booking = await storage.createBooking(validatedData);
      
      // Attempt to create booking in Cal.com (non-blocking)
      if (calcomService.isCalComEnabled()) {
        try {
          const calBooking = await calcomService.createBooking(booking);
          
          if (calBooking) {
            // Update local booking with Cal.com reference
            await storage.updateBookingCalInfo(booking.id, {
              calBookingId: calBooking.id,
              calEventId: calBooking.uid,
              calStatus: 'synced',
            });
            
            console.log(`✅ Booking ${booking.id} synced with Cal.com: ${calBooking.id}`);
          } else {
            // Mark as failed but don't block the booking
            await storage.updateBookingCalInfo(booking.id, {
              calStatus: 'failed',
            });
            
            console.log(`⚠️ Booking ${booking.id} created locally but Cal.com sync failed`);
          }
        } catch (calError) {
          // Log error but don't fail the booking
          console.error(`Cal.com sync error for booking ${booking.id}:`, calError);
          
          await storage.updateBookingCalInfo(booking.id, {
            calStatus: 'failed',
          });
        }
      } else {
        console.log(`📅 Booking ${booking.id} created (Cal.com not configured)`);
      }
      
      // Return the booking (with or without Cal.com sync)
      const finalBooking = await storage.getBooking(booking.id);
      res.json(finalBooking);
      
    } catch (error: any) {
      res.status(400).json({ message: "Error creating booking: " + error.message });
    }
  });

  // Get individual booking by ID (for checkout)
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching booking: " + error.message });
    }
  });

  // Get all bookings (admin only)
  app.get("/api/bookings", isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bookings: " + error.message });
    }
  });

  // Get bookings by date
  app.get("/api/bookings/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const bookings = await storage.getBookingsByDate(date);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bookings: " + error.message });
    }
  });

  // Update booking status (admin only)
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, paymentIntentId } = req.body;
      const booking = await storage.updateBookingStatus(id, status, paymentIntentId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating booking: " + error.message });
    }
  });

  // Stripe payment route for ride payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      // Check if Stripe is configured
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is currently disabled. Stripe is not configured.",
          stripeDisabled: true 
        });
      }
      
      console.log("Creating payment intent with body:", req.body);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId?.toString() || '',
        },
      });
      
      console.log("Payment intent created successfully:", paymentIntent.id);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allBookings = await storage.getBookings();
      const todayBookings = await storage.getBookingsByDate(today);
      
      const stats = {
        todayRides: todayBookings.filter(b => b.status === 'confirmed').length,
        todayRevenue: todayBookings
          .filter(b => b.status === 'confirmed')
          .reduce((sum, b) => sum + parseFloat(b.estimatedPrice || '0'), 0),
        pendingBookings: allBookings.filter(b => b.status === 'pending').length,
        monthlyRides: allBookings.filter(b => {
          const bookingDate = new Date(b.date + 'T00:00:00');
          const now = new Date();
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear() &&
                 b.status === 'confirmed';
        }).length,
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching stats: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertBookingSchema, insertTimeSlotSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get time slots for a specific date
  app.get("/api/timeslots/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const slots = await storage.getTimeSlotsByDate(date);
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
      const booking = await storage.createBooking(validatedData);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating booking: " + error.message });
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
  app.patch("/api/bookings/:id/status", isAdmin, async (req, res) => {
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
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId?.toString() || '',
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
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

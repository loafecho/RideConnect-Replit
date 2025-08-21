// MongoDB initialization script for RideConnect
// This script runs when MongoDB container starts for the first time

db = db.getSiblingDB('rideconnect');

// Create collections with basic indexes
db.createCollection('users');
db.createCollection('timeslots');
db.createCollection('bookings');

// Create indexes for better performance
db.timeslots.createIndex({ "date": 1, "time": 1 }, { unique: true });
db.bookings.createIndex({ "timeSlotId": 1 });
db.bookings.createIndex({ "email": 1 });
db.bookings.createIndex({ "createdAt": -1 });

// Create a test admin user (for demo purposes)
db.users.insertOne({
  _id: ObjectId(),
  email: "admin@rideconnect.com",
  isAdmin: true,
  createdAt: new Date()
});

print("✅ RideConnect database initialized successfully");
print("Collections created: users, timeslots, bookings");
print("Indexes created for optimal performance");
print("Test admin user created: admin@rideconnect.com");
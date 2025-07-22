import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBookingSchema } from "@shared/schema";
import { MapPin, Clock, Users, Plus, Minus, Route, CreditCard, CalendarDays } from "lucide-react";
import { useLocation } from "wouter";

// Helper function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

type BookingFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  timeSlot: string;
  passengerCount: number;
  notes?: string;
  estimatedPrice: string;
};

export default function Booking() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState(25.00);
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      pickupLocation: "",
      dropoffLocation: "",
      date: selectedDate,
      timeSlot: "",
      passengerCount: 1,
      notes: "",
      estimatedPrice: "25.00",
    },
  });

  // Fetch available time slots
  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ["/api/timeslots", selectedDate],
    enabled: !!selectedDate,
  });

  // Remove the bookings query since regular users don't need to see all bookings

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingFormData) => apiRequest("POST", "/api/bookings", data),
    onSuccess: async (res) => {
      const booking = await res.json();
      toast({
        title: "Booking Created!",
        description: "Redirecting to payment...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      // Redirect to checkout with booking ID
      setLocation(`/checkout/${booking.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update estimated price based on inputs
  useEffect(() => {
    const basePrice = 20;
    const distanceMultiplier = Math.random() * 15 + 5; // Mock distance calculation
    const passengerMultiplier = passengerCount > 1 ? 1 + (passengerCount - 1) * 0.2 : 1;
    const newPrice = basePrice * distanceMultiplier * passengerMultiplier;
    setEstimatedPrice(Math.round(newPrice * 100) / 100);
    form.setValue('estimatedPrice', newPrice.toFixed(2));
  }, [passengerCount, form.watch('pickupLocation'), form.watch('dropoffLocation')]);

  useEffect(() => {
    form.setValue('date', selectedDate);
  }, [selectedDate, form]);

  useEffect(() => {
    form.setValue('passengerCount', passengerCount);
  }, [passengerCount, form]);

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Book Your Ride</h1>
          <p className="text-xl text-slate-600">Choose your pickup and destination, select a time, and we'll handle the rest.</p>
        </div>

        <Card className="shadow-xl border border-slate-200 overflow-hidden">
          <CardHeader className="gradient-purple-blue p-6">
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Route className="mr-3" size={24} />
              Trip Details
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="mr-2 text-blue-500" size={16} />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          📧 Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>📱 Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Inputs */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pickupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="mr-2 text-green-500" size={16} />
                          Pickup Location
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pickup address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dropoffLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="mr-2 text-red-500" size={16} />
                          Drop-off Location
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter destination address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date and Time Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center">
                      <CalendarDays className="mr-2 text-blue-500" size={16} />
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-12 text-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-slate-200 focus:border-purple-400 focus:from-purple-50 focus:to-blue-50 transition-all duration-200"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Clock className="mr-2 text-purple-500" size={16} />
                          Preferred Time
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-left">
                              <SelectValue placeholder={slotsLoading ? "⏳ Loading available times..." : "🕐 Choose your preferred time"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {(timeSlots as any[])?.filter((slot: any) => slot.isAvailable).map((slot: any) => (
                              <SelectItem 
                                key={slot.id} 
                                value={`${slot.startTime}-${slot.endTime}`}
                                className="flex items-center justify-between py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="font-medium text-slate-700">
                                    {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                  </span>
                                </div>
                              </SelectItem>
                            )) || []}
                            {!slotsLoading && (!timeSlots || (timeSlots as any[]).length === 0) && (
                              <div className="py-4 text-center text-slate-500">
                                <Clock className="mx-auto mb-2 text-slate-400" size={24} />
                                <p>No time slots available for this date</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Passenger Count */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                    <Users className="mr-2 text-emerald-500" size={16} />
                    Number of Passengers
                  </label>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      disabled={passengerCount <= 1}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="text-xl font-semibold text-slate-900 w-8 text-center">
                      {passengerCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                      disabled={passengerCount >= 6}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {/* Special Requirements */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        💬 Special Requirements (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requirements or notes for your driver..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Estimate */}
                <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-700">Estimated Price:</span>
                    <span className="text-2xl font-bold text-green-600">${estimatedPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Final price may vary based on actual distance and traffic conditions.</p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full gradient-purple-blue text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg h-auto"
                >
                  <CreditCard className="mr-2" size={20} />
                  {createBookingMutation.isPending ? "Processing..." : "Book & Pay with Stripe"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}

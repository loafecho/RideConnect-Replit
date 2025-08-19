import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTimeSlotSchema } from "@shared/mongoSchema";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Gauge, CalendarX2, List, TrendingUp, Car, DollarSign, Clock, BarChart3, Plus, Trash2 } from "lucide-react";

// Helper function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')}${period}`;
};

type TimeSlotFormData = {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export default function Admin() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(insertTimeSlotSchema),
    defaultValues: {
      date: selectedDate,
      startTime: "",
      endTime: "",
      isAvailable: true,
    },
  });

  // Fetch dashboard stats
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch time slots for selected date
  const { data: timeSlots = [] } = useQuery({
    queryKey: ["/api/timeslots", selectedDate],
  });

  // Fetch all bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Create time slot mutation
  const createSlotMutation = useMutation({
    mutationFn: (data: TimeSlotFormData) => apiRequest("POST", "/api/timeslots", data),
    onSuccess: () => {
      toast({ title: "Time slot created successfully!" });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/timeslots"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create time slot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete time slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/timeslots/${id}`),
    onSuccess: () => {
      toast({ title: "Time slot deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/timeslots"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete time slot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/bookings/${id}/status`, { status }),
    onSuccess: () => {
      toast({ title: "Booking updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitSlot = (data: TimeSlotFormData) => {
    createSlotMutation.mutate(data);
  };

  const pendingBookings = (bookings as any[]).filter((booking: any) => booking.status === 'pending');

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <Card className="shadow-lg border border-slate-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-2xl p-6">
            <CardTitle className="text-3xl font-bold text-white flex items-center">
              <Gauge className="mr-3" size={32} />
              Admin Dashboard
            </CardTitle>
            <p className="text-slate-300 mt-2">Manage your schedule, bookings, and availability</p>
          </CardHeader>

          {/* Dashboard Stats */}
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Today's Rides</p>
                    <p className="text-3xl font-bold">{(stats as any).todayRides || 0}</p>
                  </div>
                  <Car className="text-2xl text-blue-200" size={32} />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Revenue Today</p>
                    <p className="text-3xl font-bold">${(stats as any).todayRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <DollarSign className="text-2xl text-emerald-200" size={32} />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Pending Bookings</p>
                    <p className="text-3xl font-bold">{(stats as any).pendingBookings || 0}</p>
                  </div>
                  <Clock className="text-2xl text-purple-200" size={32} />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">This Month</p>
                    <p className="text-3xl font-bold">{(stats as any).monthlyRides || 0}</p>
                  </div>
                  <TrendingUp className="text-2xl text-orange-200" size={32} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Schedule Management */}
          <Card className="shadow-lg border border-slate-200">
            <CardHeader className="border-b border-slate-200 p-6">
              <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
                <CalendarX2 className="text-blue-500 mr-3" size={24} />
                Manage Time Slots
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Date Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Available Time Slots</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {(timeSlots as any[]).map((slot: any) => (
                    <div key={slot.id} className="relative group">
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm font-medium text-slate-700">
                            {formatTime12Hour(slot.startTime)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Slot */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitSlot)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={createSlotMutation.isPending}
                    >
                      <Plus className="mr-2" size={16} />
                      Add Time Slot
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>

          {/* Booking Requests */}
          <Card className="shadow-lg border border-slate-200">
            <CardHeader className="border-b border-slate-200 p-6">
              <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
                <List className="text-purple-500 mr-3" size={24} />
                Recent Booking Requests
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {pendingBookings.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No pending booking requests</p>
                ) : (
                  pendingBookings.map((booking: any) => (
                    <div key={booking.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{booking.customerName}</h4>
                          <p className="text-sm text-slate-500">{booking.customerEmail}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="text-green-500 mr-2">📍</span>
                          <span>{booking.pickupLocation}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <span className="text-red-500 mr-2">📍</span>
                          <span>{booking.dropoffLocation}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="text-blue-500 mr-2" size={16} />
                          <span>{booking.date} at {booking.timeSlot}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <DollarSign className="text-green-500 mr-2" size={16} />
                          <span>${booking.estimatedPrice}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'confirmed' })}
                          disabled={updateBookingMutation.isPending}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-sm"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'cancelled' })}
                          disabled={updateBookingMutation.isPending}
                          variant="destructive"
                          className="flex-1 text-sm"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="mt-8 shadow-lg border border-slate-200">
          <CardHeader className="border-b border-slate-200 p-6">
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
              <BarChart3 className="text-emerald-500 mr-3" size={24} />
              Earnings Overview
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-8 text-center">
              <div className="mb-4">
                <TrendingUp className="text-4xl text-emerald-500 mb-4 mx-auto" size={48} />
                <h4 className="text-lg font-semibold text-slate-900">Chart Visualization</h4>
                <p className="text-slate-600">Earnings data visualization will be implemented here</p>
              </div>
              
              {/* Mock chart data */}
              <div className="grid grid-cols-7 gap-2 mt-6">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div 
                      className="bg-emerald-500 w-full rounded mb-2" 
                      style={{ height: `${Math.random() * 60 + 20}px` }}
                    ></div>
                    <span className="text-xs text-slate-600">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

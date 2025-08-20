import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { formatTime12Hour, formatTimeSlot } from "@shared/formatters";

interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  timeSlot: string;
  passengerCount: number;
  isAirportRoute: boolean;
  notes?: string;
  estimatedPrice: string;
}

interface TimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BookingStepThreeProps {
  form: UseFormReturn<BookingFormData>;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

export function BookingStepThree({ form, selectedDate, setSelectedDate }: BookingStepThreeProps) {
  
  // Fetch available time slots for selected date
  const { data: timeSlots, isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots", selectedDate?.toISOString().split('T')[0]],
    enabled: !!selectedDate,
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue("date", date.toISOString().split('T')[0]);
      // Clear time slot when date changes
      form.setValue("timeSlot", "");
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const availableSlots = timeSlots?.filter(slot => slot.isAvailable) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Date & Time Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <FormLabel className="text-base mb-3 block">Select Date</FormLabel>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="timeSlot"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Time Slots
              </FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!selectedDate || slotsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedDate 
                        ? "Please select a date first"
                        : slotsLoading 
                        ? "Loading time slots..."
                        : availableSlots.length === 0
                        ? "No available slots for this date"
                        : "Choose a time slot"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem 
                        key={slot._id} 
                        value={`${slot.startTime}-${slot.endTime}`}
                      >
                        {formatTimeSlot(slot.startTime, slot.endTime)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
              
              {slotsLoading && selectedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading available time slots...
                </div>
              )}

              {selectedDate && !slotsLoading && availableSlots.length === 0 && (
                <div className="text-sm text-amber-600 mt-2 p-3 bg-amber-50 rounded-md">
                  No time slots are available for this date. Please select a different date.
                </div>
              )}
            </FormItem>
          )}
        />

        {selectedDate && availableSlots.length > 0 && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <div className="font-medium mb-1">Booking Information:</div>
            <ul className="space-y-1 text-xs">
              <li>• All times are in Pacific Time (PT)</li>
              <li>• Rides typically last 1 hour but duration varies by distance</li>
              <li>• Please arrive 5 minutes before your scheduled time</li>
              <li>• Free cancellation up to 2 hours before pickup</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
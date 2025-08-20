import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

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

interface BookingStepOneProps {
  form: UseFormReturn<BookingFormData>;
  passengerCount: number;
  setPassengerCount: (count: number) => void;
}

export function BookingStepOne({ form, passengerCount, setPassengerCount }: BookingStepOneProps) {
  const incrementPassengers = () => {
    if (passengerCount < 6) {
      const newCount = passengerCount + 1;
      setPassengerCount(newCount);
      form.setValue("passengerCount", newCount);
    }
  };

  const decrementPassengers = () => {
    if (passengerCount > 1) {
      const newCount = passengerCount - 1;
      setPassengerCount(newCount);
      form.setValue("passengerCount", newCount);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                  />
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
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="(555) 123-4567" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Number of Passengers</FormLabel>
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={decrementPassengers}
              disabled={passengerCount <= 1}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-semibold w-8 text-center">
              {passengerCount}
            </span>
            <button
              type="button"
              onClick={incrementPassengers}
              disabled={passengerCount >= 6}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-gray-600 ml-2">
              (Maximum 6 passengers)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
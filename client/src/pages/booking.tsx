import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getRouteInfo, formatPricingInfo, type RouteResult, type PricingError } from "@/lib/pricingService";
import { insertBookingSchema } from "@shared/mongoSchema";
import { MapPin, Clock, Users, Plus, Minus, Route, CreditCard, CalendarDays, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
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
  isAirportRoute: boolean;
  notes?: string;
  estimatedPrice: string;
};

export default function Booking() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [passengerCount, setPassengerCount] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      pickupLocation: "",
      dropoffLocation: "",
      date: selectedDate?.toISOString().split('T')[0] || "",
      timeSlot: "",
      passengerCount: 1,
      isAirportRoute: false,
      notes: "",
      estimatedPrice: "",
    },
  });

  // Fetch available time slots
  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ["/api/timeslots", selectedDate?.toISOString().split('T')[0]],
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

  // Update estimated price based on real route calculation
  useEffect(() => {
    const pickupLocation = form.watch('pickupLocation');
    const dropoffLocation = form.watch('dropoffLocation');
    const isAirportRoute = form.watch('isAirportRoute');
    
    // Only calculate price if both locations are provided
    if (pickupLocation && dropoffLocation && pickupLocation.trim() && dropoffLocation.trim()) {
      calculateRealTimePrice(pickupLocation.trim(), dropoffLocation.trim(), isAirportRoute);
    } else {
      // Reset price when locations are empty
      setEstimatedPrice(null);
      setRouteInfo(null);
      setPricingError(null);
      form.setValue('estimatedPrice', '');
    }
  }, [form.watch('pickupLocation'), form.watch('dropoffLocation'), form.watch('isAirportRoute')]);

  // Real-time price calculation function
  const calculateRealTimePrice = async (pickup: string, dropoff: string, isAirportRoute: boolean) => {
    setPriceLoading(true);
    setPricingError(null);
    
    try {
      const result = await getRouteInfo(pickup, dropoff, isAirportRoute);
      
      if ('message' in result) {
        // Handle pricing error
        setPricingError(result.message);
        if (result.fallbackPrice) {
          setEstimatedPrice(result.fallbackPrice);
          form.setValue('estimatedPrice', result.fallbackPrice.toFixed(2));
        }
        setRouteInfo(null);
      } else {
        // Handle successful route calculation
        setEstimatedPrice(result.estimatedPrice);
        setRouteInfo(result);
        setPricingError(null);
        form.setValue('estimatedPrice', result.estimatedPrice.toFixed(2));
      }
    } catch (error) {
      console.error('Price calculation error:', error);
      setPricingError('Unable to calculate price at this time');
      setEstimatedPrice(null);
      setRouteInfo(null);
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      form.setValue('date', selectedDate.toISOString().split('T')[0]);
    }
  }, [selectedDate, form]);

  useEffect(() => {
    form.setValue('passengerCount', passengerCount);
  }, [passengerCount, form]);

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.watch('customerName') && form.watch('customerEmail');
      case 2:
        return form.watch('pickupLocation') && form.watch('dropoffLocation');
      case 3:
        return selectedDate && form.watch('timeSlot');
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepTitles = [
    "Personal Information",
    "Trip Locations", 
    "Date & Time",
    "Review & Book"
  ];

  return (
    <div className="section-padding bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
      <div className="container-responsive">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Book Your
            <span className="text-gradient-purple-blue font-bold"> Perfect Ride</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Simple, step-by-step booking for your personal transportation needs.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up animate-delay-200">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep > index + 1 
                    ? 'bg-emerald-500 text-white' 
                    : currentStep === index + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > index + 1 ? (
                    <CheckCircle size={20} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium text-center ${
                  currentStep === index + 1 ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
        </div>

        <Card className="card-elevated max-w-4xl mx-auto animate-fade-in-up animate-delay-300 border-0 bg-card">
          <CardHeader className="gradient-purple-blue p-6">
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Route className="mr-3" size={24} />
              Step {currentStep}: {stepTitles[currentStep - 1]}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Customer Information */}
                {currentStep === 1 && (
                  <div className="animate-fade-in-up space-y-6">
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
                              <Input placeholder="Enter your full name" {...field} className="h-12" />
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
                              <Input type="email" placeholder="Enter your email" {...field} className="h-12" />
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
                            <Input placeholder="Enter your phone number" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Location Inputs */}
                {currentStep === 2 && (
                  <div className="animate-fade-in-up space-y-6">
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
                              <AddressAutocomplete
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter pickup address"
                                className="h-12"
                              />
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
                              <AddressAutocomplete
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter destination address"
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Airport Route Checkbox */}
                    <FormField
                      control={form.control}
                      name="isAirportRoute"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center cursor-pointer">
                              ✈️ Airport pickup or drop-off
                            </FormLabel>
                            <FormDescription>
                              Check this if your trip involves an airport (premium rate: $80/hour vs $60/hour standard)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Passenger Count */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
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
                          className="h-12 w-12"
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="text-xl font-semibold text-foreground w-8 text-center">
                          {passengerCount}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                          disabled={passengerCount >= 6}
                          className="h-12 w-12"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Price Estimate */}
                    {priceLoading ? (
                      <div className="bg-muted/50 rounded-xl p-6 border border-border">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Loader2 className="text-white animate-spin" size={20} />
                          </div>
                          <span className="text-lg font-medium text-foreground">Calculating Price...</span>
                          <p className="text-sm text-muted-foreground mt-2">Getting real-time route information</p>
                        </div>
                      </div>
                    ) : estimatedPrice !== null ? (
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl p-6 border border-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-medium text-foreground">Estimated Price:</span>
                          <span className="text-2xl font-bold text-emerald-600">${estimatedPrice.toFixed(2)}</span>
                        </div>
                        
                        {routeInfo && (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              {formatPricingInfo(routeInfo).rateInfo}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatPricingInfo(routeInfo).routeInfo}
                            </div>
                            {routeInfo.isAirportRoute && (
                              <div className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded">
                                ✈️ Airport Route - Premium Rate Applied
                              </div>
                            )}
                          </div>
                        )}
                        
                        {pricingError && (
                          <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded mt-2">
                            ⚠️ {pricingError} (showing estimated price)
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground mt-3">
                          Time-based pricing. Final price may vary based on actual traffic conditions.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-xl p-6 border border-dashed border-border">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <span className="text-white font-bold text-lg">$</span>
                          </div>
                          <span className="text-lg font-medium text-muted-foreground">Real-Time Pricing</span>
                          <p className="text-sm text-muted-foreground mt-2">Enter pickup and drop-off locations to see your fare based on actual driving time.</p>
                          <div className="text-xs text-muted-foreground mt-3 space-y-1">
                            <div>• Standard: $60/hour (min $16)</div>
                            <div>• Airport: $80/hour (min $30)</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Date and Time Selection */}
                {currentStep === 3 && (
                  <div className="animate-fade-in-up space-y-6">
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3 flex items-center">
                          <CalendarDays className="mr-2 text-blue-500" size={16} />
                          Select Date
                        </label>
                        <div className="bg-card border border-border rounded-lg p-4">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            className="bg-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <FormField
                          control={form.control}
                          name="timeSlot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Clock className="mr-2 text-purple-500" size={16} />
                                Available Times
                              </FormLabel>
                              <div className="space-y-3">
                                {(timeSlots as any[])?.filter((slot: any) => slot.isAvailable).map((slot: any) => (
                                  <div
                                    key={slot.id}
                                    className={`p-4 border border-border rounded-lg cursor-pointer transition-all duration-200 hover:border-primary hover:bg-accent ${
                                      field.value === `${slot.startTime}-${slot.endTime}` ? 'border-primary bg-accent' : ''
                                    }`}
                                    onClick={() => field.onChange(`${slot.startTime}-${slot.endTime}`)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                        <span className="font-medium text-foreground">
                                          {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                        </span>
                                      </div>
                                      {field.value === `${slot.startTime}-${slot.endTime}` && (
                                        <CheckCircle className="text-primary" size={20} />
                                      )}
                                    </div>
                                  </div>
                                )) || []}
                                {!slotsLoading && (!timeSlots || (timeSlots as any[]).length === 0) && (
                                  <div className="py-8 text-center text-muted-foreground">
                                    <Clock className="mx-auto mb-2" size={32} />
                                    <p>No time slots available for this date</p>
                                  </div>
                                )}
                                {slotsLoading && (
                                  <div className="py-8 text-center text-muted-foreground">
                                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p>Loading available times...</p>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Special Requirements */}
                {currentStep === 4 && (
                  <div className="animate-fade-in-up space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-muted rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p className="font-medium text-foreground">{form.watch('customerName')}</p>
                          <p className="text-sm text-muted-foreground">{form.watch('customerEmail')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Journey</p>
                          <p className="font-medium text-foreground">{form.watch('pickupLocation')}</p>
                          <p className="text-sm text-muted-foreground">to {form.watch('dropoffLocation')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium text-foreground">{selectedDate?.toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{form.watch('timeSlot')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Passengers</p>
                          <p className="font-medium text-foreground">{passengerCount} passenger{passengerCount > 1 ? 's' : ''}</p>
                        </div>
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
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Final Price */}
                    {estimatedPrice !== null ? (
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl p-6 border border-border">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-medium text-foreground">Total Price:</span>
                          <span className="text-3xl font-bold text-emerald-600">${estimatedPrice.toFixed(2)}</span>
                        </div>
                        
                        {routeInfo && (
                          <div className="space-y-2 mb-3">
                            <div className="text-sm text-muted-foreground">
                              {formatPricingInfo(routeInfo).rateInfo}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Route: {formatPricingInfo(routeInfo).routeInfo}
                            </div>
                            {routeInfo.isAirportRoute && (
                              <div className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded">
                                ✈️ Airport Route - Premium Rate Applied
                              </div>
                            )}
                          </div>
                        )}
                        
                        {pricingError && (
                          <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded mb-3">
                            ⚠️ {pricingError} (showing estimated price)
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground">Time-based pricing. Includes all fees. Final price may vary based on actual traffic conditions.</p>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-xl p-6 border border-dashed border-border">
                        <div className="text-center">
                          <div className="text-lg font-medium text-muted-foreground mb-2">Price will be calculated</div>
                          <p className="text-sm text-muted-foreground">Complete the location fields to see your final price</p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={createBookingMutation.isPending}
                      className="w-full btn-primary text-white py-4 rounded-xl font-semibold transform hover:scale-105 transition-all shadow-lg h-auto text-lg"
                    >
                      <CreditCard className="mr-2" size={20} />
                      {createBookingMutation.isPending ? "Processing..." : "Confirm & Pay with Stripe"}
                    </Button>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < totalSteps && (
                  <div className="flex justify-between pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      Previous
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="flex items-center btn-primary"
                    >
                      Next
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                )}

                {currentStep === totalSteps && (
                  <div className="flex justify-start pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2" size={16} />
                      Previous
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}

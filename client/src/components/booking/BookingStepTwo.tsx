import { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { MapPin, Route, Loader2, CreditCard } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { getRouteInfo, formatPricingInfo, type RouteResult, type PricingError } from "@/lib/pricingService";
import { formatCurrency, formatDistance, formatDuration } from "@shared/formatters";

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

interface BookingStepTwoProps {
  form: UseFormReturn<BookingFormData>;
  passengerCount: number;
  estimatedPrice: number | null;
  setEstimatedPrice: (price: number | null) => void;
  priceLoading: boolean;
  setPriceLoading: (loading: boolean) => void;
  routeInfo: RouteResult | null;
  setRouteInfo: (info: RouteResult | null) => void;
  pricingError: string | null;
  setPricingError: (error: string | null) => void;
}

export function BookingStepTwo({
  form,
  passengerCount,
  estimatedPrice,
  setEstimatedPrice,
  priceLoading,
  setPriceLoading,
  routeInfo,
  setRouteInfo,
  pricingError,
  setPricingError
}: BookingStepTwoProps) {

  const calculatePrice = async (pickup: string, dropoff: string) => {
    if (!pickup || !dropoff) {
      setEstimatedPrice(null);
      setRouteInfo(null);
      setPricingError(null);
      return;
    }

    setPriceLoading(true);
    setPricingError(null);

    try {
      const result = await getRouteInfo(pickup, dropoff, passengerCount);
      
      if ('error' in result) {
        setPricingError(result.error);
        setEstimatedPrice(null);
        setRouteInfo(null);
        return;
      }

      setRouteInfo(result);
      setEstimatedPrice(result.totalPrice);
      form.setValue("estimatedPrice", result.totalPrice.toFixed(2));
      form.setValue("isAirportRoute", result.isAirportRoute);
      
    } catch (error) {
      console.error('Price calculation error:', error);
      setPricingError("Unable to calculate price. Please try again.");
      setEstimatedPrice(null);
      setRouteInfo(null);
    } finally {
      setPriceLoading(false);
    }
  };

  // Debounced price calculation
  useEffect(() => {
    const pickup = form.watch("pickupLocation");
    const dropoff = form.watch("dropoffLocation");
    
    const timer = setTimeout(() => {
      calculatePrice(pickup, dropoff);
    }, 500);

    return () => clearTimeout(timer);
  }, [form.watch("pickupLocation"), form.watch("dropoffLocation"), passengerCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="pickupLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pickup Location</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter pickup address"
                  icon={<MapPin className="h-4 w-4" />}
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
              <FormLabel>Drop-off Location</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter destination address"
                  icon={<MapPin className="h-4 w-4" />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Estimation Display */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4" />
            <h3 className="font-medium">Price Estimation</h3>
          </div>

          {priceLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating route and price...
            </div>
          )}

          {pricingError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {pricingError}
            </div>
          )}

          {routeInfo && estimatedPrice && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-green-600">
                  Estimated Total: {formatCurrency(estimatedPrice)}
                </span>
                {routeInfo.isAirportRoute && (
                  <Badge variant="secondary">Airport Route</Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>Distance: {formatDistance(routeInfo.distance)}</div>
                <div>Estimated Duration: {formatDuration(routeInfo.duration)}</div>
                <div>Rate: {formatCurrency(routeInfo.hourlyRate)}/hour</div>
                {passengerCount > 1 && (
                  <div>Additional Passengers: {passengerCount - 1} × {formatCurrency(5)} = {formatCurrency((passengerCount - 1) * 5)}</div>
                )}
              </div>

              {routeInfo.breakdown && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <div>Base Fare: {formatCurrency(routeInfo.breakdown.baseFare)}</div>
                  <div>Time Charge: {formatCurrency(routeInfo.breakdown.timeCharge)}</div>
                  {routeInfo.breakdown.passengerFee > 0 && (
                    <div>Passenger Fee: {formatCurrency(routeInfo.breakdown.passengerFee)}</div>
                  )}
                  {routeInfo.breakdown.airportSurcharge > 0 && (
                    <div>Airport Surcharge: {formatCurrency(routeInfo.breakdown.airportSurcharge)}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {!priceLoading && !pricingError && !routeInfo && (
            <div className="text-sm text-gray-500">
              Enter pickup and drop-off locations to see price estimate
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
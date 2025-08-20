import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Users, Clock, CreditCard, FileText } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { formatCurrency, formatTimeSlot, formatDate } from "@shared/formatters";
import type { RouteResult } from "@/lib/pricingService";

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

interface BookingStepFourProps {
  form: UseFormReturn<BookingFormData>;
  routeInfo: RouteResult | null;
  passengerCount: number;
  estimatedPrice: number | null;
}

export function BookingStepFour({ form, routeInfo, passengerCount, estimatedPrice }: BookingStepFourProps) {
  
  const formValues = form.getValues();
  
  const formatTimeSlotDisplay = (timeSlot: string) => {
    if (!timeSlot) return "Not selected";
    const [startTime, endTime] = timeSlot.split('-');
    return formatTimeSlot(startTime, endTime);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review Your Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Passenger Details
              </h4>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {formValues.customerName || "Not provided"}</div>
                <div><strong>Email:</strong> {formValues.customerEmail || "Not provided"}</div>
                <div><strong>Phone:</strong> {formValues.customerPhone || "Not provided"}</div>
                <div><strong>Passengers:</strong> {passengerCount} {passengerCount === 1 ? 'person' : 'people'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </h4>
              <div className="space-y-1 text-sm">
                <div><strong>Date:</strong> {formValues.date ? formatDate(formValues.date, 'full') : "Not selected"}</div>
                <div><strong>Time:</strong> {formatTimeSlotDisplay(formValues.timeSlot)}</div>
                <div><strong>Duration:</strong> Approximately 1 hour</div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Route Details
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>Pickup:</strong> {formValues.pickupLocation || "Not specified"}</div>
              <div><strong>Drop-off:</strong> {formValues.dropoffLocation || "Not specified"}</div>
              {routeInfo && (
                <>
                  <div><strong>Distance:</strong> {routeInfo.distance.toFixed(1)} miles</div>
                  <div><strong>Estimated Duration:</strong> {Math.round(routeInfo.duration)} minutes</div>
                  <div className="flex items-center gap-2 mt-2">
                    <strong>Route Type:</strong>
                    {routeInfo.isAirportRoute ? (
                      <Badge variant="secondary">Airport Route</Badge>
                    ) : (
                      <Badge variant="outline">Standard Route</Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          {estimatedPrice && routeInfo && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Price Breakdown
              </h4>
              <div className="space-y-1 text-sm">
                {routeInfo.breakdown && (
                  <>
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span>{formatCurrency(routeInfo.breakdown.baseFare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Charge ({Math.round(routeInfo.duration)} min @ {formatCurrency(routeInfo.hourlyRate)}/hr):</span>
                      <span>{formatCurrency(routeInfo.breakdown.timeCharge)}</span>
                    </div>
                    {routeInfo.breakdown.passengerFee > 0 && (
                      <div className="flex justify-between">
                        <span>Additional Passengers ({passengerCount - 1}):</span>
                        <span>{formatCurrency(routeInfo.breakdown.passengerFee)}</span>
                      </div>
                    )}
                    {routeInfo.breakdown.airportSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span>Airport Surcharge:</span>
                        <span>{formatCurrency(routeInfo.breakdown.airportSurcharge)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Estimated Fare:</span>
                  <span className="text-green-600">{formatCurrency(estimatedPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special instructions, accessibility needs, or other requests..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Important Information */}
          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
            <h4 className="font-medium text-amber-800 mb-2">Important Information</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Final price may vary based on actual route and traffic conditions</li>
              <li>• Payment will be processed after confirming this booking</li>
              <li>• You will receive a confirmation email with booking details</li>
              <li>• Free cancellation up to 2 hours before pickup time</li>
              <li>• Driver contact information will be provided 30 minutes before pickup</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Users, 
  CreditCard, 
  Phone, 
  Mail, 
  Calendar,
  ChevronRight,
  Star,
  RefreshCw,
  CalendarCheck,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

export default function Confirmation() {
  const params = useParams();
  const bookingId = params.bookingId;
  const [, setLocation] = useLocation();
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading, error } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: () => apiRequest("GET", `/api/bookings/${bookingId}`).then(res => res.json()),
    enabled: !!bookingId,
  });

  // Generate reference number based on booking ID and date
  useEffect(() => {
    if (booking) {
      const ref = `RC${booking.id.toString().padStart(4, '0')}-${new Date().getFullYear()}`;
      setReferenceNumber(ref);
    }
  }, [booking]);

  const handleBookAnother = () => {
    setLocation('/booking');
  };

  const handleViewBookings = () => {
    setLocation('/');
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-md mx-4 card-elevated bg-card border-0">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find the booking confirmation you're looking for.
            </p>
            <Button onClick={() => setLocation('/booking')} className="w-full">
              Back to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/10 dark:via-slate-900 dark:to-emerald-950/10 py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your ride has been successfully booked and confirmed. You'll receive a confirmation email shortly with all the details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Main Confirmation Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Reference and Status */}
            <Card className="card-elevated border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Booking Reference</CardTitle>
                  <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Confirmed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-primary mb-2">
                  {referenceNumber}
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this reference number for your records and future correspondence.
                </p>
              </CardContent>
            </Card>

            {/* Calendar Integration Status */}
            {booking.googleSyncStatus && (
              <Card className="card-elevated border-0 bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <CalendarCheck className="w-5 h-5 mr-2" />
                    Calendar Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.googleSyncStatus === 'synced' ? (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Successfully added to Google Calendar</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This ride has been automatically added to the driver's Google Calendar. You'll receive automated reminders and updates.
                        </p>
                        {booking.googleEventId && (
                          <div className="mt-2 flex items-center text-xs text-muted-foreground">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span>Calendar Event ID: {booking.googleEventId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : booking.googleSyncStatus === 'failed' ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Manual calendar entry needed</span>
                        <br />
                        Your booking is confirmed, but we couldn't automatically add it to Google Calendar. 
                        The driver will manually add this to their schedule.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Adding to Google Calendar...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We're adding this booking to the driver's Google Calendar.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trip Details */}
            <Card className="card-elevated border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-semibold text-foreground">{booking.pickupLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Drop-off Location</p>
                    <p className="font-semibold text-foreground">{booking.dropoffLocation}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{booking.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold text-foreground">{booking.timeSlot}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Passengers</p>
                      <p className="font-semibold text-foreground">{booking.passengerCount} passenger(s)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="font-semibold text-emerald-600 text-lg">${booking.estimatedPrice}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="card-elevated border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Confirmation Email</h4>
                      <p className="text-sm text-muted-foreground">You'll receive a confirmation email within the next few minutes with your booking details.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Driver Assignment</h4>
                      <p className="text-sm text-muted-foreground">Your personal driver will be assigned and will contact you 24 hours before your trip.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Enjoy Your Ride</h4>
                      <p className="text-sm text-muted-foreground">Sit back and relax while your trusted driver gets you to your destination safely.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="card-elevated border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleBookAnother}
                  className="w-full gradient-purple-blue text-white hover:from-purple-600 hover:to-blue-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Book Another Ride
                </Button>
                
                <Button 
                  onClick={handleViewBookings}
                  variant="outline"
                  className="w-full"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View All Bookings
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="card-elevated border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Call us</p>
                    <p className="font-semibold text-foreground">(562) 618-2059</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email us</p>
                    <p className="font-semibold text-foreground">tony@loafecho.com</p>
                  </div>
                </div>
                
                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    We're available 24/7 to assist you with any questions or concerns about your booking.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Service Quality */}
            <Card className="card-elevated border-0 bg-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-foreground">4.9/5 Rating</p>
                  <p className="text-xs text-muted-foreground">From 500+ happy customers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Users, CreditCard, CheckCircle } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ booking }: { booking: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements || !booking) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update booking status to confirmed
      try {
        await apiRequest("PATCH", `/api/bookings/${booking.id}/status`, { 
          status: 'confirmed' 
        });
        
        toast({
          title: "Payment Successful!",
          description: "Your ride has been confirmed. You'll receive a confirmation email shortly.",
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        setLocation('/booking');
      } catch (err) {
        toast({
          title: "Payment Processed",
          description: "Your payment was successful, but there was an issue updating the booking status.",
          variant: "destructive",
        });
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center text-foreground">
            <MapPin className="mr-3 text-green-500" size={18} />
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{booking.pickupLocation}</p>
            </div>
          </div>
          <div className="flex items-center text-foreground">
            <MapPin className="mr-3 text-red-500" size={18} />
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{booking.dropoffLocation}</p>
            </div>
          </div>
          <div className="flex items-center text-foreground">
            <Clock className="mr-3 text-blue-500" size={18} />
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">{booking.date} at {booking.timeSlot}</p>
            </div>
          </div>
          <div className="flex items-center text-foreground">
            <Users className="mr-3 text-purple-500" size={18} />
            <div>
              <p className="text-sm text-muted-foreground">Passengers</p>
              <p className="font-medium">{booking.passengerCount} passenger(s)</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-foreground">Total Amount:</span>
          <span className="text-2xl font-bold text-emerald-600">${booking.estimatedPrice}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <CreditCard className="mr-2" size={20} />
          Payment Information
        </h3>
        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full gradient-purple-blue text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg h-auto"
      >
        {isProcessing ? (
          "Processing Payment..."
        ) : (
          <>
            <CheckCircle className="mr-2" size={20} />
            Complete Payment - ${booking?.estimatedPrice}
          </>
        )}
      </Button>
    </form>
  );
};

// Demo payment component for when Stripe is disabled
const DemoCheckoutForm = ({ booking }: { booking: any }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleDemoPayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update booking status to confirmed
      await apiRequest("PATCH", `/api/bookings/${booking.id}/status`, { 
        status: 'confirmed' 
      });
      
      toast({
        title: "Demo Payment Successful!",
        description: "Your ride has been confirmed. This was a demo payment - no actual charge was made.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setLocation('/booking');
    } catch (err) {
      toast({
        title: "Demo Payment Failed",
        description: "There was an issue processing your demo payment.",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <MapPin className="text-blue-500" size={16} />
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{booking.pickupLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="text-green-500" size={16} />
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{booking.dropoffLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="text-orange-500" size={16} />
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">{booking.date} at {booking.timeSlot}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="text-purple-500" size={16} />
            <div>
              <p className="text-sm text-muted-foreground">Passengers</p>
              <p className="font-medium">{booking.passengerCount} passenger(s)</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-foreground">Total Amount:</span>
          <span className="text-2xl font-bold text-emerald-600">${booking.estimatedPrice}</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <CreditCard className="mr-2" size={20} />
          Demo Payment Mode
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Stripe is currently not configured. This is a demo payment that will mark your booking as confirmed without processing any actual payment.
        </p>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">Demo Payment Details:</p>
          <p className="text-xs text-muted-foreground">• No actual payment will be processed</p>
          <p className="text-xs text-muted-foreground">• Your booking will be confirmed for testing</p>
          <p className="text-xs text-muted-foreground">• Set up Stripe to enable real payments</p>
        </div>
      </div>

      <Button
        onClick={handleDemoPayment}
        disabled={isProcessing}
        className="w-full gradient-purple-blue text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg h-auto"
      >
        {isProcessing ? (
          "Processing Demo Payment..."
        ) : (
          <>
            <CheckCircle className="mr-2" size={20} />
            Complete Demo Payment - ${booking?.estimatedPrice}
          </>
        )}
      </Button>
    </div>
  );
};

export default function Checkout() {
  const params = useParams();
  const bookingId = params.bookingId;
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: () => apiRequest("GET", `/api/bookings/${bookingId}`).then(res => res.json()),
    enabled: !!bookingId,
  });

  const [stripeDisabled, setStripeDisabled] = useState(false);

  useEffect(() => {
    if (booking && !clientSecret && !stripeDisabled) {
      // Create PaymentIntent as soon as booking is loaded
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: booking.estimatedPrice,
        bookingId: booking.id 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.log("Payment initialization error:", error);
          // Check if this is a Stripe disabled error
          error.json?.().then((errorData: any) => {
            if (errorData.stripeDisabled) {
              setStripeDisabled(true);
            }
          }).catch(() => {
            // If we can't parse the error, assume Stripe is disabled
            setStripeDisabled(true);
          });
        });
    }
  }, [booking, clientSecret, stripeDisabled, toast]);

  if (bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-md mx-4 card-elevated bg-card border-0">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-4">The booking you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.location.href = '/booking'}>
              Back to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show demo checkout if Stripe is disabled
  if (stripeDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="card-elevated shadow-xl border-0 bg-card">
            <CardHeader className="gradient-purple-blue p-6">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Complete Your Booking (Demo Mode)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <DemoCheckoutForm booking={booking} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading" />
          <p className="text-muted-foreground">Preparing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="card-elevated shadow-xl border-0 bg-card">
          <CardHeader className="gradient-purple-blue p-6">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Complete Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm booking={booking} />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center text-slate-700">
            <MapPin className="mr-3 text-green-500" size={18} />
            <div>
              <p className="text-sm text-slate-500">From</p>
              <p className="font-medium">{booking.pickupLocation}</p>
            </div>
          </div>
          <div className="flex items-center text-slate-700">
            <MapPin className="mr-3 text-red-500" size={18} />
            <div>
              <p className="text-sm text-slate-500">To</p>
              <p className="font-medium">{booking.dropoffLocation}</p>
            </div>
          </div>
          <div className="flex items-center text-slate-700">
            <Clock className="mr-3 text-blue-500" size={18} />
            <div>
              <p className="text-sm text-slate-500">Date & Time</p>
              <p className="font-medium">{booking.date} at {booking.timeSlot}</p>
            </div>
          </div>
          <div className="flex items-center text-slate-700">
            <Users className="mr-3 text-purple-500" size={18} />
            <div>
              <p className="text-sm text-slate-500">Passengers</p>
              <p className="font-medium">{booking.passengerCount} passenger(s)</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-slate-900">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">${booking.estimatedPrice}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
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

export default function Checkout() {
  const params = useParams();
  const bookingId = params.bookingId;
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["/api/bookings"],
    select: (bookings: any[]) => bookings.find(b => b.id === parseInt(bookingId || '0')),
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (booking && !clientSecret) {
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
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [booking, clientSecret, toast]);

  if (bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Booking Not Found</h1>
            <p className="text-slate-600 mb-4">The booking you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.location.href = '/booking'}>
              Back to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading" />
          <p className="text-slate-600">Preparing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border border-slate-200">
          <CardHeader className="gradient-purple-blue p-6">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Complete Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm booking={booking} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

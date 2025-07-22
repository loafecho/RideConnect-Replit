import { Car, Clock, Shield, Star, ArrowRight, CheckCircle, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
               style={{
                 backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
                 backgroundSize: '50px 50px'
               }}>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Your Personal
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Driver</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Skip the apps, skip the wait. Book rides directly with a trusted local driver for reliable, personal transportation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <a href="/booking" className="flex items-center">
                  Book a Ride Now
                  <ArrowRight className="ml-2" size={20} />
                </a>
              </Button>
              
              <Button variant="outline" size="lg" className="border-slate-400 text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg rounded-xl">
                <a href="/api/login" className="flex items-center">
                  Admin Login
                  <Shield className="ml-2" size={20} />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Personal Driver Service?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the difference of personalized transportation with a driver you can trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Car className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Reliable Service</h3>
                <p className="text-slate-600">
                  Direct booking with a trusted local driver means no surge pricing, no app glitches, and consistent quality service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Flexible Scheduling</h3>
                <p className="text-slate-600">
                  Book in advance or same-day rides. Choose time slots that work for your schedule with transparent availability.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Personal Touch</h3>
                <p className="text-slate-600">
                  Build a relationship with your driver. Enjoy personalized service and the comfort of familiar, trusted transportation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple Booking Process
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get from A to B in just a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Choose Time</h3>
              <p className="text-slate-600">Select from available time slots that fit your schedule</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Set Locations</h3>
              <p className="text-slate-600">Enter your pickup and drop-off addresses</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Secure Payment</h3>
              <p className="text-slate-600">Pay securely online with your preferred payment method</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Enjoy Your Ride</h3>
              <p className="text-slate-600">Relax while your personal driver gets you there safely</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience Personal Transportation?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Book your first ride today and discover the difference of having a personal driver.
          </p>
          
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <a href="/booking" className="flex items-center">
              Get Started Now
              <ArrowRight className="ml-2" size={20} />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
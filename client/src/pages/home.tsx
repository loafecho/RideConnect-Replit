import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, Shield, CreditCard, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Your Personal
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent block">
                  Driver Service
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Skip the uncertainty of ride-sharing. Book directly with trusted local drivers for reliable, personalized transportation that fits your schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button className="gradient-purple-blue text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all shadow-lg h-auto">
                    Book Your Ride
                  </Button>
                </Link>
                <Button variant="outline" className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-400 hover:text-blue-600 transition-all h-auto">
                  Learn More
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Availability</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-2xl font-bold text-slate-900">4.9</div>
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <div className="text-sm text-slate-600">Rating</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative lg:pl-8">
              <div className="relative animate-float">
                <img 
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Professional car service" 
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700">Available Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose RideConnect?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Experience the difference of personalized transportation with features designed for your convenience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Clock className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Flexible Scheduling</h3>
              <p className="text-slate-600">Book rides in advance with customizable time slots that work with your schedule.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Trusted Drivers</h3>
              <p className="text-slate-600">All drivers are personally vetted and insured for your safety and peace of mind.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Secure Payments</h3>
              <p className="text-slate-600">Easy, secure payments through Stripe with transparent pricing and instant receipts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

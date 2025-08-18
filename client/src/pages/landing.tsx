import { Car, Clock, Shield, Star, ArrowRight, CheckCircle, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-xl animate-float animate-delay-300"></div>
          <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full blur-xl animate-float animate-delay-500"></div>
        </div>
        
        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full"
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                 `,
                 backgroundSize: '60px 60px'
               }}>
          </div>
        </div>
        
        <div className="relative container-responsive text-center z-10">
          <div className="max-w-5xl mx-auto">
            {/* Enhanced Heading with Animation */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
                <span className="text-white">Your</span>{" "}
                <span className="relative inline-block">
                  <span className="text-gradient-purple-blue font-bold">
                    Personal
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-scale-in animate-delay-300"></div>
                </span>
                <br />
                <span className="text-gradient-emerald font-bold">Driver</span>
              </h1>
            </div>
            
            {/* Enhanced Subtitle */}
            <div className="mb-12 animate-fade-in-up animate-delay-200">
              <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 mb-6 max-w-4xl mx-auto leading-relaxed">
                Skip the apps, skip the wait. Book rides directly with a{" "}
                <span className="text-white font-semibold">trusted local driver</span>{" "}
                for reliable, personal transportation.
              </p>
              
              {/* Key Benefits */}
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-slate-400">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>No Surge Pricing</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Direct Communication</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span>Trusted Service</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced CTA Section */}
            <div className="animate-fade-in-up animate-delay-300">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link href="/booking">
                  <Button 
                    size="lg" 
                    className="group relative btn-primary text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Book Your Ride Now
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
                
                <button className="group flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Star className="group-hover:text-yellow-400 transition-colors" size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">See Reviews</div>
                    <div className="text-xs text-slate-400">4.9/5 from 200+ rides</div>
                  </div>
                </button>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-center text-slate-300">
                <div className="animate-fade-in animate-delay-500">
                  <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-slate-400">Happy Customers</div>
                </div>
                <div className="animate-fade-in animate-delay-700">
                  <div className="text-2xl md:text-3xl font-bold text-white">5 years</div>
                  <div className="text-sm text-slate-400">Experience</div>
                </div>
                <div className="animate-fade-in animate-delay-1000">
                  <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-slate-400">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="section-padding bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container-responsive">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star size={16} />
              <span>Why Choose RideConnect</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Experience the
              <span className="text-gradient-purple-blue font-bold"> Difference</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Personalized transportation that puts you first. No apps, no surprises, just reliable service from a driver you can trust.
            </p>
          </div>

          {/* Enhanced Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1: Reliable Service */}
            <Card className="card-interactive animate-fade-in-up animate-delay-100 group border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-3xl"></div>
                
                <div className="relative z-10">
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Car className="text-white" size={28} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-blue-600 transition-colors">
                    Reliable Service
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Direct booking with a trusted local driver means no surge pricing, no app glitches, and consistent quality service every time.
                  </p>
                  
                  {/* Feature highlights */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>No surge pricing</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>Consistent quality</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Flexible Scheduling */}
            <Card className="card-interactive animate-fade-in-up animate-delay-200 group border-0 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50">
              <CardContent className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-bl-3xl"></div>
                
                <div className="relative z-10">
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="text-white" size={28} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-emerald-600 transition-colors">
                    Flexible Scheduling
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Book in advance or same-day rides. Choose time slots that work for your schedule with transparent availability.
                  </p>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>Advance booking</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>Real-time availability</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Personal Touch */}
            <Card className="card-interactive animate-fade-in-up animate-delay-300 group border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 md:col-span-2 lg:col-span-1">
              <CardContent className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-3xl"></div>
                
                <div className="relative z-10">
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="text-white" size={28} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-purple-600 transition-colors">
                    Personal Touch
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Build a relationship with your driver. Enjoy personalized service and the comfort of familiar, trusted transportation.
                  </p>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>Personal relationship</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span>Trusted service</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up animate-delay-500">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Local Knowledge</h4>
              <p className="text-sm text-muted-foreground">Best routes and shortcuts</p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Secure Payment</h4>
              <p className="text-sm text-muted-foreground">Safe online transactions</p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Top Rated</h4>
              <p className="text-sm text-muted-foreground">4.9/5 star rating</p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Insured</h4>
              <p className="text-sm text-muted-foreground">Fully covered rides</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="section-padding bg-background dark:bg-slate-900">
        <div className="container-responsive">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle size={16} />
              <span>Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Book in{" "}
              <span className="text-gradient-emerald font-bold">4 Easy Steps</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Get from A to B with our simple, transparent booking process. No hidden fees, no complicated apps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center group animate-fade-in-up animate-delay-100">
              <div className="relative mb-8">
                {/* Connection line (hidden on mobile) */}
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-emerald-500/50 -z-10"></div>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-blue-600 transition-colors">
                Choose Time
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Select from available time slots that fit your schedule perfectly
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group animate-fade-in-up animate-delay-200">
              <div className="relative mb-8">
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-purple-500/50 -z-10"></div>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="text-white" size={24} />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-emerald-600 transition-colors">
                Set Locations
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Enter your pickup and drop-off addresses with precise details
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group animate-fade-in-up animate-delay-300">
              <div className="relative mb-8">
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-orange-500/50 -z-10"></div>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="text-white" size={24} />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-purple-600 transition-colors">
                Secure Payment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Pay securely online with your preferred payment method
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group animate-fade-in-up animate-delay-500">
              <div className="relative mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-orange-600 transition-colors">
                Enjoy Your Ride
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Relax while your personal driver gets you there safely
              </p>
            </div>
          </div>

          {/* Process Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up animate-delay-700">
            <Card className="card-elevated text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-2">Quick Booking</h4>
              <p className="text-sm text-muted-foreground">Complete your booking in under 2 minutes</p>
            </Card>
            
            <Card className="card-elevated text-center p-6 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-0">
              <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-2">Instant Confirmation</h4>
              <p className="text-sm text-muted-foreground">Get immediate booking confirmation</p>
            </Card>
            
            <Card className="card-elevated text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-0">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-2">Premium Experience</h4>
              <p className="text-sm text-muted-foreground">Enjoy personalized, high-quality service</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="section-padding bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-3xl animate-float animate-delay-300"></div>
        </div>
        
        <div className="relative container-responsive text-center">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Experience
              <br />
              <span className="text-gradient-purple-blue font-bold">Personal Transportation?</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of satisfied customers who've discovered the difference of having a trusted personal driver.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="group relative btn-primary text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Now
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4 text-slate-300">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-2 border-white/20"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full border-2 border-white/20"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white/20"></div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">500+ Happy Customers</div>
                  <div className="text-xs">Average 4.9/5 rating</div>
                </div>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-emerald-400" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Licensed Driver</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-emerald-400" />
                <span>5 Years Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-emerald-400" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
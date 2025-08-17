import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import Checkout from "@/pages/checkout";
import Confirmation from "@/pages/confirmation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-18">
        <Switch>
          <Route path="/" component={isAuthenticated ? Home : Landing} />
          <Route path="/booking" component={Booking} />
          <Route path="/admin" component={isAuthenticated ? Admin : AdminLogin} />
          <Route path="/checkout/:bookingId?" component={Checkout} />
          <Route path="/confirmation/:bookingId" component={Confirmation} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="rideconnect-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

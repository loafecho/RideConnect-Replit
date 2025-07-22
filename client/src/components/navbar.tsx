import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const getNavItems = () => {
    if (isAuthenticated) {
      return [
        { href: "/", label: "Dashboard" },
        { href: "/booking", label: "Book Now" },
        { href: "/admin", label: "Admin" },
      ];
    }
    return [
      { href: "/", label: "Home" },
      { href: "/booking", label: "Book Now" },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent cursor-pointer">
                RideConnect
              </h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button 
                  onClick={logout}
                  variant="outline" 
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link href="/admin">
                  <Button className="gradient-purple-blue text-white hover:from-purple-600 hover:to-blue-600">
                    Admin Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === item.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-2">
              {isAuthenticated ? (
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  variant="outline" 
                  className="w-full border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link href="/admin">
                  <Button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full gradient-purple-blue text-white hover:from-purple-600 hover:to-blue-600"
                  >
                    Admin Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

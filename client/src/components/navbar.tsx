import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Car, Settings, User, Home, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Enhanced navigation items with icons
  const getNavItems = () => {
    if (isAuthenticated) {
      return [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/booking", label: "Book Ride", icon: Car },
        { href: "/admin", label: "Admin", icon: Settings },
      ];
    }
    return [
      { href: "/", label: "Home", icon: Home },
      { href: "/booking", label: "Book Ride", icon: Car },
    ];
  };

  const navItems = getNavItems();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav 
        className={cn(
          "transition-all duration-300 ease-in-out",
          isScrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg" 
            : "bg-background/95 backdrop-blur-sm border-b border-border/50"
        )}
      >
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="focus-visible">
                <div className="flex items-center space-x-2 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                      <Car className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gradient-purple-blue group-hover:scale-105 transition-transform">
                    RideConnect
                  </h1>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="focus-visible"
                  >
                    <div className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}>
                      <IconComponent size={16} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                    <User size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Admin</span>
                  </div>
                  <Button 
                    onClick={logout}
                    variant="outline" 
                    size="sm"
                    className="focus-visible"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/admin">
                  <Button className="btn-primary focus-visible">
                    Admin Sign In
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center space-x-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="focus-visible"
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    size={20} 
                    className={cn(
                      "absolute inset-0 transition-all duration-200",
                      isMobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                    )}
                  />
                  <X 
                    size={20} 
                    className={cn(
                      "absolute inset-0 transition-all duration-200",
                      isMobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                    )}
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen 
            ? "max-h-screen opacity-100" 
            : "max-h-0 opacity-0"
        )}>
          <div className="bg-background/95 backdrop-blur-md border-t border-border">
            <div className="container-responsive py-4">
              {/* Mobile Navigation Items */}
              <div className="space-y-2 mb-6">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className="focus-visible"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>
                        <IconComponent size={20} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Actions */}
              <div className="pt-4 border-t border-border">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-muted rounded-lg">
                      <User size={20} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Signed in as Admin</div>
                        <div className="text-sm text-muted-foreground">Administrator</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      variant="outline" 
                      className="w-full justify-start focus-visible"
                      size="lg"
                    >
                      <LogOut size={20} className="mr-3" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/admin">
                    <Button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full btn-primary justify-start focus-visible"
                      size="lg"
                    >
                      <Settings size={20} className="mr-3" />
                      Admin Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

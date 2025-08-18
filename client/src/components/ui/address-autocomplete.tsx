import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  importance?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter address...",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to detect if input looks like a complete address with house number
  const isCompleteAddress = (query: string): boolean => {
    // Pattern: starts with numbers, followed by space, then street name
    const completeAddressPattern = /^\d+\s+[a-zA-Z]/;
    return completeAddressPattern.test(query.trim());
  };

  // Search for exact address match using LocationIQ Search API
  const getExactAddressMatch = async (query: string): Promise<AddressSuggestion[]> => {
    const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
    
    if (!apiKey) return [];

    try {
      // Use Search API for precise address matching
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=3`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform Search API response to match our AddressSuggestion interface
        return data.map((item: any) => ({
          place_id: item.place_id,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          type: item.type,
          importance: item.importance
        }));
      }
    } catch (error) {
      console.error('Exact address search error:', error);
    }
    
    return [];
  };

  // Autocomplete suggestions using LocationIQ Autocomplete API
  const getAutocompleteSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
    const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
    
    if (!apiKey) return [];

    try {
      // Using LocationIQ Autocomplete API (2 requests/second, 5000/day free)
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(
          query
        )}&limit=5&format=json`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data: AddressSuggestion[] = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Autocomplete search error:', error);
    }
    
    return [];
  };

  // Hybrid search function that uses both exact matching and autocomplete
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get LocationIQ API key from environment
      const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
      
      if (!apiKey) {
        console.warn('LocationIQ API key not found. Please add VITE_LOCATIONIQ_API_KEY to your .env file');
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      let suggestions: AddressSuggestion[] = [];

      // Check if input looks like a complete address with house number
      if (isCompleteAddress(query)) {
        // First try exact address matching with Search API
        const exactMatches = await getExactAddressMatch(query);
        suggestions = [...exactMatches];
        
        // If we have good exact matches, prioritize them but still add some autocomplete suggestions
        if (exactMatches.length > 0) {
          const autocompleteMatches = await getAutocompleteSuggestions(query);
          // Add autocomplete suggestions that aren't already in exact matches
          const uniqueAutocomplete = autocompleteMatches.filter(auto => 
            !exactMatches.some(exact => exact.place_id === auto.place_id)
          );
          suggestions = [...exactMatches, ...uniqueAutocomplete.slice(0, 2)];
        } else {
          // Fallback to autocomplete if no exact matches
          suggestions = await getAutocompleteSuggestions(query);
        }
      } else {
        // For partial input, use autocomplete API
        suggestions = await getAutocompleteSuggestions(query);
      }

      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search for 500ms (optimized for LocationIQ's 2 requests/second limit)
    debounceRef.current = setTimeout(() => {
      searchAddresses(inputValue);
    }, 500);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={cn("pr-10", className)}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Button
              key={suggestion.place_id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left p-3 h-auto whitespace-normal text-wrap rounded-none",
                index === selectedIndex && "bg-accent",
                index !== suggestions.length - 1 && "border-b border-border"
              )}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </Button>
          ))}
          {/* LocationIQ Attribution (required for free tier) */}
          <div className="px-3 py-2 border-t border-border bg-muted/50">
            <a 
              href="https://locationiq.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Search by LocationIQ.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
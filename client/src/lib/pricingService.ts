/**
 * RideConnect Pricing Service
 * 
 * Professional time-based pricing using OpenRouteService API
 * for real driving duration with airport detection.
 */

// Pricing configuration
export const PRICING_CONFIG = {
  standard: {
    hourlyRate: 60,
    minimumFare: 16,
  },
  airport: {
    hourlyRate: 80,
    minimumFare: 30,
  },
} as const;

// Airport detection is now handled by user checkbox - no need for keyword detection

export interface RouteResult {
  duration: number; // in hours
  distance: number; // in miles
  isAirportRoute: boolean;
  estimatedPrice: number;
  rateType: 'standard' | 'airport';
}

export interface PricingError {
  message: string;
  fallbackPrice?: number;
}

// Airport detection removed - now handled by user checkbox

/**
 * Calculate price based on duration and route type
 */
export function calculatePrice(
  durationInHours: number, 
  isAirportRoute: boolean
): number {
  const config = isAirportRoute ? PRICING_CONFIG.airport : PRICING_CONFIG.standard;
  
  const basePrice = durationInHours * config.hourlyRate;
  const finalPrice = Math.max(basePrice, config.minimumFare);
  
  // Round to 2 decimal places
  return Math.round(finalPrice * 100) / 100;
}

/**
 * Get route information from OpenRouteService API
 */
export async function getRouteInfo(
  pickup: string,
  dropoff: string,
  isAirportRoute: boolean
): Promise<RouteResult | PricingError> {
  try {
    // Get coordinates for both locations using Nominatim (same as autocomplete)
    const [pickupCoords, dropoffCoords] = await Promise.all([
      getCoordinates(pickup),
      getCoordinates(dropoff)
    ]);

    if (!pickupCoords || !dropoffCoords) {
      return {
        message: "Could not find coordinates for one or both locations",
        fallbackPrice: 25.00
      };
    }

    // Get route from OpenRouteService (with enhanced fallback)
    const route = await getOpenRouteServiceRoute(pickupCoords, dropoffCoords);
    
    if (!route) {
      return {
        message: "Unable to calculate precise route",
        fallbackPrice: calculateFallbackPrice(isAirportRoute)
      };
    }

    const durationInHours = route.duration / 3600; // Convert seconds to hours
    const distanceInMiles = route.distance * 0.000621371; // Convert meters to miles
    const estimatedPrice = calculatePrice(durationInHours, isAirportRoute);

    return {
      duration: durationInHours,
      distance: distanceInMiles,
      isAirportRoute,
      estimatedPrice,
      rateType: isAirportRoute ? 'airport' : 'standard'
    };

  } catch (error) {
    console.error('Pricing service error:', error);
    return {
      message: "Pricing service temporarily unavailable",
      fallbackPrice: calculateFallbackPrice(isAirportRoute)
    };
  }
}

/**
 * Get coordinates from LocationIQ API (consistent with autocomplete service)
 */
async function getCoordinates(address: string): Promise<[number, number] | null> {
  try {
    // Get LocationIQ API key from environment
    const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;
    
    if (!apiKey) {
      console.info('LocationIQ API key not configured - using fallback coordinates estimation');
      // Fallback to simple coordinates for Las Vegas area when no API key
      return getFallbackCoordinates(address);
    }

    const response = await fetch(
      `https://api.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('LocationIQ API error:', response.status);
      return getFallbackCoordinates(address);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return getFallbackCoordinates(address);
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      return getFallbackCoordinates(address);
    }
    
    return [lon, lat]; // OpenRouteService expects [longitude, latitude]
  } catch (error) {
    console.error('Geocoding error:', error);
    return getFallbackCoordinates(address);
  }
}

/**
 * Fallback coordinates for common Las Vegas locations
 */
function getFallbackCoordinates(address: string): [number, number] | null {
  const lowerAddress = address.toLowerCase();
  
  // Common Las Vegas landmarks and their approximate coordinates
  const knownLocations: Record<string, [number, number]> = {
    // Airports
    'harry reid': [-115.1522, 36.0840], // Harry Reid International Airport
    'mccarran': [-115.1522, 36.0840],
    'las vegas airport': [-115.1522, 36.0840],
    'henderson executive': [-115.1341, 35.9728],
    'north las vegas': [-115.1958, 36.2136],
    
    // Strip locations
    'las vegas strip': [-115.1725, 36.1147],
    'strip': [-115.1725, 36.1147],
    'bellagio': [-115.1745, 36.1126],
    'caesars': [-115.1745, 36.1162],
    'mgm': [-115.1677, 36.1021],
    'venetian': [-115.1710, 36.1212],
    'luxor': [-115.1761, 36.0955],
    
    // Downtown
    'downtown las vegas': [-115.1446, 36.1699],
    'fremont street': [-115.1446, 36.1699],
    
    // Default Las Vegas center
    'las vegas': [-115.1398, 36.1699],
  };
  
  // Check if address contains any known location
  for (const [key, coords] of Object.entries(knownLocations)) {
    if (lowerAddress.includes(key)) {
      return coords;
    }
  }
  
  // Default to Las Vegas city center if nothing matches
  return [-115.1398, 36.1699];
}

/**
 * Calculate straight-line distance between two points using Haversine formula
 */
function calculateHaversineDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

/**
 * Estimate driving time and distance based on straight-line distance
 */
function estimateRoute(
  start: [number, number],
  end: [number, number]
): { duration: number; distance: number } {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  // Calculate straight-line distance
  const straightLineKm = calculateHaversineDistance(startLat, startLon, endLat, endLon);
  
  // Estimate actual driving distance (typically 1.2-1.4x straight line)
  const drivingDistanceKm = straightLineKm * 1.3;
  const drivingDistanceMeters = drivingDistanceKm * 1000;
  
  // Estimate driving time based on distance and average speed
  // Urban: ~30 km/h, Highway: ~80 km/h, Mixed: ~50 km/h
  let avgSpeedKmh = 50; // Default mixed driving
  
  // Adjust speed based on distance (longer trips likely have more highway)
  if (drivingDistanceKm > 100) {
    avgSpeedKmh = 70; // More highway driving
  } else if (drivingDistanceKm < 20) {
    avgSpeedKmh = 35; // More city driving
  }
  
  const durationHours = drivingDistanceKm / avgSpeedKmh;
  const durationSeconds = durationHours * 3600;
  
  return {
    duration: durationSeconds,
    distance: drivingDistanceMeters
  };
}

/**
 * Get route from OpenRouteService API with enhanced fallback
 */
async function getOpenRouteServiceRoute(
  start: [number, number],
  end: [number, number]
): Promise<{ duration: number; distance: number } | null> {
  const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;
  
  // If no API key is configured, use estimation immediately
  if (!apiKey) {
    console.info('OpenRouteService API key not configured, using distance estimation');
    return estimateRoute(start, end);
  }
  
  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [start, end],
          format: 'json',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found in API response');
    }

    const route = data.routes[0];
    return {
      duration: route.summary.duration,
      distance: route.summary.distance
    };

  } catch (error) {
    console.warn('OpenRouteService API failed, using distance estimation:', error.message);
    // Fallback to estimation when API fails
    return estimateRoute(start, end);
  }
}

/**
 * Calculate fallback price when API fails
 */
function calculateFallbackPrice(isAirportRoute: boolean): number {
  // Use minimum fare as fallback
  const config = isAirportRoute ? PRICING_CONFIG.airport : PRICING_CONFIG.standard;
  return config.minimumFare + 10; // Add small buffer for uncertainty
}

/**
 * Format pricing information for display
 */
export function formatPricingInfo(result: RouteResult): {
  priceText: string;
  rateInfo: string;
  routeInfo: string;
} {
  const rateInfo = result.isAirportRoute 
    ? `Airport Rate: $${PRICING_CONFIG.airport.hourlyRate}/hour (min $${PRICING_CONFIG.airport.minimumFare})`
    : `Standard Rate: $${PRICING_CONFIG.standard.hourlyRate}/hour (min $${PRICING_CONFIG.standard.minimumFare})`;

  const routeInfo = `${result.distance.toFixed(1)} miles • ${Math.round(result.duration * 60)} minutes`;

  return {
    priceText: `$${result.estimatedPrice.toFixed(2)}`,
    rateInfo,
    routeInfo
  };
}
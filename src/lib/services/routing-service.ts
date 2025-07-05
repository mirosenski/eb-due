import { Coordinates, Address, RouteResult, Station, CustomAddress } from '../store/app-store';

export interface RouteRequest {
  start: Coordinates;
  end: Coordinates;
}

export interface RouteResponse {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  isFallback?: boolean; // true wenn Luftlinie-Fallback verwendet wurde
}

class RoutingService {
  // Verbesserte API-URLs mit Fallback-Optionen für Deutschland
  private readonly OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';
  private readonly VALHALLA_BASE_URL = 'https://valhalla1.openstreetmap.de/route';
  private readonly GRAPHHOPPER_BASE_URL = 'https://graphhopper.com/api/1/route';
  private readonly DEUTSCHE_ROUTING_URL = 'https://routing.openstreetmap.de/routed-car/route/v1/driving';

  // Simple in-memory cache for previously calculated routes
  private readonly routeCache: Map<string, RouteResponse> = new Map();
  private readonly MAX_CACHE_SIZE = 100;

  private buildOSRMUrl(start: Coordinates, end: Coordinates, baseUrl?: string): string {
    if (baseUrl) {
      return `${baseUrl}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    }
    return `http://localhost:3000/route/${start.lng}/${start.lat}/${end.lng}/${end.lat}`;
  }
  
  // Alternative OSRM-Instanzen für Fallback (Deutschland-optimiert)
  private readonly OSRM_FALLBACK_URLS = [
    'https://routing.openstreetmap.de/routed-car/route/v1/driving', // Deutschland-spezifisch zuerst
    'https://router.project-osrm.org/route/v1/driving', // Haupt-OSRM
    'https://osrm.router.place/route/v1/driving', // Alternative
    'https://router.osrm.io/route/v1/driving' // Weitere Alternative
  ];

  // Calculate multiple routes from start address to selected destinations
  async calculateMultipleRoutes(
    startAddress: Address,
    selectedStationIds: string[],
    selectedCustomAddressIds: string[],
    allStations: Station[],
    customAddresses: CustomAddress[]
  ): Promise<RouteResult[]> {
    const results: RouteResult[] = [];
    
    // Calculate routes to selected stations
    for (const stationId of selectedStationIds) {
      const station = allStations.find(s => s.id === stationId);
      if (!station) continue;

      try {
        const route = await this.calculateSingleRoute(
          startAddress.coordinates,
          station.coordinates
        );

        if (route) {
          results.push({
            id: `station-${station.id}`,
            destinationId: station.id,
            destinationName: station.name,
            destinationType: 'station',
            address: station.address,
            distance: route.distance / 1000, // Convert to km
            duration: Math.round(route.duration / 60), // Convert to minutes
            estimatedFuel: (route.distance / 1000) * 0.095, // 9.5L/100km
            estimatedCost: (route.distance / 1000) * 0.095 * 1.75, // 1.75€/L
            routeType: 'Schnellste',
            coordinates: station.coordinates,
            color: this.generateRouteColor(results.length),
            route: {
              coordinates: route.coordinates,
              distance: route.distance,
              duration: route.duration
            },
            provider: 'OSRM'
          });
        }
      } catch (error) {
        console.error(`Error calculating route to station ${station.name}:`, error);
        
        // Fallback to direct distance calculation
        const directDistance = this.calculateDirectDistance(
          startAddress.coordinates,
          station.coordinates
        );
        
        results.push({
          id: `station-${station.id}`,
          destinationId: station.id,
          destinationName: station.name,
          destinationType: 'station',
          address: station.address,
          distance: directDistance,
          duration: Math.round(directDistance * 2), // Rough estimate: 2 minutes per km
          estimatedFuel: directDistance * 0.095,
          estimatedCost: directDistance * 0.095 * 1.75,
          routeType: 'Kürzeste',
          coordinates: station.coordinates,
          color: this.generateRouteColor(results.length),
          route: {
            coordinates: [
              [startAddress.coordinates.lng, startAddress.coordinates.lat],
              [station.coordinates.lng, station.coordinates.lat]
            ],
            distance: directDistance * 1000,
            duration: directDistance * 120
          },
          provider: 'Direct'
        });
      }
    }

    // Calculate routes to selected custom addresses
    for (const addressId of selectedCustomAddressIds) {
      const customAddress = customAddresses.find(a => a.id === addressId);
      if (!customAddress || !customAddress.coordinates) continue;

      try {
        const route = await this.calculateSingleRoute(
          startAddress.coordinates,
          customAddress.coordinates
        );

        if (route) {
          results.push({
            id: `custom-${customAddress.id}`,
            destinationId: customAddress.id,
            destinationName: customAddress.name,
            destinationType: 'custom',
            address: customAddress.address,
            distance: route.distance / 1000, // Convert to km
            duration: Math.round(route.duration / 60), // Convert to minutes
            estimatedFuel: (route.distance / 1000) * 0.095,
            estimatedCost: (route.distance / 1000) * 0.095 * 1.75,
            routeType: 'Schnellste',
            coordinates: customAddress.coordinates,
            color: this.generateRouteColor(results.length),
            route: {
              coordinates: route.coordinates,
              distance: route.distance,
              duration: route.duration
            },
            provider: 'OSRM'
          });
        }
      } catch (error) {
        console.error(`Error calculating route to custom address ${customAddress.name}:`, error);
        
        // Fallback to direct distance calculation
        const directDistance = this.calculateDirectDistance(
          startAddress.coordinates,
          customAddress.coordinates
        );
        
        results.push({
          id: `custom-${customAddress.id}`,
          destinationId: customAddress.id,
          destinationName: customAddress.name,
          destinationType: 'custom',
          address: customAddress.address,
          distance: directDistance,
          duration: Math.round(directDistance * 2), // Rough estimate: 2 minutes per km
          estimatedFuel: directDistance * 0.095,
          estimatedCost: directDistance * 0.095 * 1.75,
          routeType: 'Kürzeste',
          coordinates: customAddress.coordinates,
          color: this.generateRouteColor(results.length),
          route: {
            coordinates: [
              [startAddress.coordinates.lng, startAddress.coordinates.lat],
              [customAddress.coordinates.lng, customAddress.coordinates.lat]
            ],
            distance: directDistance * 1000,
            duration: directDistance * 120
          },
          provider: 'Direct'
        });
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }

  // Calculate single route between two points
  async calculateSingleRoute(
    start: Coordinates,
    end: Coordinates
  ): Promise<RouteResponse> {
    const cacheKey = `${start.lng}-${start.lat}-${end.lng}-${end.lat}`;

    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey)!;
    }

    const request: RouteRequest = { start, end };

    let result: RouteResponse | null = null;

    // Try OSRM with multiple fallback URLs (prioritized for Germany)
    for (const osrmUrl of this.OSRM_FALLBACK_URLS) {
      try {
        console.log(`🛣️ Versuche Routing mit ${osrmUrl}`);
        result = await this.calculateWithOSRM(request, osrmUrl);
        console.log(`✅ Routing erfolgreich mit ${osrmUrl}, ${result.coordinates.length} Koordinaten`);
        break;
      } catch (error) {
        console.warn(`❌ OSRM ${osrmUrl} fehlgeschlagen:`, error);
        continue;
      }
    }

    if (!result) {
      // Try Valhalla as fallback
      try {
        console.log('🛣️ Versuche Routing mit Valhalla...');
        result = await this.calculateWithValhalla(request);
        console.log(`✅ Valhalla erfolgreich, ${result.coordinates.length} Koordinaten`);
      } catch (error) {
        console.warn('❌ Valhalla fehlgeschlagen:', error);
      }
    }

    if (!result) {
      console.warn('⚠️ Alle Routing-APIs fehlgeschlagen, verwende Luftlinie');
      result = this.createFallbackRoute(start, end);
    }

    this.saveToCache(cacheKey, result);

    return result;
  }

  // OSRM routing implementation with configurable URL
  private async calculateWithOSRM(request: RouteRequest, baseUrl?: string): Promise<RouteResponse> {
    const { start, end } = request;
    const url = this.buildOSRMUrl(start, end, baseUrl);

    console.log(`🌐 OSRM Request: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'eb-due/1.0'
      },
      // Timeout nach 15 Sekunden für bessere Zuverlässigkeit
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = data.routes[0];
    
    // Validiere dass wir echte Route-Koordinaten haben
    if (!route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length < 2) {
      throw new Error('Invalid route geometry received');
    }

    console.log(`📍 OSRM Route: ${route.geometry.coordinates.length} Koordinaten, ${(route.distance/1000).toFixed(1)}km, ${Math.round(route.duration/60)}min`);

    return {
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration
    };
  }

  private createFallbackRoute(start: Coordinates, end: Coordinates): RouteResponse {
    const distanceKm = this.calculateDirectDistance(start, end);
    
    // Erstelle eine leicht gekrümmte Linie statt Luftlinie für bessere Visualisierung
    const coordinates: [number, number][] = [];
    const steps = Math.max(5, Math.min(20, Math.round(distanceKm / 5))); // 5-20 Punkte je nach Entfernung
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      
      // Füge eine leichte Krümmung hinzu, um es als Fallback erkennbar zu machen
      const curvature = Math.sin(ratio * Math.PI) * 0.001; // Kleine Krümmung
      coordinates.push([lng + curvature, lat + curvature]);
    }
    
    console.log(`⚠️ FALLBACK Route (Luftlinie): ${coordinates.length} Punkte, ${distanceKm.toFixed(1)}km geschätzt`);
    
    return {
      coordinates,
      distance: distanceKm * 1000, // Schätze 20% mehr als Luftlinie für echte Straße
      duration: Math.round((distanceKm / 45) * 3600), // Konservativer mit 45km/h für städtische Gebiete
      isFallback: true // Markiere als Fallback für UI
    };
  }

  private saveToCache(key: string, route: RouteResponse): void {
    if (this.routeCache.size >= this.MAX_CACHE_SIZE) {
      const oldest = this.routeCache.keys().next().value;
      if (oldest) {
        this.routeCache.delete(oldest);
      }
    }
    this.routeCache.set(key, route);
  }

  // Valhalla routing implementation (alternative)
  private async calculateWithValhalla(request: RouteRequest): Promise<RouteResponse> {
    const { start, end } = request;
    
    const payload = {
      locations: [
        { lat: start.lat, lon: start.lng },
        { lat: end.lat, lon: end.lng }
      ],
      costing: "auto",
      shape_match: "map_snap", // Bessere Straßenanpassung
      format: "json",
      directions_options: {
        units: "kilometers"
      }
    };

    console.log(`🌐 Valhalla Request für ${start.lat},${start.lng} -> ${end.lat},${end.lng}`);

    const response = await fetch(this.VALHALLA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'eb-due/1.0'
      },
      body: JSON.stringify(payload),
      // Timeout nach 15 Sekunden für bessere Zuverlässigkeit
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Valhalla API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.trip || !data.trip.legs || data.trip.legs.length === 0) {
      throw new Error('No routes found from Valhalla');
    }

    const leg = data.trip.legs[0];
    
    if (!leg.shape) {
      throw new Error('No route geometry received from Valhalla');
    }
    
    // Decode Valhalla's polyline to coordinates
    const coordinates = this.decodePolyline(leg.shape);
    
    if (!coordinates || coordinates.length < 2) {
      throw new Error('Invalid route coordinates from Valhalla');
    }

    console.log(`📍 Valhalla Route: ${coordinates.length} Koordinaten, ${(leg.summary.length).toFixed(1)}km, ${Math.round(leg.summary.time/60)}min`);
    
    return {
      coordinates,
      distance: leg.summary.length * 1000, // Convert km to meters
      duration: leg.summary.time
    };
  }

  // Generate unique colors for routes
  private generateRouteColor(index: number): string {
    const colors = [
      '#3B82F6', // blue-500
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6366F1'  // indigo-500
    ];
    return colors[index % colors.length];
  }

  // Direct distance calculation (Haversine formula)
  calculateDirectDistance(start: Coordinates, end: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(end.lat - start.lat);
    const dLng = this.degreesToRadians(end.lng - start.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(start.lat)) * 
      Math.cos(this.degreesToRadians(end.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Decode polyline (simplified implementation)
  private decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      points.push([lng / 1e5, lat / 1e5]);
    }

    return points;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const routingService = new RoutingService();

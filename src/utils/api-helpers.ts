/**
 * Hilfsfunktionen für bessere API-Fehlerbehandlung
 */

/**
 * Prüft, ob eine API-Antwort gültiges JSON ist
 */
export function isValidJsonResponse(data: any): boolean {
  if (typeof data === 'string') {
    // Prüfe auf HTML-Antworten
    if (data.includes('<!doctype') || data.includes('<html') || data.includes('<HTML')) {
      return false;
    }
    // Versuche JSON zu parsen
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }
  return typeof data === 'object' && data !== null;
}

/**
 * Sichere fetch-Funktion mit besserer Fehlerbehandlung
 */
export async function safeFetch(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Prüfe Content-Type Header
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn('⚠️ API gibt HTML statt JSON zurück');
      throw new Error('API gibt HTML statt JSON zurück');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Prüfe, ob die Antwort HTML enthält
    if (text.includes('<!doctype') || text.includes('<html') || text.includes('<HTML')) {
      console.warn('⚠️ API gibt HTML statt JSON zurück');
      throw new Error('API gibt HTML statt JSON zurück');
    }

    // Versuche JSON zu parsen
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn('⚠️ API gibt ungültiges JSON zurück');
      throw new Error('API gibt ungültiges JSON zurück');
    }
  } catch (error) {
    console.error('Fehler beim API-Aufruf:', error);
    throw error;
  }
}

/**
 * Erstellt Fallback-Daten für Adress-Statistiken
 */
export function createAddressStatsFallback() {
  return {
    totalAddresses: 0,
    pendingAddresses: 0,
    approvedAddresses: 0,
    rejectedAddresses: 0,
    lastUpdate: new Date().toISOString()
  };
}

/**
 * Erstellt Fallback-Daten für Stations-Statistiken
 */
export function createStationStatsFallback() {
  return {
    totalStations: 0,
    totalPrecincts: 0,
    totalStationHouses: 0,
    routesToday: 0,
    avgResponseTime: 0,
    popularCities: [],
    lastUpdate: new Date()
  };
}

/**
 * Validiert ein Array von Stationen
 */
export function validateStationsArray(stations: any[]): any[] {
  if (!Array.isArray(stations)) {
    console.warn('⚠️ stations ist kein Array');
    return [];
  }
  
  const validStations = stations.filter(station => 
    station && typeof station === 'object' && station.id && station.name
  );
  
  if (validStations.length !== stations.length) {
    console.warn(`⚠️ ${stations.length - validStations.length} ungültige Stationen gefiltert`);
  }
  
  return validStations;
}

/**
 * Validiert ein Array von Adressen
 */
export function validateAddressesArray(addresses: any[]): any[] {
  if (!Array.isArray(addresses)) {
    console.warn('⚠️ addresses ist kein Array');
    return [];
  }
  
  const validAddresses = addresses.filter(address => 
    address && typeof address === 'object' && address.id && address.name
  );
  
  if (validAddresses.length !== addresses.length) {
    console.warn(`⚠️ ${addresses.length - validAddresses.length} ungültige Adressen gefiltert`);
  }
  
  return validAddresses;
} 
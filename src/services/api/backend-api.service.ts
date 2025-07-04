import axios from 'axios'
import { Station } from '@/types/station.types'

// Verwende Vite Proxy statt direkter Backend-URL
const API_URL = '/api/stationen'

// Fallback-Daten importieren (TypeScript statt JSON)
import { localStationsData } from '@/data/stations'

// Hilfsfunktion zum Token holen
function getAuthToken(): string | null {
  try {
    // Token aus localStorage holen (Zustand-Store persistiert dort)
    const authData = localStorage.getItem('eb-due-v2-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.token) {
        console.log('🔑 Token gefunden:', parsed.token.substring(0, 20) + '...');
        return parsed.token;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Token abrufen:', error);
  }
  console.warn('⚠️ Kein Token im localStorage gefunden');
  return null;
}

export const fetchStations = async (params = {}): Promise<Station[]> => {
  try {
    console.log('🔄 Lade Stationen...');
    
    // Versuche zuerst lokale Daten zu laden
    const localStations = localStorage.getItem('eb-due-stations');
    if (localStations) {
      const stations = JSON.parse(localStations);
      console.log('✅ Lokale Stationen geladen:', stations.length, 'Stationen');
      return stations;
    }
    
    // Fallback: Versuche Backend (falls verfügbar)
    try {
      const response = await axios.get(API_URL, { 
        params,
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        const stations = response.data.stations || response.data;
        if (Array.isArray(stations)) {
          console.log('✅ Backend Stationen geladen:', stations.length, 'Stationen');
          return stations;
        }
      }
    } catch (backendError) {
      console.warn('⚠️ Backend nicht erreichbar, verwende lokale Daten');
    }
    
    // Fallback zu lokalen Testdaten
    console.log('✅ Verwende lokale Testdaten');
    return localStationsData;
    
  } catch (error) {
    console.error('❌ Fehler beim Laden der Stationen:', error);
    return [];
  }
}

export const createStation = async (station: Omit<Station, 'id' | 'lastModified'>): Promise<Station> => {
  try {
    console.log('🔄 Erstelle neue Station...', station);
    
    // Temporäre lokale Speicherung bis Backend verfügbar ist
    const newStation: Station = {
      ...station,
      id: `station_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: new Date().toISOString()
    };
    
    // Speichere in localStorage
    const existingStations = JSON.parse(localStorage.getItem('eb-due-stations') || '[]');
    existingStations.push(newStation);
    localStorage.setItem('eb-due-stations', JSON.stringify(existingStations));
    
    console.log('✅ Station lokal gespeichert:', newStation);
    return newStation;
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Station:', error);
    throw error;
  }
}

export const updateStation = async (id: string, station: Partial<Station>): Promise<Station> => {
  try {
    console.log('🔄 Aktualisiere Station:', id);
    
    // Temporäre lokale Speicherung bis Backend verfügbar ist
    const existingStations = JSON.parse(localStorage.getItem('eb-due-stations') || '[]');
    const stationIndex = existingStations.findIndex((s: Station) => s.id === id);
    
    if (stationIndex === -1) {
      throw new Error(`Station mit ID ${id} nicht gefunden`);
    }
    
    const updatedStation = {
      ...existingStations[stationIndex],
      ...station,
      lastModified: new Date().toISOString()
    };
    
    existingStations[stationIndex] = updatedStation;
    localStorage.setItem('eb-due-stations', JSON.stringify(existingStations));
    
    console.log('✅ Station lokal aktualisiert:', updatedStation);
    return updatedStation;
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der Station:', error);
    throw error;
  }
}

export const deleteStation = async (id: string): Promise<void> => {
  try {
    console.log('🔄 Lösche Station:', id);
    
    // Temporäre lokale Speicherung bis Backend verfügbar ist
    const existingStations = JSON.parse(localStorage.getItem('eb-due-stations') || '[]');
    const filteredStations = existingStations.filter((s: Station) => s.id !== id);
    
    localStorage.setItem('eb-due-stations', JSON.stringify(filteredStations));
    
    console.log('✅ Station lokal gelöscht');
  } catch (error) {
    console.error('❌ Fehler beim Löschen der Station:', error);
    throw error;
  }
}

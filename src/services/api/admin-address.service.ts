import axios from 'axios'
import { isValidJsonResponse, createAddressStatsFallback, validateAddressesArray } from '@/utils/api-helpers'

// Verwende die korrekte API-URL für Adressen
const API_URL = '/api/addresses'

export interface Address {
  id: string
  name: string
  street: string
  zipCode: string
  city: string
  coordinates: [number, number] | null
  isVerified: boolean
  isActive: boolean
  reviewStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
  user?: {
    id: string
    email: string
  }
  parentId?: string
  isOfficial?: boolean
  stationId?: string
  type?: 'station' | 'address' | 'custom' | 'temporary'
  isTemporary?: boolean
  isAnonymous?: boolean
  addressType?: 'temporary' | 'permanent'
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  updatedAt?: string
}

export interface CreateAddressData {
  name: string
  street: string
  zipCode: string
  city: string
  coordinates?: [number, number] | null
  isVerified?: boolean
  isActive?: boolean
  reviewStatus?: 'pending' | 'approved' | 'rejected'
  parentId?: string
  isAnonymous?: boolean
  addressType?: 'temporary' | 'permanent'
  userId?: string
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export const adminAddressService = {
  // Alle Adressen abrufen (inklusive anonyme Adressen)
  async getAllAddresses(): Promise<Address[]> {
    try {
      const response = await axios.get(API_URL)
      
      // Sicherheitscheck: Stelle sicher, dass die Antwort JSON ist
      if (!isValidJsonResponse(response.data)) {
        console.warn('⚠️ API gibt ungültige Antwort zurück, verwende leeres Array');
        return [];
      }
      
      // Die API gibt bereits die korrekte Struktur zurück
      const addresses = response.data.addresses || response.data || [];
      
      // Validiere das Array
      return validateAddressesArray(addresses);
    } catch (error) {
      console.error('Fehler beim Laden der Adressen:', error)
      // Fallback: Leeres Array zurückgeben statt Fehler zu werfen
      return [];
    }
  },

  // Neue Adresse erstellen
  async createAddress(addressData: CreateAddressData): Promise<Address> {
    try {
      const response = await axios.post(API_URL, addressData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data.address || response.data
    } catch (error) {
      console.error('Fehler beim Erstellen der Adresse:', error)
      throw error
    }
  },

  // Adresse aktualisieren
  async updateAddress(id: string, addressData: UpdateAddressData): Promise<Address> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, addressData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data.address || response.data
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Adresse:', error)
      throw error
    }
  },

  // Adresse löschen
  async deleteAddress(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`)
    } catch (error) {
      console.error('Fehler beim Löschen der Adresse:', error)
      throw error
    }
  },

  // Adresse genehmigen
  async approveAddress(id: string): Promise<Address> {
    try {
      const response = await axios.put(`${API_URL}/${id}/review`, { 
        action: 'approve'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data.address || response.data
    } catch (error) {
      console.error('Fehler beim Genehmigen der Adresse:', error)
      throw error
    }
  },

  // Adresse ablehnen
  async rejectAddress(id: string, reason?: string): Promise<Address> {
    try {
      const response = await axios.put(`${API_URL}/${id}/review`, { 
        action: 'reject',
        notes: reason
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data.address || response.data
    } catch (error) {
      console.error('Fehler beim Ablehnen der Adresse:', error)
      throw error
    }
  },

  // Ausstehende Adressen abrufen
  async getPendingAddresses(): Promise<Address[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/pending`)
      return response.data || []
    } catch (error) {
      console.error('Fehler beim Laden ausstehender Adressen:', error)
      throw error
    }
  },

  // Unverifizierte Adressen abrufen
  async getUnverifiedAddresses(): Promise<Address[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/unverified`)
      return response.data || []
    } catch (error) {
      console.error('Fehler beim Laden unverifizierter Adressen:', error)
      throw error
    }
  },

  // Adress-Statistiken abrufen
  async getAddressStats(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`)
      
      // Sicherheitscheck: Stelle sicher, dass die Antwort JSON ist
      if (!isValidJsonResponse(response.data)) {
        console.warn('⚠️ API gibt ungültige Antwort zurück, verwende Fallback-Daten');
        return createAddressStatsFallback();
      }
      
      return response.data
    } catch (error) {
      console.error('Fehler beim Laden der Adress-Statistiken:', error)
      
      // Fallback-Daten zurückgeben statt Fehler zu werfen
      return createAddressStatsFallback();
    }
  }
}

export default adminAddressService 
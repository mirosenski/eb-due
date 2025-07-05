import React, { useState, useMemo } from 'react';
import { X, Building2, MapPin, Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { predefinedStations, PredefinedStation, getPredefinedStationsByType, getPredefinedStationsByCity } from '@/data/predefined-stations';
import { Station } from '@/types/station.types';

interface PredefinedStationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStation: (stationData: Omit<Station, 'id'>) => Promise<void>;
  existingStations: Station[];
  isLoading: boolean;
}

export const PredefinedStationsModal: React.FC<PredefinedStationsModalProps> = ({
  isOpen,
  onClose,
  onCreateStation,
  existingStations,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'praesidium' | 'revier'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [creatingStations, setCreatingStations] = useState<Set<string>>(new Set());

  // Verfügbare Städte für Filter
  const availableCities = useMemo(() => {
    const cities = new Set(predefinedStations.map(station => station.city));
    return Array.from(cities).sort();
  }, []);

  // Gefilterte Stationen
  const filteredStations = useMemo(() => {
    let filtered = predefinedStations;

    // Filter nach Typ
    if (selectedType !== 'all') {
      filtered = filtered.filter(station => station.type === selectedType);
    }

    // Filter nach Stadt
    if (selectedCity !== 'all') {
      filtered = filtered.filter(station => station.city === selectedCity);
    }

    // Filter nach Suchbegriff
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(query) ||
        station.city.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query) ||
        station.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedType, selectedCity]);

  // Prüfe, welche Stationen bereits existieren
  const existingStationNames = useMemo(() => {
    return new Set(existingStations.map(station => station.name));
  }, [existingStations]);

  // Station erstellen
  const handleCreateStation = async (predefinedStation: PredefinedStation) => {
    if (existingStationNames.has(predefinedStation.name)) {
      toast.error(`Station "${predefinedStation.name}" existiert bereits`);
      return;
    }

    setCreatingStations(prev => new Set(prev).add(predefinedStation.name));

    try {
      // Für Reviere: Finde das passende Präsidium
      let parentId: string | undefined;
      if (predefinedStation.type === 'revier') {
        const praesidium = existingStations.find(station => 
          station.type === 'praesidium' && 
          station.city === predefinedStation.city
        );
        if (!praesidium) {
          toast.error(`Für "${predefinedStation.name}" muss zuerst das Präsidium in ${predefinedStation.city} erstellt werden`);
          return;
        }
        parentId = praesidium.id;
      }

      const stationData = {
        ...predefinedStation,
        parentId,
        lastModified: new Date().toISOString()
      };

      await onCreateStation(stationData);
      toast.success(`Station "${predefinedStation.name}" erfolgreich erstellt`);
    } catch (error) {
      console.error('Fehler beim Erstellen der Station:', error);
      toast.error(`Fehler beim Erstellen von "${predefinedStation.name}"`);
    } finally {
      setCreatingStations(prev => {
        const newSet = new Set(prev);
        newSet.delete(predefinedStation.name);
        return newSet;
      });
    }
  };

  // Alle Stationen einer Stadt erstellen
  const handleCreateAllStationsForCity = async (city: string) => {
    const cityStations = getPredefinedStationsByCity(city);
    const notExistingStations = cityStations.filter(station => 
      !existingStationNames.has(station.name)
    );

    if (notExistingStations.length === 0) {
      toast.error(`Alle Stationen für ${city} existieren bereits`);
      return;
    }

    // Sortiere Stationen: Präsidien zuerst, dann Reviere
    const sortedStations = notExistingStations.sort((a, b) => {
      if (a.type === 'praesidium' && b.type === 'revier') return -1;
      if (a.type === 'revier' && b.type === 'praesidium') return 1;
      return 0;
    });

    setCreatingStations(prev => new Set([...prev, ...sortedStations.map(s => s.name)]));

    try {
      let createdPraesidiumId: string | undefined;

      for (const station of sortedStations) {
        let parentId: string | undefined;
        
        if (station.type === 'revier') {
          // Verwende das neu erstellte Präsidium oder suche ein existierendes
          const praesidium = existingStations.find(s => 
            s.type === 'praesidium' && s.city === station.city
          ) || (createdPraesidiumId ? { id: createdPraesidiumId } : undefined);
          
          if (!praesidium) {
            toast.error(`Für "${station.name}" muss zuerst das Präsidium in ${station.city} erstellt werden`);
            continue;
          }
          parentId = praesidium.id;
        }

        const stationData = {
          ...station,
          parentId,
          lastModified: new Date().toISOString()
        };

        await onCreateStation(stationData);
        
        // Speichere die ID des erstellten Präsidiums für nachfolgende Reviere
        if (station.type === 'praesidium') {
          // Wir müssen die Stationen neu laden, um die neue ID zu bekommen
          // Das wird durch den Store-Handler gemacht
        }
      }
      toast.success(`${sortedStations.length} Stationen für ${city} erstellt`);
    } catch (error) {
      console.error('Fehler beim Erstellen der Stationen:', error);
      toast.error(`Fehler beim Erstellen der Stationen für ${city}`);
    } finally {
      setCreatingStations(prev => {
        const newSet = new Set(prev);
        sortedStations.forEach(station => newSet.delete(station.name));
        return newSet;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Vordefinierte Stationen
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredStations.length} von {predefinedStations.length} Stationen verfügbar
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Station suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'praesidium' | 'revier')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-colors"
              >
                <option value="all">Alle Typen</option>
                <option value="praesidium">Präsidien</option>
                <option value="revier">Reviere</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-colors"
              >
                <option value="all">Alle Städte</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCity('all');
              }}
              className="px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
            >
              Filter löschen
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredStations.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Keine Stationen gefunden
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Versuchen Sie, die Filter anzupassen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => {
                const isExisting = existingStationNames.has(station.name);
                const isCreating = creatingStations.has(station.name);

                return (
                  <div
                    key={station.name}
                    className={`relative p-4 rounded-xl border transition-all duration-200 ${
                      isExisting
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {isExisting ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Existiert
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Verfügbar
                        </span>
                      )}
                    </div>

                    {/* Station Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className={`w-4 h-4 ${
                          station.type === 'praesidium' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`} />
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          station.type === 'praesidium'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {station.type === 'praesidium' ? 'Präsidium' : 'Revier'}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {station.name}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{station.city}</span>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {station.address}
                      </p>
                      
                      {station.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                          {station.description}
                        </p>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                      <div>📞 {station.telefon}</div>
                      <div>✉️ {station.email}</div>
                      <div>📍 {station.coordinates[0].toFixed(6)}, {station.coordinates[1].toFixed(6)}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isExisting && (
                        <button
                          onClick={() => handleCreateStation(station)}
                          disabled={isCreating || isLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs rounded-lg transition-colors font-medium"
                        >
                          {isCreating ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Erstelle...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              Erstellen
                            </>
                          )}
                        </button>
                      )}
                      
                      {isExisting && (
                        <button
                          disabled
                          className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs rounded-lg font-medium cursor-not-allowed"
                        >
                          Bereits vorhanden
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t dark:border-gray-700 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredStations.filter(s => !existingStationNames.has(s.name)).length} Stationen verfügbar
            </div>
            
            <div className="flex gap-3">
              {/* Bulk Actions */}
              {selectedCity !== 'all' && (
                <button
                  onClick={() => handleCreateAllStationsForCity(selectedCity)}
                  disabled={isLoading || creatingStations.size > 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded-lg transition-colors font-medium"
                >
                  Alle für {selectedCity} erstellen
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
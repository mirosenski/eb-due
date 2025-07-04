import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Building2, AlertTriangle, MapPin, BarChart3, Settings, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAdminStore } from '@/lib/store/admin-store'
import { Station } from '@/types/station.types'
import { FilterState } from './types'
import { LoadingSpinner } from './LoadingSpinner'
import { StationCard } from './StationCard'
import { StationModal } from './StationModal'
import { StationFilters } from './StationFilters'
import { PredefinedStationsModal } from './PredefinedStationsModal'


// ===== MAIN COMPONENT =====
const AdminStationManagement: React.FC = () => {
  const {
    allStations: stations,
    filteredStations,
    isLoading,
    error,
    loadStations,
    addStation,
    updateStation,
    deleteStation,
    setSearchQuery,
    setCityFilter,
    setTypeFilter,
    clearSelection
  } = useAdminStore();

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    type: 'all',
    showInactive: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPredefinedModalOpen, setIsPredefinedModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [expandedPresidia, setExpandedPresidia] = useState<Set<string>>(new Set());


  // Navigation tabs
  const navigationTabs = [
    { id: 'stations', label: 'Stationen', icon: Building2, active: true },
    { id: 'addresses', label: 'Adressen', icon: MapPin, active: false },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
    { id: 'settings', label: 'Einstellungen', icon: Settings, active: false }
  ];

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Filter stations based on search
  const debouncedSearch = useDebounce(filters.search, 300);
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Filter stations based on city
  useEffect(() => {
    setCityFilter(filters.city);
  }, [filters.city, setCityFilter]);

  // Filter stations based on type
  useEffect(() => {
    setTypeFilter(filters.type === 'all' ? 'all' : filters.type);
  }, [filters.type, setTypeFilter]);

  // Get all cities for filter dropdown
  const allCities = useMemo(() => {
    const cities = new Set(Array.isArray(stations) ? stations.map(s => s.city) : []);
    return Array.from(cities).sort();
  }, [stations]);

  // Get available Präsidien for parent selection
  const availablePraesidien = useMemo(() => {
    return Array.isArray(stations) ? stations.filter(s => s.type === 'praesidium' && s.isActive) : [];
  }, [stations]);

  // Get Reviere for a specific Präsidium
  const getReviere = useCallback((praesidiumId: string) => {
    return Array.isArray(stations) ? stations.filter(s => s.type === 'revier' && s.parentId === praesidiumId) : [];
  }, [stations]);

  // Handle filter changes
  const handleFilterChange = useCallback((field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      city: '',
      type: 'all',
      showInactive: false
    });
  }, []);

  // Handle station creation
  const handleCreateStation = useCallback(() => {
    setEditingStation(null);
    setIsModalOpen(true);
  }, []);

  // Handle predefined stations modal
  const handleOpenPredefinedStations = useCallback(() => {
    setIsPredefinedModalOpen(true);
  }, []);

  const handleClosePredefinedStations = useCallback(() => {
    setIsPredefinedModalOpen(false);
  }, []);

  // Handle station editing
  const handleEditStation = useCallback((station: Station) => {
    setEditingStation(station);
    setIsModalOpen(true);
  }, []);

  // Handle station deletion
  const handleDeleteStation = useCallback(async (id: string) => {
    try {
      await deleteStation(id);
      toast.success('Station erfolgreich gelöscht');
    } catch (err) {
      console.error('❌ Fehler beim Löschen:', err);
      toast.error('Fehler beim Löschen der Station');
    }
  }, [deleteStation]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingStation(null);
  }, []);

  // Handle station save
  const handleSaveStation = useCallback(async (formData: any) => {
    try {
      if (editingStation) {
        await updateStation(editingStation.id, formData);
      } else {
        await addStation(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error('❌ Fehler beim Speichern:', err);
      throw err;
    }
  }, [editingStation, updateStation, addStation, handleCloseModal]);

  // Toggle Präsidium expansion
  const togglePraesidiumExpansion = useCallback((praesidiumId: string) => {
    setExpandedPresidia(prev => {
      const newSet = new Set(prev);
      if (newSet.has(praesidiumId)) {
        newSet.delete(praesidiumId);
      } else {
        newSet.add(praesidiumId);
      }
      return newSet;
    });
  }, []);



  // Loading State
  if (isLoading && stations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Stationen werden geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && stations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fehler beim Laden
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(filters.search || filters.city || filters.type !== 'all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Stationen verwalten
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredStations.length} von {stations.length} Stationen
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showInactive}
                  onChange={(e) => handleFilterChange('showInactive', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span>Inaktive anzeigen</span>
              </label>
              
              <button
                onClick={handleOpenPredefinedStations}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Database className="w-5 h-5" />
                <span className="font-medium">Vordefinierte Stationen</span>
              </button>
              
              <button
                onClick={handleCreateStation}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Neue Station</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StationFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          allCities={allCities}
          hasActiveFilters={hasActiveFilters}
          filteredStationsCount={filteredStations.length}
        />
      </div>

      {/* Station Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {stations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-20 h-20 mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Keine Stationen gefunden
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? 'Versuchen Sie, die Filter anzupassen oder zu löschen.' 
                : 'Erstellen Sie Ihre erste Station.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Filter löschen
              </button>
            ) : (
              <button
                onClick={handleCreateStation}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Erste Station erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Zeige alle Präsidien an */}
            {Array.isArray(stations) && stations
              .filter(s => s.type === 'praesidium')
              .map((praesidium) => {
                const allReviere = getReviere(praesidium.id);
                return (
                  <div key={praesidium.id} className="animate-in fade-in-50 duration-200">
                    <StationCard
                      station={praesidium}
                      onEdit={handleEditStation}
                      onDelete={handleDeleteStation}
                      isExpanded={expandedPresidia.has(praesidium.id)}
                      onToggle={() => togglePraesidiumExpansion(praesidium.id)}
                    >
                      {expandedPresidia.has(praesidium.id) && Array.isArray(allReviere) && allReviere.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Reviere ({allReviere.length})
                            </h4>
                            {allReviere.map((revier) => (
                              <StationCard
                                key={revier.id}
                                station={revier}
                                onEdit={handleEditStation}
                                onDelete={handleDeleteStation}
                                isExpanded={false}
                                onToggle={() => {}}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </StationCard>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal */}
      <StationModal
        station={editingStation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStation}
        isLoading={isLoading}
        error={error}
        availablePraesidien={availablePraesidien}
      />

      <PredefinedStationsModal
        isOpen={isPredefinedModalOpen}
        onClose={handleClosePredefinedStations}
        onCreateStation={addStation}
        existingStations={stations}
        isLoading={isLoading}
      />
    </div>
  );
};

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default AdminStationManagement; 
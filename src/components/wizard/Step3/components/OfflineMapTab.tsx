import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import OfflineMapComponent from '@/components/map/OfflineMapComponent';
import { OfflineMapTabProps } from '../types';

const OfflineMapTab: React.FC<OfflineMapTabProps> = ({ routeResults, startAddress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <WifiOff className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Offline-Kartenfunktionen für Baden-Württemberg
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
              Diese Karte bietet erweiterte Offline-Funktionen speziell für den Einsatz in Baden-Württemberg. 
              Alle Kartendaten, Routing-Profile und NBAN-Zonen sind lokal verfügbar.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800 dark:text-blue-200">Offline-Kacheln</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800 dark:text-blue-200">Lokales Routing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800 dark:text-blue-200">NBAN-Zonen</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-blue-800 dark:text-blue-200">Einsatz-Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OfflineMapComponent
        routeResults={routeResults || []}
        startAddress={startAddress?.fullAddress || ''}
        startCoordinates={startAddress?.coordinates || { lat: 0, lng: 0 }}
        showOfflineControls={true}
        onRouteRecalculate={(routeId, profile) => {
          // Hier würde die Route mit dem neuen Profil neu berechnet
          console.log(`Recalculating route ${routeId} with profile ${profile}`);
          // In einer echten Implementierung würden hier die Routen-Daten aktualisiert
        }}
      />
    </motion.div>
  );
};

export default OfflineMapTab; 
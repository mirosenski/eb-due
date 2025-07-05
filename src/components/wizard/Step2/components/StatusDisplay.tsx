import React from 'react';
import { motion } from 'framer-motion';
import { Target, Building, Users, MapPin } from 'lucide-react';

interface StatusDisplayProps {
  totalSelected: number;
  selectedPraesidien: any[];
  selectedReviere: any[];
  selectedCustomCount: number;
  praesidiumWithReviere: any[];
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  totalSelected,
  selectedPraesidien,
  selectedReviere,
  selectedCustomCount,
  praesidiumWithReviere
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8 border border-blue-200/50 dark:border-blue-800/50"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Hauptstatus */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            {totalSelected > 0 && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                {totalSelected}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSelected === 0 ? 'Keine Ziele ausgewählt' : `${totalSelected} Ziele ausgewählt`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {totalSelected === 0 
                ? 'Wählen Sie Polizeistationen oder eigene Adressen aus' 
                : 'Bereit für die Routenberechnung'
              }
            </p>
          </div>
        </div>

        {/* Detaillierte Statistiken */}
        {totalSelected > 0 && (
          <div className="flex flex-wrap gap-4">
            {selectedPraesidien.length > 0 && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedPraesidien.length} Präsidien
                </span>
              </div>
            )}
            {selectedReviere.length > 0 && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedReviere.length} Reviere
                </span>
              </div>
            )}
            {selectedCustomCount > 0 && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedCustomCount} Eigene Adressen
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fortschrittsbalken */}
      {totalSelected > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Auswahl-Fortschritt</span>
            <span>{totalSelected} von {praesidiumWithReviere.length + selectedCustomCount} möglichen Zielen</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSelected / (praesidiumWithReviere.length + selectedCustomCount)) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatusDisplay; 
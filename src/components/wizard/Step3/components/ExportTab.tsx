import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Copy, CheckCircle } from 'lucide-react';
import { ExportTabProps } from '../types';

const ExportTab: React.FC<ExportTabProps> = ({
  results,
  exportFormat,
  setExportFormat,
  onExport,
  onCopyToClipboard
}) => {
  const exportFormats = [
    {
      id: 'excel' as const,
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Professionelle Tabellenkalkulation mit Metadaten',
      color: 'text-green-600'
    },
    {
      id: 'pdf' as const,
      label: 'PDF (.pdf)',
      icon: FileText,
      description: 'Druckfreundliches Dokument',
      color: 'text-red-600'
    },
    {
      id: 'csv' as const,
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Einfache Textdatei für weitere Verarbeitung',
      color: 'text-blue-600'
    }
  ];

  const totalDistance = results.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalFuel = results.reduce((sum, r) => sum + r.estimatedFuel, 0);
  const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Export-Format Auswahl */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Export-Format wählen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            const isSelected = exportFormat === format.id;
            
            return (
              <motion.button
                key={format.id}
                onClick={() => setExportFormat(format.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-purple-100 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`h-6 w-6 ${format.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {format.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format.description}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-purple-600 ml-auto" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Export-Aktionen */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Export-Aktionen
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={onExport}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-5 w-5" />
            <span>Export starten</span>
          </motion.button>
          
          <motion.button
            onClick={onCopyToClipboard}
            className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="h-5 w-5" />
            <span>In Zwischenablage kopieren</span>
          </motion.button>
        </div>
      </div>

      {/* Export-Vorschau */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Export-Vorschau
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {results.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Routen
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {totalDistance.toFixed(1)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                km Gesamt
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {totalDuration}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                min Gesamt
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {totalCost.toFixed(2)}€
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Kosten Gesamt
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export-Informationen */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Export-Informationen
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• Alle Routendaten werden exportiert</p>
          <p>• Metadaten und Zeitstempel werden hinzugefügt</p>
          <p>• Dateiname: Polizei_Routen_[Datum].[Format]</p>
          <p>• Export erfolgt automatisch in den Download-Ordner</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExportTab; 
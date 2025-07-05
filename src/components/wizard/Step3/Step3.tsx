import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useStep3Logic } from './hooks/useStep3Logic';
import TabNavigation from './components/TabNavigation';
import CalculationStatus from './components/CalculationStatus';
import SummaryTab from './components/SummaryTab';
import MapTab from './components/MapTab';
import OfflineMapTab from './components/OfflineMapTab';
import TableTab from './components/TableTab';
import ExportTab from './components/ExportTab';
import NoSelectionWarning from './components/NoSelectionWarning';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';

const Step3: React.FC = () => {
  const { selectedStations, selectedCustomAddresses } = useWizardStore();
  const { wizard: { startAddress } } = useAppStore();

  const {
    routeResults,
    isCalculating,
    exportFormat,
    activeTab,
    tabs,
    startAddress: hookStartAddress,
    setExportFormat,
    setActiveTab,
    exportToExcel,
    exportToPDF,
    exportToCSV,
    copyToClipboard,
    getExportHandler
  } = useStep3Logic();

  // Prüfe ob Daten für Step3 verfügbar sind
  if (!startAddress || (!selectedStations?.length && !selectedCustomAddresses?.length)) {
    return <NoSelectionWarning />;
  }

  const results = routeResults || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab results={results} startAddress={startAddress} />;
      case 'map':
        return <MapTab routeResults={routeResults} startAddress={startAddress} />;
      case 'offline-map':
        return <OfflineMapTab routeResults={routeResults} startAddress={startAddress} />;
      case 'table':
        return <TableTab results={results} />;
      case 'export':
        return (
          <ExportTab
            results={results}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            onExport={getExportHandler()}
            onCopyToClipboard={copyToClipboard}
          />
        );
      default:
        return <SummaryTab results={results} startAddress={startAddress} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-2xl shadow-lg">
            <Download className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Export & Ergebnisse
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ihre Routenergebnisse sind bereit zum Export
            </p>
          </div>
        </div>
      </motion.div>

      {/* Calculation Status */}
      <CalculationStatus isCalculating={isCalculating} />

      {/* Tab Navigation und Content */}
      {routeResults && (
        <>
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
          />

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="min-h-[600px]"
          >
            {renderTabContent()}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Step3; 
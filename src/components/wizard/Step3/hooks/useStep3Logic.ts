import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Copy, Clock, MapPin, Route, Zap, BarChart3, Map, Table, Wifi, WifiOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore, RouteResult } from '@/lib/store/app-store';
import { useStationStore } from '@/store/useStationStore';
import { routingService } from '@/lib/services/routing-service';
import { Station as StationType } from '@/types/station.types';
import { Station as AppStoreStation } from '@/lib/store/app-store';
import { Tab } from '../types';

// Hilfsfunktion zur Konvertierung zwischen Station-Typen
const convertStationType = (station: StationType): AppStoreStation => {
  return {
    id: station.id,
    name: station.name,
    address: station.address,
    coordinates: {
      lat: station.coordinates[0],
      lng: station.coordinates[1]
    },
    phone: station.telefon,
    email: '', // Nicht verfügbar in station.types.ts
    type: station.type === 'praesidium' ? 'Präsidium' : 'Revier',
    city: station.city,
    district: '', // Nicht verfügbar in station.types.ts
    openingHours: '', // Nicht verfügbar in station.types.ts
    emergency24h: station.notdienst24h
  };
};

export const useStep3Logic = () => {
  const { selectedStations, selectedCustomAddresses } = useWizardStore();
  const { wizard: { startAddress }, customAddresses } = useAppStore();
  const { stations } = useStationStore();

  const [routeResults, setRouteResults] = useState<RouteResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [activeTab, setActiveTab] = useState('summary');

  const tabs: Tab[] = [
    { id: 'summary', label: 'Zusammenfassung', icon: BarChart3 },
    { id: 'map', label: 'Interaktive Karte', icon: Map },
    { id: 'offline-map', label: 'Offline-Karte', icon: WifiOff },
    { id: 'table', label: 'Detaillierte Tabelle', icon: Table },
    { id: 'export', label: 'Export-Optionen', icon: Download }
  ];

  useEffect(() => {
    const calculateRoutes = async () => {
      if (!startAddress || (!selectedStations?.length && !selectedCustomAddresses?.length)) {
        setRouteResults(null);
        return;
      }

      setIsCalculating(true);
      try {
        // Konvertiere Stationen in den erwarteten Typ
        const convertedStations = stations.map(convertStationType);
        
        const routes = await routingService.calculateMultipleRoutes(
          startAddress,
          selectedStations || [],
          selectedCustomAddresses || [],
          convertedStations,
          customAddresses || []
        );

        setRouteResults(routes as unknown as RouteResult[]);
        toast.success('Routenberechnung abgeschlossen!');
      } catch (error) {
        console.error('Routenberechnung fehlgeschlagen:', error);
        toast.error('Fehler bei der Routenberechnung');
        setRouteResults(null);
      } finally {
        setIsCalculating(false);
      }
    };

    if (startAddress && (selectedStations?.length || selectedCustomAddresses?.length)) {
      void calculateRoutes();
    }
  }, [startAddress, selectedStations, selectedCustomAddresses, customAddresses, stations]);

  const exportToExcel = () => {
    if (!routeResults) return;

    const workbook = XLSX.utils.book_new();
    
    // Hauptdaten-Arbeitsblatt
    const worksheetData = [
      ['POLIZEI BADEN-WÜRTTEMBERG'],
      ['ROUTENANALYSE - EB-DUE'],
      ['Exportiert am: ' + new Date().toLocaleString('de-DE')],
      [''],
      ['Ziel', 'Typ', 'Adresse', 'Entfernung (km)', 'Fahrzeit (min)', 'Kraftstoff (L)', 'Kosten (€)', 'Route-Typ'],
      ...(routeResults).map(result => [
        result.destinationName,
        result.destinationType === 'station' ? 'Polizeistation' : 'Eigene Adresse',
        result.address,
        result.distance,
        result.duration,
        result.estimatedFuel,
        result.estimatedCost,
        result.routeType
      ]),
      [''],
      ['ZUSAMMENFASSUNG'],
      ['Gesamtanzahl Ziele:', routeResults.length],
      ['Gesamtentfernung (km):', routeResults.reduce((sum, r) => sum + r.distance, 0).toFixed(1)],
      ['Gesamtfahrzeit (min):', routeResults.reduce((sum, r) => sum + r.duration, 0)],
      ['Gesamtkraftstoff (L):', routeResults.reduce((sum, r) => sum + r.estimatedFuel, 0).toFixed(1)],
      ['Gesamtkosten (€):', routeResults.reduce((sum, r) => sum + r.estimatedCost, 0).toFixed(2)]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Spaltenbreiten setzen
    worksheet['!cols'] = [
      { width: 35 }, // Ziel
      { width: 15 }, // Typ
      { width: 40 }, // Adresse
      { width: 15 }, // Entfernung
      { width: 15 }, // Fahrzeit
      { width: 15 }, // Kraftstoff
      { width: 12 }, // Kosten
      { width: 15 }  // Route-Typ
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Routenanalyse');
    
    // Zusätzliches Arbeitsblatt mit Metadaten
    const metaData = [
      ['METADATEN'],
      [''],
      ['Export-Information'],
      ['Anwendung:', 'eb-due v2.0'],
      ['Organisation:', 'Polizei Baden-Württemberg'],
      ['Export-Datum:', new Date().toLocaleString('de-DE')],
      ['Anzahl Routen:', routeResults.length],
      [''],
      ['Routing-Parameter'],
      ['Provider:', 'OSRM, Valhalla, GraphHopper'],
      ['Optimierung:', 'Multi-Provider Fallback'],
      ['Kraftstoffpreis:', '1.75 €/L (Durchschnitt)'],
      ['Verbrauch:', '9.5 L/100km (Annahme)']
    ];

    const metaWorksheet = XLSX.utils.aoa_to_sheet(metaData);
    metaWorksheet['!cols'] = [{ width: 20 }, { width: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, metaWorksheet, 'Metadaten');
    
    // Datei speichern
    const fileName = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Excel-Datei erfolgreich exportiert!');
  };

  const exportToPDF = () => {
    if (!routeResults) return;

    // Vereinfachter PDF-Export (in production würde hier jsPDF oder ähnliches verwendet)
    const content = routeResults.map(result =>
      `${result.destinationName} | ${result.address} | ${result.distance}km | ${result.duration}min`
    ).join('\n');
    
    const blob = new Blob([
      'POLIZEI BADEN-WÜRTTEMBERG - ROUTENANALYSE\n',
      '=====================================\n\n',
      content,
      '\n\nExportiert am: ' + new Date().toLocaleString('de-DE')
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('PDF-Datei erfolgreich exportiert!');
  };

  const exportToCSV = () => {
    if (!routeResults) return;

    const csvContent = [
      'Ziel,Typ,Adresse,Entfernung (km),Fahrzeit (min),Kraftstoff (L),Kosten (€),Route-Typ',
      ...routeResults.map(result => 
        `"${result.destinationName}","${result.destinationType === 'station' ? 'Polizeistation' : 'Eigene Adresse'}","${result.address}",${result.distance},${result.duration},${result.estimatedFuel},${result.estimatedCost},"${result.routeType}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Polizei_Routen_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('CSV-Datei erfolgreich exportiert!');
  };

  const copyToClipboard = () => {
    if (!routeResults) return;

    const content = routeResults.map(result =>
      `${result.destinationName}: ${result.address} - ${result.distance}km, ${result.duration}min`
    ).join('\n');
    
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Daten in Zwischenablage kopiert!');
    }).catch(() => {
      toast.error('Fehler beim Kopieren');
    });
  };

  const getExportHandler = () => {
    switch (exportFormat) {
      case 'excel':
        return exportToExcel;
      case 'pdf':
        return exportToPDF;
      case 'csv':
        return exportToCSV;
      default:
        return exportToExcel;
    }
  };

  return {
    // States
    routeResults,
    isCalculating,
    exportFormat,
    activeTab,
    tabs,
    startAddress,
    
    // Functions
    setExportFormat,
    setActiveTab,
    exportToExcel,
    exportToPDF,
    exportToCSV,
    copyToClipboard,
    getExportHandler
  };
}; 
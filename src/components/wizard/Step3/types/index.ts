import { RouteResult } from '@/lib/store/app-store';

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export interface ExportFormat {
  id: 'excel' | 'pdf' | 'csv';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

export interface Step3Props {
  // Wird von der Hauptkomponente verwendet
}

export interface SummaryTabProps {
  results: RouteResult[];
  startAddress: any;
}

export interface MapTabProps {
  routeResults: RouteResult[] | null;
  startAddress: any;
}

export interface OfflineMapTabProps {
  routeResults: RouteResult[] | null;
  startAddress: any;
}

export interface TableTabProps {
  results: RouteResult[];
}

export interface ExportTabProps {
  results: RouteResult[];
  exportFormat: 'excel' | 'pdf' | 'csv';
  setExportFormat: (format: 'excel' | 'pdf' | 'csv') => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
}

export interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Tab[];
}

export interface CalculationStatusProps {
  isCalculating: boolean;
}

export interface RouteSummaryProps {
  results: RouteResult[];
}

export interface ExportOptionsProps {
  exportFormat: 'excel' | 'pdf' | 'csv';
  setExportFormat: (format: 'excel' | 'pdf' | 'csv') => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
} 
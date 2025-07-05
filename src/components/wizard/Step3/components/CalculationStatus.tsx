import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { CalculationStatusProps } from '../types';

const CalculationStatus: React.FC<CalculationStatusProps> = ({ isCalculating }) => {
  if (!isCalculating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl text-center"
    >
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
      <h3 className="text-2xl font-bold mb-2">Routenberechnung läuft...</h3>
      <p className="text-blue-100">
        Multi-Provider Routing wird durchgeführt (OSRM, Valhalla, GraphHopper)
      </p>
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Geschätzte Zeit: 3-5 Sekunden</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>Optimale Routen werden berechnet</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CalculationStatus; 
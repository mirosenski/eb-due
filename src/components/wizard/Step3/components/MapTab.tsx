import React from 'react';
import { motion } from 'framer-motion';
import InteractiveMap from '@/components/map/InteractiveMap';
import { MapTabProps } from '../types';

const MapTab: React.FC<MapTabProps> = ({ routeResults, startAddress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <InteractiveMap
        routeResults={routeResults || []}
        startAddress={startAddress?.fullAddress || ''}
        startCoordinates={startAddress?.coordinates || { lat: 0, lng: 0 }}
      />
    </motion.div>
  );
};

export default MapTab; 
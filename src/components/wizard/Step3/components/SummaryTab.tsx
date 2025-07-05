import React from 'react';
import { motion } from 'framer-motion';
import { Route, MapPin, Clock, Zap, DollarSign, Fuel } from 'lucide-react';
import { SummaryTabProps } from '../types';

const SummaryTab: React.FC<SummaryTabProps> = ({ results, startAddress }) => {
  const totalDistance = results.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalFuel = results.reduce((sum, r) => sum + r.estimatedFuel, 0);
  const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);

  const stats = [
    {
      label: 'Gesamtentfernung',
      value: `${totalDistance.toFixed(1)} km`,
      icon: Route,
      color: 'text-blue-600'
    },
    {
      label: 'Gesamtfahrzeit',
      value: `${totalDuration} min`,
      icon: Clock,
      color: 'text-green-600'
    },
    {
      label: 'Gesamtkraftstoff',
      value: `${totalFuel.toFixed(1)} L`,
      icon: Fuel,
      color: 'text-orange-600'
    },
    {
      label: 'Gesamtkosten',
      value: `${totalCost.toFixed(2)} €`,
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Startpunkt */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Startpunkt
        </h3>
        <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <MapPin className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {startAddress?.fullAddress || 'Startadresse'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ausgangspunkt für alle Routen
            </p>
          </div>
        </div>
      </div>

      {/* Statistiken */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Routenübersicht
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-600 shadow-sm`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Routenübersicht
        </h3>
        <div className="space-y-3">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: result.color }}
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.destinationName}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {result.address}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.distance.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {result.duration} min
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryTab; 
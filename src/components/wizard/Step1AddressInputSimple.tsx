import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'react-hot-toast';

const Step1AddressInputSimple: React.FC = () => {
  const [address, setAddress] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { setStartAddress, setWizardStep, setSelectedStations, setSelectedCustomAddresses, wizard } = useAppStore();

  // Echte Geocoding-Funktion
  const geocodeAddress = async (inputAddress: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Verwende Nominatim für Geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputAddress)}&format=json&limit=1&countrycodes=de&bounded=1&viewbox=7.5,47.5,10.5,50.0`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service nicht verfügbar');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSubmit = async (inputAddress: string) => {
    if (!inputAddress.trim()) {
      toast.error('Bitte geben Sie eine Adresse ein');
      return;
    }

    setIsGeocoding(true);

    try {
      // Versuche echte Geocoding
      let coordinates = await geocodeAddress(inputAddress);
      
      if (!coordinates) {
        // Fallback: Verwende Stuttgart-Zentrum mit kleiner Abweichung
        toast.error('Adresse konnte nicht genau geocodiert werden. Verwende Näherung.');
        coordinates = {
          lat: 48.7758 + (Math.random() - 0.5) * 0.01, // Kleinere Abweichung
          lng: 9.1829 + (Math.random() - 0.5) * 0.01
        };
      }

      // Extrahiere Straße und Stadt aus der Eingabe
      const addressParts = inputAddress.split(',').map(part => part.trim());
      const street = addressParts[0] || inputAddress;
      const city = addressParts[1] || 'Stuttgart';
      const zipCode = addressParts[2] || '70173';

      const addressData = {
        street,
        houseNumber: '',
        zipCode,
        city,
        fullAddress: inputAddress,
        coordinates,
        accuracy: coordinates ? 95 : 50
      };

      setStartAddress(addressData);
      
      // Reset-Auswahl vor dem Wechsel zu Schritt 2
      setSelectedStations([]);
      setSelectedCustomAddresses([]);
      console.log('🔄 Step1: Auswahl vor Schritt 2 zurückgesetzt');
      
      toast.success('Adresse erfolgreich geocodiert!');
      
      // Sofort zu Schritt 2 weiterleiten
      setWizardStep(2);
    } catch (error) {
      console.error('Fehler beim Geocoding:', error);
      toast.error('Fehler beim Geocoding der Adresse');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(address);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(address);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
      {/* Main Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-light text-gray-900 dark:text-white">
            Wo möchten Sie starten?
          </h2>
        </motion.div>

        {/* Search Input */}
        <form onSubmit={handleFormSubmit}>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-0 transition-opacity duration-500 ${
              isFocused ? 'opacity-20 dark:opacity-30' : ''
            }`} />

            {/* Input Container */}
            <div className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 ${
              isFocused 
                ? 'border-gray-300 dark:border-gray-600 shadow-2xl' 
                : 'border-gray-200 dark:border-gray-800 shadow-sm'
            }`}>
              <div className="relative flex items-center">
                {/* Icon */}
                <div className="absolute left-6 pointer-events-none">
                  <motion.div
                    animate={{ rotate: isFocused ? 360 : 0 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Adresse, PLZ oder Ort"
                  className="w-full pl-14 pr-32 py-5 bg-transparent text-lg font-light text-gray-900 dark:text-white 
                           placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none rounded-2xl"
                  autoComplete="off"
                  spellCheck="false"
                />

                {/* Submit Button */}
                <div className="absolute right-2">
                  <motion.button
                    type="submit"
                    disabled={!address.trim() || isGeocoding}
                    whileHover={{ scale: address.trim() && !isGeocoding ? 1.05 : 1 }}
                    whileTap={{ scale: address.trim() && !isGeocoding ? 0.95 : 1 }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                      address.trim() && !isGeocoding
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isGeocoding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span className="text-sm">Suche...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">Weiter</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </form>

        {/* Example Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400 text-center"
        >
          <span>z.B. Königstraße 1, Stuttgart</span>
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {wizard.startAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mt-8"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 
                          border border-green-200 dark:border-green-800/30 rounded-2xl p-5">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,green_1px,transparent_1px)] [background-size:20px_20px]" />
              </div>
              
              <div className="relative flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-0.5">
                    Startpunkt festgelegt
                  </h3>
                  <p className="text-green-800 dark:text-green-400 font-light">
                    {wizard.startAddress.fullAddress}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                    <p className="text-xs text-green-600 dark:text-green-500 font-mono">
                      {wizard.startAddress.coordinates.lat.toFixed(6)}° N, {wizard.startAddress.coordinates.lng.toFixed(6)}° E
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step1AddressInputSimple;
import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'react-hot-toast';
import { AddressData } from '../types';

export const useStep1Logic = () => {
  const [address, setAddress] = useState('');
  const { setStartAddress, setWizardStep, setSelectedStations, setSelectedCustomAddresses, wizard } = useAppStore();

  const handleSubmit = (inputAddress: string) => {
    if (!inputAddress.trim()) {
      toast.error('Bitte geben Sie eine Adresse ein');
      return;
    }

    // Simuliere sofortige Geocoding-Ergebnisse (für Demo-Zwecke)
    const coordinates = {
      lat: 48.7758 + (Math.random() - 0.5) * 0.1,
      lng: 9.1829 + (Math.random() - 0.5) * 0.1
    };

    const addressData: AddressData = {
      street: inputAddress.split(',')[0] || inputAddress,
      houseNumber: '',
      zipCode: '70173',
      city: 'Stuttgart',
      fullAddress: inputAddress,
      coordinates,
      accuracy: 95
    };

    setStartAddress(addressData);
    
    // Reset-Auswahl vor dem Wechsel zu Schritt 2
    setSelectedStations([]);
    setSelectedCustomAddresses([]);
    console.log('🔄 Step1: Auswahl vor Schritt 2 zurückgesetzt');
    
    toast.success('Adresse erfolgreich geocodiert!');
    
    // Sofort zu Schritt 2 weiterleiten
    setWizardStep(2);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(address);
  };

  return {
    // States
    address,
    startAddress: wizard.startAddress,
    
    // Functions
    setAddress,
    handleSubmit,
    handleFormSubmit
  };
}; 
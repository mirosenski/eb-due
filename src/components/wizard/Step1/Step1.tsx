import React from 'react';
import { useStep1Logic } from './hooks/useStep1Logic';
import AddressHeader from './components/AddressHeader';
import AddressForm from './components/AddressForm';
import CurrentAddressDisplay from './components/CurrentAddressDisplay';

const Step1: React.FC = () => {
  const {
    address,
    startAddress,
    setAddress,
    handleSubmit
  } = useStep1Logic();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <AddressHeader />

      {/* Address Input Form */}
      <AddressForm
        address={address}
        setAddress={setAddress}
        onSubmit={handleSubmit}
      />

      {/* Current Address Display */}
      <CurrentAddressDisplay startAddress={startAddress} />
    </div>
  );
};

export default Step1; 
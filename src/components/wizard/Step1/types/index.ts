export interface Step1Props {
  // Wird von der Hauptkomponente verwendet
}

export interface AddressInputProps {
  address: string;
  setAddress: (address: string) => void;
  onSubmit: (address: string) => void;
}

export interface AddressHeaderProps {
  // Header-Komponente benötigt keine Props
}

export interface AddressFormProps {
  address: string;
  setAddress: (address: string) => void;
  onSubmit: (address: string) => void;
}

export interface CurrentAddressDisplayProps {
  startAddress: any;
}

export interface AddressData {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy: number;
} 
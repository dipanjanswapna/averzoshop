
export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  district: string;
  area: string;
  streetAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

    
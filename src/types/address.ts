
export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  streetAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

    
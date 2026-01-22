
export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other' | 'Warehouse';
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

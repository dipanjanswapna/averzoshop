export type Outlet = {
  id: string;
  name: string;
  location: {
      address: string;
      lat: number;
      lng: number;
  };
  status: 'Active' | 'Inactive';
  managerId?: string;
  createdAt?: any;
}

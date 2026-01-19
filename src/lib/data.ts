
import { PlaceHolderImages } from './placeholder-images';

// This file is now mostly for static configuration data like categories
// and potentially some placeholder content that isn't dependent on the database.
// All dynamic data like products, orders, etc., is now fetched from Firestore.


export const subBrands = [
  { id: 'sb_1', name: 'Aura Men', description: 'Modern apparel for men.' },
  { id: 'sb_2', name: 'Aura Women', description: 'Elegant and stylish women\'s fashion.' },
  { id: 'sb_3', name: 'Aura Kids', description: 'Fun and comfortable clothing for children.' },
];

// Mock delivery data for AI simulation, can be removed if a live delivery system is built.
export const activeDeliveries = [
  {
    deliveryId: 'DEL-101',
    expectedDeliveryTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
    currentStatus: 'enRoute',
    customerId: 'CUST-001',
  },
  {
    deliveryId: 'DEL-102',
    expectedDeliveryTime: new Date(new Date().getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour late
    currentStatus: 'stuckInTraffic',
    customerId: 'CUST-002',
  },
  {
    deliveryId: 'DEL-103',
    expectedDeliveryTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString(),
    currentStatus: 'atWarehouse',
    customerId: 'CUST-003',
  },
  {
    deliveryId: 'DEL-104',
    expectedDeliveryTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString(),
    currentStatus: 'processing',
    customerId: 'CUST-004',
  },
];

export { categoriesData } from './categories';

    
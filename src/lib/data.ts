import { PlaceHolderImages } from './placeholder-images';

export const products = [
  {
    id: 'prod_1',
    name: 'Classic Cotton T-Shirt',
    category: 'Men',
    group: 'Topwear',
    subcategory: 'T-Shirts',
    price: 29.99,
    stock: 150,
    image: PlaceHolderImages.find(p => p.id === 'product-1')?.imageUrl,
  },
  {
    id: 'prod_2',
    name: 'Slim-Fit Denim Jeans',
    category: 'Men',
    group: 'Bottomwear',
    subcategory: 'Jeans',
    price: 89.99,
    stock: 80,
    image: PlaceHolderImages.find(p => p.id === 'product-2')?.imageUrl,
  },
  {
    id: 'prod_3',
    name: 'Floral Summer Dress',
    category: 'Women',
    group: 'Dresses',
    subcategory: 'Maxi Dress',
    price: 120.0,
    stock: 60,
    image: PlaceHolderImages.find(p => p.id === 'product-3')?.imageUrl,
  },
  {
    id: 'prod_4',
    name: 'Urban Runner Sneakers',
    category: 'Unisex',
    group: 'Footwear',
    subcategory: 'Sneakers',
    price: 150.0,
    stock: 120,
    image: PlaceHolderImages.find(p => p.id === 'product-4')?.imageUrl,
  },
  {
    id: 'prod_5',
    name: 'Vintage Leather Handbag',
    category: 'Women',
    group: 'Accessories',
    subcategory: 'Bags',
    price: 250.0,
    stock: 40,
    image: PlaceHolderImages.find(p => p.id === 'product-5')?.imageUrl,
  },
  {
    id: 'prod_6',
    name: "Dino Adventure Jacket",
    category: 'Kids',
    group: 'Outerwear',
    subcategory: 'Jackets',
    price: 59.99,
    stock: 90,
    image: PlaceHolderImages.find(p => p.id === 'product-6')?.imageUrl,
  },
];

export const orders = [
  {
    id: 'ORD-001',
    customer: 'Liam Johnson',
    email: 'liam@example.com',
    status: 'Delivered',
    date: '2023-06-23',
    total: 250.0,
  },
  {
    id: 'ORD-002',
    customer: 'Olivia Smith',
    email: 'olivia@example.com',
    status: 'Shipped',
    date: '2023-06-24',
    total: 150.0,
  },
  {
    id: 'ORD-003',
    customer: 'Noah Williams',
    email: 'noah@example.com',
    status: 'Pending',
    date: '2023-06-25',
    total: 350.0,
  },
  {
    id: 'ORD-004',
    customer: 'Emma Brown',
    email: 'emma@example.com',
    status: 'Delivered',
    date: '2023-06-26',
    total: 450.0,
  },
  {
    id: 'ORD-005',
    customer: 'Ava Jones',
    email: 'ava@example.com',
    status: 'Canceled',
    date: '2023-06-27',
    total: 550.0,
  },
];

export const users = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    role: "Admin",
    lastLogin: "2 hours ago",
    image: PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl,
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    role: "Customer",
    lastLogin: "1 day ago",
    image: PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageUrl,
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    role: "Vendor",
    lastLogin: "5 hours ago",
    image: PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageUrl,
  },
    {
    name: "William Kim",
    email: "will@email.com",
    role: "Customer",
    lastLogin: "3 days ago",
    image: "https://picsum.photos/seed/avatar4/100/100",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    role: "Rider",
    lastLogin: "30 minutes ago",
    image: "https://picsum.photos/seed/avatar5/100/100",
  },
];

export const subBrands = [
  { id: 'sb_1', name: 'Aura Men', description: 'Modern apparel for men.' },
  { id: 'sb_2', name: 'Aura Women', description: 'Elegant and stylish women\'s fashion.' },
  { id: 'sb_3', name: 'Aura Kids', description: 'Fun and comfortable clothing for children.' },
];

export const vendors = [
    { id: 'ven_1', name: 'Fashion Forward Inc.', contact: 'contact@ffi.com', status: 'Active' },
    { id: 'ven_2', name: 'Textile Masters', contact: 'sales@textilemasters.com', status: 'Active' },
    { id: 'ven_3', name: 'Accessory Alchemists', contact: 'info@accessoryalchemists.dev', status: 'Inactive' },
];


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

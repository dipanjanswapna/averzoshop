import { PlaceHolderImages } from './placeholder-images';

export const products = [
  { id: 'prod_1', name: 'Classic Cotton T-Shirt', category: 'Men', group: 'Topwear', subcategory: 'T-Shirts', price: 29.99, stock: 150, image: PlaceHolderImages.find(p => p.id === 'product-1')?.imageUrl, brand: 'Zara', colors: ['Black', 'White'], sizes: ['S', 'M', 'L'], discount: 10, isBundle: false },
  { id: 'prod_2', name: 'Slim-Fit Denim Jeans', category: 'Men', group: 'Bottomwear', subcategory: 'Jeans', price: 89.99, stock: 80, image: PlaceHolderImages.find(p => p.id === 'product-2')?.imageUrl, brand: 'Levi\'s', colors: ['Blue'], sizes: ['M', 'L', 'XL'], discount: 15, isBundle: false },
  { id: 'prod_3', name: 'Floral Summer Dress', category: 'Women', group: 'Dresses', subcategory: 'Maxi Dress', price: 120.0, stock: 60, image: PlaceHolderImages.find(p => p.id === 'product-3')?.imageUrl, brand: 'H&M', colors: ['Pink', 'White'], sizes: ['S', 'M'], discount: 20, isBundle: true },
  { id: 'prod_4', name: 'Urban Runner Sneakers', category: 'Unisex', group: 'Footwear', subcategory: 'Sneakers', price: 150.0, stock: 120, image: PlaceHolderImages.find(p => p.id === 'product-4')?.imageUrl, brand: 'Nike', colors: ['Black', 'White', 'Red'], sizes: ['M', 'L', 'XL'], discount: 0, isBundle: false },
  { id: 'prod_5', name: 'Vintage Leather Handbag', category: 'Women', group: 'Accessories', subcategory: 'Bags', price: 250.0, stock: 40, image: PlaceHolderImages.find(p => p.id === 'product-5')?.imageUrl, brand: 'Zara', colors: ['Black'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_6', name: "Dino Adventure Jacket", category: 'Kids', group: 'Outerwear', subcategory: 'Jackets', price: 59.99, stock: 90, image: PlaceHolderImages.find(p => p.id === 'product-6')?.imageUrl, brand: 'H&M', colors: ['Green', 'Blue'], sizes: ['S', 'M'], discount: 25, isBundle: true },
  { id: 'prod_7', name: 'Men\'s Formal Shirt', category: 'Men', group: 'Topwear', subcategory: 'Formal Shirts', price: 55.50, stock: 75, image: PlaceHolderImages.find(p => p.id === 'product-7')?.imageUrl, brand: 'Zara', colors: ['White', 'Blue'], sizes: ['M', 'L', 'XL'], discount: 0, isBundle: false },
  { id: 'prod_8', name: 'Women\'s High-Waist Jeans', category: 'Women', group: 'Western Wear', subcategory: 'Jeans', price: 95.00, stock: 100, image: PlaceHolderImages.find(p => p.id === 'product-8')?.imageUrl, brand: 'Levi\'s', colors: ['Blue', 'Black'], sizes: ['S', 'M', 'L'], discount: 10, isBundle: false },
  { id: 'prod_9', name: 'Gaming Laptop XG200', category: 'Electronics & Gadgets', group: 'Mobiles & Laptops', subcategory: 'Laptops', price: 1200.00, stock: 25, image: PlaceHolderImages.find(p => p.id === 'product-9')?.imageUrl, brand: 'Puma', colors: ['Black'], sizes: [], discount: 5, isBundle: false },
  { id: 'prod_10', name: 'Baby Romper Suit', category: 'Kids & Baby', group: 'Clothing', subcategory: 'Infants', price: 25.00, stock: 200, image: PlaceHolderImages.find(p => p.id === 'product-10')?.imageUrl, brand: 'H&M', colors: ['White', 'Pink', 'Blue'], sizes: ['S'], discount: 30, isBundle: true },
  { id: 'prod_11', name: 'Organic Face Moisturizer', category: 'Beauty & Personal Care', group: 'Skincare', subcategory: 'Moisturizer', price: 45.00, stock: 150, image: PlaceHolderImages.find(p => p.id === 'product-11')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_12', name: 'Modern Wall Art Set', category: 'Home & Living', group: 'Decor', subcategory: 'Wall Art', price: 180.00, stock: 50, image: PlaceHolderImages.find(p => p.id === 'product-12')?.imageUrl, brand: 'Puma', colors: [], sizes: [], discount: 10, isBundle: false },
  { id: 'prod_13', name: 'Whey Protein Powder', category: 'Health & Wellness', group: 'Supplements', subcategory: 'Protein', price: 75.00, stock: 80, image: PlaceHolderImages.find(p => p.id === 'product-13')?.imageUrl, brand: 'Adidas', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_14', name: 'Ergonomic Gaming Chair', category: 'Gaming & Esports', group: 'Hardware', subcategory: 'Chairs', price: 350.00, stock: 30, image: PlaceHolderImages.find(p => p.id === 'product-14')?.imageUrl, brand: 'Puma', colors: ['Black', 'Red'], sizes: [], discount: 15, isBundle: false },
  { id: 'prod_15', name: 'Natural Grain-Free Dog Food', category: 'Pet Care', group: 'Food', subcategory: 'Dog Food', price: 60.00, stock: 100, image: PlaceHolderImages.find(p => p.id === 'product-15')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_16', name: 'Professional Cricket Bat', category: 'Sports & Outdoors', group: 'Cricket', subcategory: 'Bats', price: 220.00, stock: 40, image: PlaceHolderImages.find(p => p.id === 'product-16')?.imageUrl, brand: 'Nike', colors: [], sizes: [], discount: 20, isBundle: false },
  { id: 'prod_17', name: 'Smart LED Light Strip', category: 'Smart Home & IoT', group: 'Lighting', subcategory: 'LED Strips', price: 35.00, stock: 300, image: PlaceHolderImages.find(p => p.id === 'product-17')?.imageUrl, brand: 'Puma', colors: [], sizes: [], discount: 0, isBundle: true },
  { id: 'prod_18', name: 'Full-Face Motorcycle Helmet', category: 'Automotive & Biking', group: 'Helmets', subcategory: 'Full-face', price: 180.00, stock: 60, image: PlaceHolderImages.find(p => p.id === 'product-18')?.imageUrl, brand: 'Adidas', colors: ['Black', 'White'], sizes: ['M', 'L', 'XL'], discount: 10, isBundle: false },
  { id: 'prod_19', name: 'Bestselling Fiction Novel', category: 'Books & Stationery', group: 'Books', subcategory: 'Fiction', price: 19.99, stock: 250, image: PlaceHolderImages.find(p => p.id === 'product-19')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_20', name: 'Handmade Pottery Vase', category: 'Artisan & Handicrafts', group: 'Crafts', subcategory: 'Pottery', price: 90.00, stock: 20, image: PlaceHolderImages.find(p => p.id === 'product-20')?.imageUrl, brand: 'Puma', colors: ['White', 'Green'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_21', name: 'Men\'s Casual Polo Shirt', category: 'Men', group: 'Topwear', subcategory: 'Polo Shirts', price: 45.00, stock: 120, image: PlaceHolderImages.find(p => p.id === 'product-21')?.imageUrl, brand: 'H&M', colors: ['Blue', 'White', 'Black'], sizes: ['S', 'M', 'L', 'XL'], discount: 5, isBundle: false },
  { id: 'prod_22', name: 'Women\'s Elegant Saree', category: 'Women', group: 'Indian & Fusion Wear', subcategory: 'Sarees', price: 150.00, stock: 50, image: PlaceHolderImages.find(p => p.id === 'product-22')?.imageUrl, brand: 'Zara', colors: ['Red', 'Pink', 'Yellow'], sizes: [], discount: 30, isBundle: true },
  { id: 'prod_23', name: 'Latest Smartphone Model', category: 'Electronics & Gadgets', group: 'Mobiles & Laptops', subcategory: 'Mobiles', price: 999.00, stock: 40, image: PlaceHolderImages.find(p => p.id === 'product-23')?.imageUrl, brand: 'Puma', colors: ['Black', 'White'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_24', name: 'Educational Toy Blocks', category: 'Kids & Baby', group: 'Toys', subcategory: 'Educational', price: 30.00, stock: 180, image: PlaceHolderImages.find(p => p.id === 'product-24')?.imageUrl, brand: 'H&M', colors: ['Red', 'Blue', 'Green', 'Yellow'], sizes: [], discount: 10, isBundle: true },
  { id: 'prod_25', name: 'Matte Finish Lipstick', category: 'Beauty & Personal Care', group: 'Makeup', subcategory: 'Lipstick', price: 22.00, stock: 300, image: PlaceHolderImages.find(p => p.id === 'product-25')?.imageUrl, brand: 'Zara', colors: ['Red', 'Pink'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_26', name: 'Non-Stick Cookware Set', category: 'Home & Living', group: 'Kitchen', subcategory: 'Cookware', price: 250.00, stock: 60, image: PlaceHolderImages.find(p => p.id === 'product-26')?.imageUrl, brand: 'Puma', colors: ['Black'], sizes: [], discount: 20, isBundle: false },
  { id: 'prod_27', name: 'Yoga Mat', category: 'Health & Wellness', group: 'Gym Gear', subcategory: 'Mats', price: 40.00, stock: 150, image: PlaceHolderImages.find(p => p.id === 'product-27')?.imageUrl, brand: 'Nike', colors: ['Blue', 'Pink', 'Black'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_28', name: 'Wireless Gaming Headset', category: 'Gaming & Esports', group: 'Accessories', subcategory: 'Headsets', price: 120.00, stock: 90, image: PlaceHolderImages.find(p => p.id === 'product-28')?.imageUrl, brand: 'Puma', colors: ['Black', 'White'], sizes: [], discount: 10, isBundle: false },
  { id: 'prod_29', name: 'Pet Grooming Shampoo', category: 'Pet Care', group: 'Grooming', subcategory: 'Shampoos', price: 18.00, stock: 200, image: PlaceHolderImages.find(p => p.id === 'product-29')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_30', name: '4-Person Camping Tent', category: 'Sports & Outdoors', group: 'Camping', subcategory: 'Tents', price: 280.00, stock: 35, image: PlaceHolderImages.find(p => p.id === 'product-30')?.imageUrl, brand: 'Nike', colors: ['Green', 'Blue'], sizes: [], discount: 15, isBundle: false },
  { id: 'prod_31', name: 'Smart Security Camera', category: 'Smart Home & IoT', group: 'Security', subcategory: 'Cameras', price: 150.00, stock: 80, image: PlaceHolderImages.find(p => p.id === 'product-31')?.imageUrl, brand: 'Puma', colors: ['White'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_32', name: 'Leather Biking Gloves', category: 'Automotive & Biking', group: 'Accessories', subcategory: 'Gloves', price: 50.00, stock: 110, image: PlaceHolderImages.find(p => p.id === 'product-32')?.imageUrl, brand: 'Adidas', colors: ['Black'], sizes: ['M', 'L', 'XL'], discount: 5, isBundle: false },
  { id: 'prod_33', name: 'Set of Premium Pens', category: 'Books & Stationery', group: 'Stationery', subcategory: 'Pens', price: 35.00, stock: 400, image: PlaceHolderImages.find(p => p.id === 'product-33')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: true },
  { id: 'prod_34', name: 'Abstract Canvas Painting', category: 'Artisan & Handicrafts', group: 'Decor', subcategory: 'Paintings', price: 450.00, stock: 10, image: PlaceHolderImages.find(p => p.id === 'product-34')?.imageUrl, brand: 'Puma', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_35', name: 'Hardshell Trolley Bag', category: 'Travel & Luggage', group: 'Bags', subcategory: 'Trolleys', price: 180.00, stock: 70, image: PlaceHolderImages.find(p => p.id === 'product-35')?.imageUrl, brand: 'Adidas', colors: ['Black', 'Blue'], sizes: [], discount: 25, isBundle: false },
  { id: 'prod_36', name: 'Recycled Fabric Tote Bag', category: 'Eco-Friendly Living', group: 'Fashion', subcategory: 'Recycled', price: 25.00, stock: 250, image: PlaceHolderImages.find(p => p.id === 'product-36')?.imageUrl, brand: 'H&M', colors: ['White', 'Green'], sizes: [], discount: 10, isBundle: true },
  { id: 'prod_37', name: 'Acoustic Guitar', category: 'Musical Instruments', group: 'String', subcategory: 'Guitars', price: 320.00, stock: 45, image: PlaceHolderImages.find(p => p.id === 'product-37')?.imageUrl, brand: 'Puma', colors: [], sizes: [], discount: 5, isBundle: false },
  { id: 'prod_38', name: 'Luxury Gift Box', category: 'Gifts & Celebrations', group: 'Gifts', subcategory: 'Gift Boxes', price: 60.00, stock: 120, image: PlaceHolderImages.find(p => p.id === 'product-38')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: true },
  { id: 'prod_39', name: 'Organic Basmati Rice', category: 'Daily Essentials (Groceries)', group: 'Staples', subcategory: 'Rice', price: 15.00, stock: 500, image: PlaceHolderImages.find(p => p.id === 'product-39')?.imageUrl, brand: 'Puma', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_40', name: 'Men\'s Leather Belt', category: 'Men', group: 'Accessories', subcategory: 'Belts', price: 40.00, stock: 180, image: PlaceHolderImages.find(p => p.id === 'product-40')?.imageUrl, brand: 'Levi\'s', colors: ['Black', 'Brown'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_41', name: 'Women\'s Casual Top', category: 'Women', group: 'Western Wear', subcategory: 'Tops', price: 35.00, stock: 200, image: PlaceHolderImages.find(p => p.id === 'product-41')?.imageUrl, brand: 'H&M', colors: ['White', 'Pink', 'Black'], sizes: ['S', 'M', 'L'], discount: 15, isBundle: false },
  { id: 'prod_42', name: 'Professional DSLR Camera', category: 'Electronics & Gadgets', group: 'Cameras & Drones', subcategory: 'DSLR', price: 850.00, stock: 15, image: PlaceHolderImages.find(p => p.id === 'product-42')?.imageUrl, brand: 'Puma', colors: ['Black'], sizes: [], discount: 10, isBundle: false },
  { id: 'prod_43', name: 'Girls\' Princess Dress', category: 'Kids & Baby', group: 'Clothing', subcategory: 'Girls', price: 70.00, stock: 100, image: PlaceHolderImages.find(p => p.id === 'product-43')?.imageUrl, brand: 'H&M', colors: ['Pink', 'Blue'], sizes: ['S', 'M', 'L'], discount: 20, isBundle: true },
  { id: 'prod_44', name: 'Herbal Face Wash', category: 'Beauty & Personal Care', group: 'Skincare', subcategory: 'Face Wash', price: 15.00, stock: 400, image: PlaceHolderImages.find(p => p.id === 'product-44')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_45', name: 'Designer Floor Lamp', category: 'Home & Living', group: 'Decor', subcategory: 'Lamps', price: 220.00, stock: 30, image: PlaceHolderImages.find(p => p.id === 'product-45')?.imageUrl, brand: 'Puma', colors: ['Black', 'White'], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_46', name: 'Multivitamin Supplements', category: 'Health & Wellness', group: 'Supplements', subcategory: 'Vitamins', price: 30.00, stock: 250, image: PlaceHolderImages.find(p => p.id === 'product-46')?.imageUrl, brand: 'Adidas', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_47', name: 'Mechanical Gaming Keyboard', category: 'Gaming & Esports', group: 'Accessories', subcategory: 'Keyboards', price: 110.00, stock: 80, image: PlaceHolderImages.find(p => p.id === 'product-47')?.imageUrl, brand: 'Puma', colors: ['Black'], sizes: [], discount: 5, isBundle: false },
  { id: 'prod_48', name: 'Premium Cat Food', category: 'Pet Care', group: 'Food', subcategory: 'Cat Food', price: 50.00, stock: 130, image: PlaceHolderImages.find(p => p.id === 'product-48')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: false },
  { id: 'prod_49', name: 'Hiking Backpack', category: 'Sports & Outdoors', group: 'Camping', subcategory: 'Backpacks', price: 130.00, stock: 90, image: PlaceHolderImages.find(p => p.id === 'product-49')?.imageUrl, brand: 'Nike', colors: ['Blue', 'Black', 'Green'], sizes: [], discount: 10, isBundle: false },
  { id: 'prod_50', name: 'Digital Notebook', category: 'Books & Stationery', group: 'Stationery', subcategory: 'Notebooks', price: 45.00, stock: 150, image: PlaceHolderImages.find(p => p.id === 'product-50')?.imageUrl, brand: 'Zara', colors: [], sizes: [], discount: 0, isBundle: true },
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

export { categoriesData } from './categories';

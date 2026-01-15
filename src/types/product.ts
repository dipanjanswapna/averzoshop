
export type Product = {
    id: string;
    name: string;
    description: string;
    category: string;
    group: string;
    subcategory: string;
    price: number;
    total_stock: number;
    outlet_stocks: { [key: string]: number };
    image: string;
    brand: string;
    colors: string[];
    sizes: string[];
    discount: number;
    isBundle: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
    gallery?: string[];
    videos?: string[];
    flashSale?: {
        endDate: string;
    };
    vendorId?: string;
    status?: 'pending' | 'approved' | 'rejected';
};

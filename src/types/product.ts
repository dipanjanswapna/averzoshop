
export type ProductVariant = {
    sku: string;
    color?: string;
    size?: string;
    image?: string;
    stock: number; // Total stock for this variant across all locations
    price: number;
    compareAtPrice?: number;
    outlet_stocks?: { [key: string]: number }; // Stock per outlet for this specific variant
};

export type Product = {
    id: string;
    name: string;
    description: string;
    category: string;
    group: string;
    subcategory: string;
    price: number; // Base price
    compareAtPrice?: number;
    baseSku: string;
    specifications?: { [key: string]: string };
    total_stock: number; // Aggregated stock from all variants across all locations
    variants: ProductVariant[];
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
    giftWithPurchase?: {
        enabled: boolean;
        description: string;
    };
    preOrder?: {
        enabled: boolean;
        releaseDate: any;
        depositType?: 'percentage' | 'fixed';
        depositAmount?: number;
        limit?: number;
    };
    vendorId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any; // Can be Timestamp or string
};



    

    
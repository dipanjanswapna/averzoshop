
'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { products } from '@/lib/data';

type Product = (typeof products)[0];

export function ProductTabs({ product }: { product: Product }) {
    return (
        <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6 text-sm text-muted-foreground">
                <p>This is a detailed description of the {product.name}. It's a high-quality product from {product.brand}, perfect for your needs. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </TabsContent>
            <TabsContent value="specifications" className="py-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong className="text-foreground">Category:</strong> {product.category}</li>
                    <li><strong className="text-foreground">Group:</strong> {product.group}</li>
                    <li><strong className="text-foreground">Brand:</strong> {product.brand}</li>
                    {product.colors.length > 0 && <li><strong className="text-foreground">Colors:</strong> {product.colors.join(', ')}</li>}
                    {product.sizes.length > 0 && <li><strong className="text-foreground">Sizes:</strong> {product.sizes.join(', ')}</li>}
                </ul>
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
                <div className="text-center text-muted-foreground">No reviews yet.</div>
            </TabsContent>
        </Tabs>
    );
}

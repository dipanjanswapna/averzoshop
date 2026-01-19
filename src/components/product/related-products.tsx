'use client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Product } from '@/types/product';
import { ProductCard } from "@/components/product-card";

export function RelatedProducts({ products }: { products: Product[] }) {
    if(!products || products.length === 0) return null;
    
    return (
        <div>
             <Carousel 
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-headline">Related Products</h2>
                    <div className="flex items-center gap-2">
                        <CarouselPrevious className="static -translate-y-0" />
                        <CarouselNext className="static -translate-y-0" />
                    </div>
                </div>
                <CarouselContent className="-ml-2">
                    {products.map(product => (
                        <CarouselItem key={product.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-2">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}

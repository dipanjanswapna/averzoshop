
'use client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { products } from '@/lib/data';
import { ProductCard } from "@/components/product-card";

export function RelatedProducts({ products }: { products: typeof import('@/lib/data').products }) {
    return (
        <div>
             <Carousel 
                opts={{
                    align: "start",
                    loop: true,
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
                        <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5 pl-2">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}

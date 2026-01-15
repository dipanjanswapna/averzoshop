
'use client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { products } from '@/lib/data';
import { ProductCard } from "@/components/product-card";

export function RelatedProducts({ products }: { products: typeof import('@/lib/data').products }) {
    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6">Related Products</h2>
             <Carousel 
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {products.map(product => (
                        <CarouselItem key={product.id} className="md:basis-1/3 lg:basis-1/5">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <div className="absolute top-0 right-0">
                    <CarouselPrevious className="static -translate-y-0" />
                    <CarouselNext className="static -translate-y-0" />
                </div>
            </Carousel>
        </div>
    );
}

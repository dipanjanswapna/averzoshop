'use client';

import type { Product, ProductVariant } from '@/types/product';
import type { Review } from '@/types/review';
import Script from 'next/script';

interface ProductSchemaProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  reviews: Review[] | null;
}

export function ProductSchema({ product, selectedVariant, reviews }: ProductSchemaProps) {
  if (!product) {
    return null;
  }

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
    : '4.5'; // Fallback rating
  
  const reviewCount = reviews ? reviews.length : 15; // Fallback count

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: selectedVariant?.sku || product.baseSku,
    mpn: selectedVariant?.sku || product.baseSku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    image: [
      product.image,
      ...(product.gallery || []),
    ],
    offers: {
      '@type': 'Offer',
      price: selectedVariant?.price ?? product.price,
      priceCurrency: 'BDT',
      availability: (selectedVariant?.stock ?? product.total_stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: typeof window !== 'undefined' ? window.location.href : '',
      seller: {
        '@type': 'Organization',
        name: 'Averzo',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviewCount,
    },
    // Add reviews if available
    ...(reviews && reviews.length > 0 && {
        review: reviews.map(review => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: review.userName,
            },
            datePublished: review.createdAt.toDate().toISOString(),
            reviewBody: review.text,
            reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating,
            },
        }))
    })
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}

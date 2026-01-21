
'use client';
import type { Product } from '@/types/product';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CompareTableProps {
  items: Product[];
}

export function CompareTable({ items }: CompareTableProps) {
  // Aggregate all unique specification keys from all items
  const allSpecKeys = Array.from(
    new Set(
      items.flatMap((item) => Object.keys(item.specifications || {}))
    )
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="sticky left-0 bg-background p-4 font-bold text-left w-48">
              Feature
            </th>
            {items.map((item) => (
              <th key={item.id} className="p-4 border-l text-center w-64">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h4 className="font-bold text-base truncate w-full">
                    {item.name}
                  </h4>
                  <p className="text-primary font-bold text-lg">
                    ৳{item.price.toFixed(2)}
                  </p>
                  <Link href={`/product/${item.id}`} passHref>
                    <Button size="sm" variant="outline" className="mt-2">
                      View Product
                    </Button>
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-muted/50">
            <td className="sticky left-0 bg-background p-4 border-b font-medium">Brand</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b border-l text-center">
                {item.brand || '—'}
              </td>
            ))}
          </tr>
           <tr className="hover:bg-muted/50">
            <td className="sticky left-0 bg-background p-4 border-b font-medium">Category</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b border-l text-center">
                {item.category || '—'}
              </td>
            ))}
          </tr>
          {allSpecKeys.map((specKey) => (
            <tr key={specKey} className="hover:bg-muted/50">
              <td className="sticky left-0 bg-background p-4 border-b font-medium capitalize">
                {specKey.replace(/_/g, ' ')}
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-b border-l text-center">
                  {item.specifications?.[specKey] || '—'}
                </td>
              ))}
            </tr>
          ))}
          <tr className="hover:bg-muted/50">
            <td className="sticky left-0 bg-background p-4 border-b font-medium">
              Availability
            </td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b border-l text-center">
                {item.preOrder?.enabled ? (
                  <span className="text-orange-600 font-bold">Pre-order</span>
                ) : item.total_stock > 0 ? (
                  <span className="text-green-600 font-bold">In Stock</span>
                ) : (
                  <span className="text-red-600 font-bold">Out of Stock</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

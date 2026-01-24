'use client';
import type { Product } from '@/types/product';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


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
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="w-full min-w-[800px] border-collapse">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="sticky left-0 bg-background p-4 font-bold text-left w-48">
                Feature
              </TableHead>
              {items.map((item) => (
                <TableHead key={item.id} className="p-4 border-l text-center w-64">
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
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="sticky left-0 bg-background p-4 border-b font-medium">Brand</TableCell>
              {items.map((item) => (
                <TableCell key={item.id} className="p-4 border-b border-l text-center">
                  {item.brand || '—'}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="sticky left-0 bg-background p-4 border-b font-medium">Category</TableCell>
              {items.map((item) => (
                <TableCell key={item.id} className="p-4 border-b border-l text-center">
                  {item.category || '—'}
                </TableCell>
              ))}
            </TableRow>
            {allSpecKeys.map((specKey) => (
              <TableRow key={specKey} className="hover:bg-muted/50">
                <TableCell className="sticky left-0 bg-background p-4 border-b font-medium capitalize">
                  {specKey.replace(/_/g, ' ')}
                </TableCell>
                {items.map((item) => (
                  <TableCell key={item.id} className="p-4 border-b border-l text-center">
                    {item.specifications?.[specKey] || '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className="hover:bg-muted/50">
              <TableCell className="sticky left-0 bg-background p-4 border-b font-medium">
                Availability
              </TableCell>
              {items.map((item) => (
                <TableCell key={item.id} className="p-4 border-b border-l text-center">
                  {item.preOrder?.enabled ? (
                    <span className="text-orange-600 font-bold">Pre-order</span>
                  ) : item.total_stock > 0 ? (
                    <span className="text-green-600 font-bold">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {items.map(item => (
            <Card key={item.id}>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                           <Image src={item.image} alt={item.name} fill className="object-contain" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{item.name}</CardTitle>
                             <p className="text-primary font-bold text-lg">৳{item.price.toFixed(2)}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                     <div className="flex justify-between"><strong className="text-muted-foreground">Brand:</strong> <span>{item.brand || '—'}</span></div>
                     <div className="flex justify-between"><strong className="text-muted-foreground">Category:</strong> <span>{item.category || '—'}</span></div>
                     {allSpecKeys.map(specKey => (
                         <div key={specKey} className="flex justify-between"><strong className="text-muted-foreground capitalize">{specKey.replace(/_/g, ' ')}:</strong> <span>{item.specifications?.[specKey] || '—'}</span></div>
                     ))}
                     <div className="flex justify-between"><strong className="text-muted-foreground">Availability:</strong> 
                       <span>
                            {item.preOrder?.enabled ? 'Pre-order' : item.total_stock > 0 ? 'In Stock' : 'Out of Stock'}
                       </span>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </>
  );
}


'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Outlet } from '@/types/outlet';
import type { Product } from '@/types/product';
import type { POSSale } from '@/types/pos';
import type { Order } from '@/types/order';
import { Button } from '../ui/button';
import { Bot, Loader2, Warehouse } from 'lucide-react';
import { getReplenishmentPlan, type ReplenishmentPlannerOutput } from '@/ai/flows/replenishment-planner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export function ReplenishmentAdvisor({ className }: { className?: string }) {
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ReplenishmentPlannerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { data: outlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: posSales, isLoading: salesLoading } = useFirestoreQuery<POSSale>('pos_sales');
  const { data: onlineOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>('orders');
  
  const dataIsLoading = outletsLoading || productsLoading || salesLoading || ordersLoading;

  const handleAnalysis = async () => {
    if (!selectedOutletId || !products || !posSales || !onlineOrders) {
        setError("Please select an outlet and ensure all data is loaded.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const inventory = products.flatMap(p => 
            p.variants.map(v => ({
                productId: p.id,
                productName: p.name,
                variantSku: v.sku,
                currentStock: v.outlet_stocks?.[selectedOutletId] ?? 0
            }))
        ).filter(item => item.currentStock <= 20); // Pre-filter low stock items to reduce payload
        
        const outletPosSales = posSales
            .filter(s => s.outletId === selectedOutletId && s.createdAt.toDate() > thirtyDaysAgo)
            .flatMap(s => s.items.map(item => ({ ...item, saleDate: s.createdAt.toDate() })));

        const outletOnlineSales = onlineOrders
            .filter(o => o.assignedOutletId === selectedOutletId && o.createdAt.toDate() > thirtyDaysAgo)
            .flatMap(o => o.items.map(item => ({...item, saleDate: o.createdAt.toDate() })));

        const allSales = [...outletPosSales, ...outletOnlineSales];
        
        const result = await getReplenishmentPlan({
            outletId: selectedOutletId,
            inventoryJson: JSON.stringify(inventory),
            salesDataJson: JSON.stringify(allSales),
        });

        setRecommendations(result);

    } catch(e: any) {
        console.error("Replenishment analysis failed:", e);
        setError(e.message || "An unexpected error occurred during analysis.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bot size={24} /> AI Replenishment Advisor
            </CardTitle>
            <CardDescription className="mt-1">
              Use AI to generate stock replenishment recommendations based on sales velocity.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select onValueChange={setSelectedOutletId} disabled={dataIsLoading}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select Outlet" />
              </SelectTrigger>
              <SelectContent>
                {outlets?.map(outlet => (
                    <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAnalysis} disabled={!selectedOutletId || isLoading || dataIsLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
            <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">
                <strong>Error:</strong> {error}
            </div>
        )}
        {!recommendations && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <Warehouse className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-bold text-lg">Awaiting Analysis</h3>
                <p className="text-muted-foreground">Select an outlet and click "Analyze" to get stock recommendations.</p>
            </div>
        )}
        {isLoading && (
            <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
            </div>
        )}
        {recommendations && (
            <div>
                 {recommendations.recommendations.length > 0 ? (
                    <>
                       {/* Desktop Table */}
                      <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>30d Sales</TableHead>
                                    <TableHead className="text-green-600">Recommended</TableHead>
                                    <TableHead>Reasoning</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recommendations.recommendations.map(rec => (
                                    <TableRow key={rec.variantSku}>
                                        <TableCell>
                                            <div className="font-medium">{rec.productName}</div>
                                            <div className="text-xs text-muted-foreground">{rec.variantSku}</div>
                                        </TableCell>
                                        <TableCell className="text-center">{rec.currentStock}</TableCell>
                                        <TableCell className="text-center">{rec.thirtyDaySales}</TableCell>
                                        <TableCell className="text-center font-bold text-green-600">{rec.recommendedQuantity}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{rec.reasoning}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      </div>
                       {/* Mobile Cards */}
                       <div className="grid md:hidden gap-4">
                          {recommendations.recommendations.map(rec => (
                            <Card key={rec.variantSku}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                      <div>
                                          <CardTitle className="text-base">{rec.productName}</CardTitle>
                                          <CardDescription className="text-xs font-mono">{rec.variantSku}</CardDescription>
                                      </div>
                                      <Badge className="bg-green-100 text-green-800">
                                        Reorder: {rec.recommendedQuantity}
                                      </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-xs space-y-2">
                                     <div className="flex justify-between">
                                        <span className="text-muted-foreground">Current Stock:</span>
                                        <span className="font-bold">{rec.currentStock}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">30-day Sales:</span>
                                        <span className="font-bold">{rec.thirtyDaySales}</span>
                                    </div>
                                    <p className="italic pt-2 border-t">{rec.reasoning}</p>
                                </CardContent>
                            </Card>
                          ))}
                       </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <p className="text-muted-foreground">No low-stock items found needing replenishment for this outlet.</p>
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

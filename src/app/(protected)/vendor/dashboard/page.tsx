
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, LayoutDashboard, Package, History, DollarSign, Clock, ShoppingCart, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { AddProductDialog } from '@/components/dashboard/add-product-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Order } from '@/types/order';
import type { POSSale } from '@/types/pos';
import { SalesChart } from '@/components/sales-chart';
import { cn } from '@/lib/utils';

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Firestore queries
  const productsQuery = useMemo(() => firestore ? query(collection(firestore, 'products')) : null, [firestore]);
  const ordersQuery = useMemo(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);
  const posSalesQuery = useMemo(() => firestore ? query(collection(firestore, 'pos_sales')) : null, [firestore]);

  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);
  const { data: allOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(ordersQuery);
  const { data: allPosSales, isLoading: salesLoading } = useFirestoreQuery<POSSale>(posSalesQuery);

  const isLoading = productsLoading || ordersLoading || salesLoading;

  // Memoized calculations for vendor-specific data
  const vendorProducts = useMemo(() => {
    if (!allProducts || !user) return [];
    return allProducts.filter(p => p.vendorId === user.uid);
  }, [allProducts, user]);

  const { totalRevenue, totalUnitsSold, salesData, topProducts, lowStockCount, preOrderCount } = useMemo(() => {
    if (!vendorProducts.length || !allOrders || !allPosSales || !user) {
      return { totalRevenue: 0, totalUnitsSold: 0, salesData: [], topProducts: [], lowStockCount: 0, preOrderCount: 0 };
    }

    const vendorProductIds = new Set(vendorProducts.map(p => p.id));
    let revenue = 0;
    let unitsSold = 0;
    const monthlySales: { [key: string]: number } = {};
    const productSales: { [key: string]: { name: string; sku: string; units: number; revenue: number } } = {};
    let currentPreOrderCount = 0;


    const processItem = (item: { productId: string; quantity: number; price: number }, date: Date) => {
      if (vendorProductIds.has(item.productId)) {
        const itemRevenue = item.price * item.quantity;
        revenue += itemRevenue;
        unitsSold += item.quantity;

        // Monthly sales
        const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
        monthlySales[monthYear] = (monthlySales[monthYear] || 0) + itemRevenue;

        // Product sales
        if (!productSales[item.productId]) {
            const product = vendorProducts.find(p => p.id === item.productId);
            productSales[item.productId] = { name: product?.name || 'Unknown', sku: product?.baseSku || 'N/A', units: 0, revenue: 0 };
        }
        productSales[item.productId].units += item.quantity;
        productSales[item.productId].revenue += itemRevenue;
      }
    };

    // Process online orders
    allOrders.forEach(order => {
      // For sales analytics, only count completed orders
      if (order.status === 'delivered' || order.status === 'fulfilled') {
        order.items.forEach(item => processItem(item, order.createdAt.toDate()));
      }
      // For pre-order analytics, count pending pre-orders
      if (order.orderType === 'pre-order' && order.status === 'pre-ordered') {
          order.items.forEach(item => {
              if (vendorProductIds.has(item.productId)) {
                  currentPreOrderCount += item.quantity;
              }
          });
      }
    });

    // Process POS sales
    allPosSales.forEach(sale => {
      sale.items.forEach(item => processItem(item, sale.createdAt.toDate()));
    });
    
    // Low stock count for vendor's products
    const lowStock = vendorProducts.filter(p => p.total_stock > 0 && p.total_stock < 10).length;

    // Format sales data for chart
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => {
        const [aMonth, aYear] = a.split('-');
        const [bMonth, bYear] = b.split('-');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    }).slice(-6);

    const chartData = sortedMonths.map(monthYear => ({
      month: monthYear.split('-')[0],
      desktop: monthlySales[monthYear],
    }));
    
    // Format top products
    const sortedTopProducts = Object.values(productSales)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return { totalRevenue: revenue, totalUnitsSold: unitsSold, salesData: chartData, topProducts: sortedTopProducts, lowStockCount: lowStock, preOrderCount: currentPreOrderCount };

  }, [vendorProducts, allOrders, allPosSales, user]);

    const getStatusVariant = (status: 'approved' | 'pending' | 'rejected') => {
        switch (status) {
            case 'approved': return 'default';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
       <TableRow key={i}>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
        </TableRow>
    ))
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" /> My Products</TabsTrigger>
          <TabsTrigger value="stock"><History className="mr-2 h-4 w-4" /> Stock & Logistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">৳{totalRevenue.toFixed(2)}</div>}
                            <p className="text-xs text-muted-foreground">From all completed sales.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalUnitsSold}</div>}
                             <p className="text-xs text-muted-foreground">From all completed sales.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Product Status</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{vendorProducts.length} Active</div>}
                            <p className={cn("text-xs", lowStockCount > 0 ? "text-destructive font-bold" : "text-muted-foreground")}>
                              {lowStockCount} items are low on stock.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Pre-orders</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{preOrderCount} Units</div>}
                            <p className="text-xs text-muted-foreground">
                            Total pending pre-ordered units.
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline">Sales Overview</CardTitle>
                            <CardDescription>Your sales performance over the last 6 months.</CardDescription>
                         </CardHeader>
                         <CardContent className="pl-2">
                            <SalesChart data={salesData} />
                         </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                            <CardDescription>Your most popular products by units sold.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Units Sold</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                                        </TableRow>
                                    )) : topProducts.map(p => (
                                        <TableRow key={p.sku}>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell className="text-right">{p.units}</TableCell>
                                            <TableCell className="text-right">৳{p.revenue.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Products</CardTitle>
                  <CardDescription>Manage all products you have listed.</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> List New Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    renderSkeleton()
                  ) : vendorProducts.length > 0 ? (
                    vendorProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image alt={product.name} className="aspect-square rounded-md object-cover" height="64" src={product.image || 'https://placehold.co/64'} width="64" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                           <Badge variant={getStatusVariant(product.status)} className="capitalize">
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.total_stock}</TableCell>
                        <TableCell className="text-right">৳{product.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No products listed yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
           <Card>
            <CardHeader>
              <CardTitle>Stock & Logistics</CardTitle>
              <CardDescription>Request to add stock and view logistics.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Please use the sidebar menu</h3>
                <p className="mt-1 text-sm text-muted-foreground">"Stock Requests" and "Delivery Challans" have dedicated pages.</p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}

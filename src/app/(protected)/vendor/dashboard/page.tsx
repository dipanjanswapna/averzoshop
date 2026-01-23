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
import {
  DollarSign,
  Package,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { SalesChart } from '@/components/sales-chart';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';
import type { POSSale } from '@/types/pos';
import { useAuth } from '@/hooks/use-auth';

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();

  const productsQuery = useMemo(() => firestore ? query(collection(firestore, 'products')) : null, [firestore]);
  const ordersQuery = useMemo(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);
  const posSalesQuery = useMemo(() => firestore ? query(collection(firestore, 'pos_sales')) : null, [firestore]);

  const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);
  const { data: allOrders, isLoading: ordersLoading } = useFirestoreQuery<Order>(ordersQuery);
  const { data: allPosSales, isLoading: salesLoading } = useFirestoreQuery<POSSale>(posSalesQuery);

  const isLoading = productsLoading || ordersLoading || salesLoading;

  const vendorProducts = useMemo(() => {
    if (!allProducts || !user) return [];
    return allProducts.filter(p => p.vendorId === user.uid);
  }, [allProducts, user]);

  const { totalRevenue, totalUnitsSold, preOrderCount, salesData, topProducts } = useMemo(() => {
    if (!vendorProducts.length || !allOrders || !allPosSales) {
      return { totalRevenue: 0, totalUnitsSold: 0, preOrderCount: 0, salesData: [], topProducts: [] };
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

        const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
        monthlySales[monthYear] = (monthlySales[monthYear] || 0) + itemRevenue;

        const product = vendorProducts.find(p => p.id === item.productId);
        if (product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: product.name, sku: product.baseSku, units: 0, revenue: 0 };
          }
          productSales[item.productId].units += item.quantity;
          productSales[item.productId].revenue += itemRevenue;
        }
      }
    };

    allOrders.forEach(order => {
      if (order.status === 'delivered' || order.status === 'fulfilled') {
        order.items.forEach(item => processItem(item, order.createdAt.toDate()));
      }
      if (order.orderType === 'pre-order' && (order.status === 'pre-ordered' || order.status === 'pending_payment')) {
        order.items.forEach(item => {
          if (vendorProductIds.has(item.productId)) {
            currentPreOrderCount += item.quantity;
          }
        });
      }
    });

    allPosSales.forEach(sale => {
      sale.items.forEach(item => processItem(item, sale.createdAt.toDate()));
    });
    
    const sortedMonths = Object.keys(monthlySales).sort((a, b) => {
        const [aMonth, aYear] = a.split('-');
        const [bMonth, bYear] = b.split('-');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    }).slice(-6);

    const chartData = sortedMonths.map(monthYear => ({
      month: monthYear.split('-')[0],
      desktop: monthlySales[monthYear],
    }));

    const sortedTopProducts = Object.values(productSales)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return { totalRevenue: revenue, totalUnitsSold: unitsSold, preOrderCount: currentPreOrderCount, salesData: chartData, topProducts: sortedTopProducts };

  }, [vendorProducts, allOrders, allPosSales]);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total revenue from all sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProducts.length}</div>
            <p className="text-xs text-muted-foreground">Total products you have listed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnitsSold}</div>
             <p className="text-xs text-muted-foreground">Across all your products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pre-orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preOrderCount} Units</div>
            <p className="text-xs text-muted-foreground">Total pending pre-ordered units.</p>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topProducts.map(p => (
                                <TableRow key={p.sku}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-right">{p.units}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
      </div>
    </div>
  );
}


'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Package,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Skeleton } from '../ui/skeleton';
import { SalesChart } from '../sales-chart';
import { useMemo } from 'react';

interface PosSale {
    id: string;
    outletId: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    totalAmount: number;
}

export function OutletDashboard() {
  const { userData } = useAuth();
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
  const { data: sales, isLoading: salesLoading } = useFirestoreQuery<PosSale>('pos_sales');

  const outletId = useMemo(() => userData?.outletId, [userData]);

  const { todaysSales, totalProducts, lowStockCount } = useMemo(() => {
    if (!outletId || !products || !sales) {
      return { todaysSales: 0, totalProducts: 0, lowStockCount: 0 };
    }

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSalesData = sales.filter(sale => {
        if (sale.outletId !== outletId) return false;
        const saleDate = new Date(sale.createdAt.seconds * 1000);
        return saleDate >= today;
    });
    
    const totalSalesAmount = todaysSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Calculate total products and low stock
    let totalProductCount = 0;
    let lowStockProductCount = 0;

    products.forEach(product => {
        const stockInOutlet = product.variants.reduce((sum, v) => sum + (v.outlet_stocks?.[outletId] ?? 0), 0);
        if (stockInOutlet > 0) {
            totalProductCount++;
            if (stockInOutlet < 10) {
                lowStockProductCount++;
            }
        }
    });

    return { 
        todaysSales: totalSalesAmount,
        totalProducts: totalProductCount,
        lowStockCount: lowStockProductCount
    };

  }, [outletId, products, sales]);


  const isLoading = productsLoading || salesLoading;

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome, {userData?.displayName}!</h1>
                <p className="text-muted-foreground">Live performance for your outlet: <span className="font-bold text-primary">{outletId}</span></p>
            </div>
       </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Offline Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">৳{todaysSales.toFixed(2)}</div>}
             <p className="text-xs text-muted-foreground">
              Total sales made in-store today.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalProducts}</div>}
             <p className="text-xs text-muted-foreground">
              Unique products available in your outlet.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Online Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">12</div>}
             <p className="text-xs text-muted-foreground">
              New orders to be packed and shipped.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alert</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{lowStockCount} items</div>}
             <p className="text-xs text-muted-foreground">
              Items with less than 10 units in stock.
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Outlet Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activities</CardTitle>
            <CardDescription>
              A log of recent sales and stock movements.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
             <p>Activity Log Coming Soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

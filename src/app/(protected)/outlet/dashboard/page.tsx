
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
import { Skeleton } from '@/components/ui/skeleton';
import { SalesChart } from '@/components/sales-chart';
import { useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

interface PosSale {
    id: string;
    outletId: string;
    createdAt: { toDate: () => Date };
    totalAmount: number;
}

export default function OutletDashboardPage() {
  const { userData } = useAuth();
  const { firestore } = useFirebase();

  const productsQuery = useMemo(() => firestore ? query(collection(firestore, 'products')) : null, [firestore]);
  const salesQuery = useMemo(() => firestore ? query(collection(firestore, 'pos_sales')) : null, [firestore]);
  const ordersQuery = useMemo(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);
  
  const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>(productsQuery);
  const { data: sales, isLoading: salesLoading } = useFirestoreQuery<PosSale>(salesQuery);
  const { data: onlineOrders, isLoading: ordersLoading } = useFirestoreQuery<any>(ordersQuery);

  const outletId = useMemo(() => userData?.outletId, [userData]);

  const isLoading = productsLoading || salesLoading || ordersLoading || !userData;

  const { todaysSales, totalProducts, lowStockCount, pendingOnlineOrders } = useMemo(() => {
    if (!outletId || !products || !sales || !onlineOrders) {
      return { todaysSales: 0, totalProducts: 0, lowStockCount: 0, pendingOnlineOrders: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSalesData = sales.filter(sale => {
        if (sale.outletId !== outletId) return false;
        const saleDate = sale.createdAt?.toDate();
        return saleDate >= today;
    });
    
    const totalSalesAmount = todaysSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);

    let totalProductCount = 0;
    let lowStockProductCount = 0;

    products.forEach(product => {
        const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
        const stockInOutlet = variantsArray.reduce((sum, v) => sum + (v.outlet_stocks?.[outletId] ?? 0), 0);
        if (stockInOutlet > 0) {
            totalProductCount++;
            if (stockInOutlet < 10) {
                lowStockProductCount++;
            }
        }
    });

    const pendingOrders = onlineOrders.filter(o => o.assignedOutletId === outletId && o.status === 'new').length;

    return { 
        todaysSales: totalSalesAmount,
        totalProducts: totalProductCount,
        lowStockCount: lowStockProductCount,
        pendingOnlineOrders: pendingOrders
    };
  }, [outletId, products, sales, onlineOrders]);

  const salesData = useMemo(() => {
    if (!sales || !outletId) {
        const currentMonth = new Date().getMonth();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return Array(6).fill(0).map((_, i) => {
            const monthIndex = (currentMonth - 5 + i + 12) % 12;
            return { month: monthNames[monthIndex], desktop: 0 };
        });
    }

    const outletSales = sales.filter(s => s.outletId === outletId);

    const monthlySales: {[key: string]: number} = {};
    
    outletSales.forEach(sale => {
        const date = sale.createdAt.toDate();
        const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
        
        if (!monthlySales[monthYear]) {
            monthlySales[monthYear] = 0;
        }
        monthlySales[monthYear] += sale.totalAmount;
    });

    const sortedMonths = Object.keys(monthlySales).sort((a, b) => {
        const [aMonth, aYear] = a.split('-');
        const [bMonth, bYear] = b.split('-');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    }).slice(-6);

    return sortedMonths.map(monthYear => ({
      month: monthYear.split('-')[0],
      desktop: monthlySales[monthYear],
    }));

  }, [sales, outletId]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="flex flex-wrap justify-center gap-6">
          <Skeleton className="h-36 flex-1 min-w-[280px] max-w-sm" />
          <Skeleton className="h-36 flex-1 min-w-[280px] max-w-sm" />
          <Skeleton className="h-36 flex-1 min-w-[280px] max-w-sm" />
          <Skeleton className="h-36 flex-1 min-w-[280px] max-w-sm" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="h-80 flex-1 rounded-lg" />
          <Skeleton className="h-80 w-full lg:w-1/3 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome, {userData?.displayName}!</h1>
                <p className="text-muted-foreground">Live performance for your outlet: <span className="font-bold text-primary">{outletId}</span></p>
            </div>
       </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Card className="flex-1 min-w-[280px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Offline Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{todaysSales.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">
              Total sales made in-store today.
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[280px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
             <p className="text-xs text-muted-foreground">
              Unique products available in your outlet.
            </p>
          </CardContent>
        </Card>
         <Card className="flex-1 min-w-[280px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Online Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOnlineOrders}</div>
             <p className="text-xs text-muted-foreground">
              New orders to be packed and shipped.
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[280px] max-w-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alert</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount} items</div>
             <p className="text-xs text-muted-foreground">
              Items with less than 10 units in stock.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col xl:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="font-headline">Outlet Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <SalesChart data={salesData} />
          </CardContent>
        </Card>
        <Card className="w-full xl:w-[400px] shrink-0">
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

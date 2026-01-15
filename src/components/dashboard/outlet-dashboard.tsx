
'use client';
import { useMemo } from 'react';
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
import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface PosSale {
  id: string;
  outletId: string;
  soldBy: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  totalAmount: number;
  createdAt: { seconds: number; nanoseconds: number };
}

export function OutletDashboard() {
  const { userData } = useAuth();
  const outletId = userData?.outletId;
  const { data: posSales, isLoading } = useFirestoreQuery<PosSale>('pos_sales');

  const outletSales = useMemo(() => {
    if (!posSales || !outletId) return [];
    return posSales
      .filter((sale) => sale.outletId === outletId)
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [posSales, outletId]);
  
  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return outletSales
        .filter(sale => new Date(sale.createdAt.seconds * 1000).toDateString() === today)
        .reduce((acc, sale) => acc + sale.totalAmount, 0);
  }, [outletSales])

  const totalProductsInStock = 0; // This needs a query on products collection
  const pendingOnlineOrders = 0; // This needs a query on online orders collection

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome, {userData?.displayName}!</h1>
                <p className="text-muted-foreground">Here's the live dashboard for {userData?.outletId}.</p>
            </div>
       </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue from POS today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOnlineOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pending orders to be fulfilled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductsInStock}</div>
            <p className="text-xs text-muted-foreground">
              Unique products available in this outlet
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Live feed of sales and orders for your outlet.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="pos_sales">
                <TabsList>
                    <TabsTrigger value="pos_sales">Recent POS Sales</TabsTrigger>
                    <TabsTrigger value="online_orders">Online Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="pos_sales" className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sale ID</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4} className="p-2"><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))}
                            {outletSales.length > 0 ? outletSales.slice(0,10).map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(sale.createdAt.seconds * 1000), { addSuffix: true })}</TableCell>
                                    <TableCell className="text-sm">{sale.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                                    <TableCell className="text-right font-bold">৳{sale.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                !isLoading && <TableRow><TableCell colSpan={4} className="text-center h-24">No sales recorded yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="online_orders" className="mt-4">
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Online order fulfillment feature is coming soon.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

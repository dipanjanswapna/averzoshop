import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function OutletsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Offline Outlets</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Outlet
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Outlet Management</CardTitle>
          <CardDescription>Manage inventory and sales for physical store locations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Offline outlet data will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

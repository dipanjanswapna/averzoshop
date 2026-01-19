
'use client';

import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetDialog } from '@/components/dashboard/asset-dialog';
import type { StoreAsset } from '@/types/store-asset';

export default function AppearancePage() {
  const { data: assets, isLoading } = useFirestoreQuery<StoreAsset>('store_assets');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<StoreAsset | null>(null);

  const sortedAssets = useMemo(() => {
    if (!assets) return [];
    return [...assets].sort((a, b) => a.id.localeCompare(b.id));
  }, [assets]);

  const handleAddNew = () => {
    setAssetToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (asset: StoreAsset) => {
    setAssetToEdit(asset);
    setIsDialogOpen(true);
  };
  
  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-10 w-10" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Appearance</h1>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Asset
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Store Assets</CardTitle>
            <CardDescription>Manage hero banners and promotional images across your storefront.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Preview</TableHead>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : sortedAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted">
                        <ImageIcon className="h-6 w-6 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        <img src={asset.imageUrl} alt={asset.description} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                    <TableCell><Badge variant="outline">{asset.assetType}</Badge></TableCell>
                    <TableCell><Badge>{asset.categorySlug}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(asset)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AssetDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        assetToEdit={assetToEdit} 
      />
    </>
  );
}


  
'use client';

import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Image as ImageIcon, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetDialog } from '@/components/dashboard/asset-dialog';
import type { StoreAsset } from '@/types/store-asset';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteDoc, doc } from 'firebase/firestore';

export default function AppearancePage() {
  const { data: assets, isLoading } = useFirestoreQuery<StoreAsset>('store_assets');
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<StoreAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<StoreAsset | null>(null);
  
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const sortedAssets = useMemo(() => {
    if (!assets) return [];
    return [...assets].sort((a, b) => a.id.localeCompare(b.id));
  }, [assets]);

  const handleAddNew = () => {
    setAssetToEdit(null);
    setIsAssetDialogOpen(true);
  };

  const handleEdit = (asset: StoreAsset) => {
    setAssetToEdit(asset);
    setIsAssetDialogOpen(true);
  };
  
  const handleDeleteConfirmation = (asset: StoreAsset) => {
    setAssetToDelete(asset);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'store_assets', assetToDelete.id));
      toast({
        title: 'Asset Deleted',
        description: `Asset "${assetToDelete.id}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting asset: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete asset.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };
  
  const renderDesktopSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-12 w-20 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  const renderMobileSkeleton = () => (
     [...Array(3)].map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
          <CardFooter className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardFooter>
        </Card>
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
            {/* Desktop Table */}
            <div className="hidden md:block">
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
                  {isLoading ? renderDesktopSkeleton() : sortedAssets.map((asset) => (
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
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteConfirmation(asset)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? renderMobileSkeleton() : sortedAssets.map((asset) => (
                <Card key={asset.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-mono">{asset.id}</CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 -mt-2 -mr-2"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEdit(asset)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteConfirmation(asset)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                         <ImageIcon className="h-8 w-8 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                         <img src={asset.imageUrl} alt={asset.description} className="absolute inset-0 w-full h-full object-cover" />
                       </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">{asset.assetType}</Badge>
                        <Badge>{asset.categorySlug}</Badge>
                         {asset.link && <Badge variant="secondary" className="flex items-center gap-1"><Link2 size={12} /> {asset.link}</Badge>}
                    </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <AssetDialog 
        open={isAssetDialogOpen} 
        onOpenChange={setIsAssetDialogOpen}
        assetToEdit={assetToEdit} 
      />
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset
              "{assetToDelete?.id}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

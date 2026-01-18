
'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Wishlist, WishlistItem } from '@/types/wishlist';
import { Product, ProductVariant } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, PlusCircle, ShoppingBag, Trash2, Edit, MoreVertical, Share2, Copy, Lock, Unlock, Star, Package, Copy as CopyIcon, Move } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { sort } from 'fast-sort';

function WishlistItemCard({ item, product, onRemove, onUpdate, onMoveCopy }: { item: WishlistItem, product: Product, onRemove: () => void, onUpdate: (updates: Partial<WishlistItem>) => void, onMoveCopy: () => void }) {
    const { addItem } = useCart();
    const [notes, setNotes] = useState(item.notes || '');
    const [quantity, setQuantity] = useState(item.quantity);

    const handleAddToCart = () => {
        const variant = product.variants.find(v => v.stock > 0) || product.variants[0];
        if (variant) {
            addItem(product, variant, quantity);
            toast({ title: "Added to Bag", description: `${quantity} x ${product.name} added.`});
        }
    };
    
    const { toast } = useToast();

    const handleNoteBlur = () => {
        if (notes !== item.notes) {
            onUpdate({ notes });
        }
    };
    
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
            onUpdate({ quantity: newQuantity });
        }
    };

    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col gap-4 h-full">
                <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                         <Image src={product.image} alt={product.name} fill className="rounded-lg object-cover" />
                         {product.total_stock <= 0 && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Badge variant="destructive">Out of Stock</Badge></div>}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                        <p className="text-primary font-bold text-lg">৳{product.price.toFixed(2)}</p>
                    </div>
                </div>
                <div className="space-y-3 flex-grow flex flex-col justify-end">
                    <div className="flex items-center gap-2">
                        <label htmlFor={`qty-${item.productId}`} className="text-xs font-medium">Qty:</label>
                        <Input
                            id={`qty-${item.productId}`}
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            onBlur={() => handleQuantityChange(quantity)}
                            className="text-xs h-8 w-16"
                        />
                    </div>
                    <Input
                        placeholder="Add a note..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNoteBlur}
                        className="text-xs h-8"
                    />
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="flex-1" onClick={handleAddToCart} disabled={product.total_stock <= 0}><ShoppingBag size={14} className="mr-2"/> Add to Bag</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="outline" className="h-9 w-9"><MoreVertical size={16} /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onMoveCopy}><Move size={14} className="mr-2"/> Move/Copy</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onRemove} className="text-destructive"><Trash2 size={14} className="mr-2"/> Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyWishlistPage() {
    const { user, userData, firestore } = useAuth();
    const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
    const { toast } = useToast();
    const { addItem } = useCart();

    const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);
    const [newWishlistName, setNewWishlistName] = useState('');
    const [editingListName, setEditingListName] = useState<string | null>(null);
    const [tempListName, setTempListName] = useState('');
    const [sortBy, setSortBy] = useState('addedAt-desc');
    const [itemToMove, setItemToMove] = useState<{ item: WishlistItem, product: Product } | null>(null);
    const [isMoveCopyOpen, setIsMoveCopyOpen] = useState(false);

    const wishlists = useMemo(() => userData?.wishlists || [], [userData]);
    
    useEffect(() => {
        if (!selectedWishlistId && wishlists.length > 0) {
            const defaultList = wishlists.find(w => w.isDefault) || wishlists[0];
            setSelectedWishlistId(defaultList.id);
        }
    }, [wishlists, selectedWishlistId]);
    
    const selectedWishlist = useMemo(() => {
        return wishlists.find(w => w.id === selectedWishlistId);
    }, [wishlists, selectedWishlistId]);

    const handleUpdateWishlists = useCallback(async (updatedWishlists: Wishlist[], successMessage?: string) => {
        if (!user || !firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        try {
            await updateDoc(userRef, { wishlists: updatedWishlists });
            if (successMessage) {
                toast({ title: successMessage });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed' });
        }
    }, [user, firestore, toast]);

    const handleCreateWishlist = async () => {
        if (!newWishlistName.trim()) {
            toast({ variant: 'destructive', title: 'Name is required' });
            return;
        }
        const newWishlist: Wishlist = {
            id: Date.now().toString(),
            name: newWishlistName,
            isPublic: false,
            items: [],
            quantity: 1,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isDefault: wishlists.length === 0, // First list is default
        };
        await handleUpdateWishlists([...wishlists, newWishlist], 'Wishlist Created!');
        setNewWishlistName('');
        setSelectedWishlistId(newWishlist.id);
    };
    
    const handleRemoveItem = (productId: string) => {
        if (!selectedWishlistId) return;
        const updatedWishlists = wishlists.map(w => 
            w.id === selectedWishlistId 
            ? { ...w, items: w.items.filter(i => i.productId !== productId), updatedAt: Timestamp.now() } 
            : w
        );
        handleUpdateWishlists(updatedWishlists, 'Item removed.');
    };

    const handleUpdateItem = (productId: string, updates: Partial<WishlistItem>) => {
        if (!selectedWishlistId) return;
        const updatedWishlists = wishlists.map(w => 
            w.id === selectedWishlistId 
            ? { ...w, items: w.items.map(i => i.productId === productId ? { ...i, ...updates } : i), updatedAt: Timestamp.now() } 
            : w
        );
        handleUpdateWishlists(updatedWishlists);
    };

    const handleTogglePublic = (wishlistId: string) => {
        const updatedWishlists = wishlists.map(w => w.id === wishlistId ? { ...w, isPublic: !w.isPublic } : w);
        handleUpdateWishlists(updatedWishlists, `Wishlist is now ${!selectedWishlist?.isPublic ? 'public' : 'private'}.`);
    };
    
    const handleShare = (wishlistId: string) => {
        const url = `${window.location.origin}/wishlist/view?userId=${user?.uid}&wishlistId=${wishlistId}`;
        navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'Public wishlist link copied to clipboard.' });
    };

    const handleDeleteWishlist = (wishlistId: string) => {
        if (!window.confirm("Are you sure you want to delete this wishlist? This cannot be undone.")) return;

        const updatedWishlists = wishlists.filter(w => w.id !== wishlistId);
        if (selectedWishlistId === wishlistId) {
            setSelectedWishlistId(updatedWishlists.length > 0 ? updatedWishlists[0].id : null);
        }
        handleUpdateWishlists(updatedWishlists, "Wishlist deleted.");
    };

    const handleRenameWishlist = (wishlistId: string) => {
        if (!tempListName.trim()) return;
        const updatedWishlists = wishlists.map(w => w.id === wishlistId ? { ...w, name: tempListName } : w);
        handleUpdateWishlists(updatedWishlists, "Wishlist renamed.");
        setEditingListName(null);
        setTempListName('');
    };

    const handleSetDefault = (wishlistId: string) => {
        const updatedWishlists = wishlists.map(w => ({ ...w, isDefault: w.id === wishlistId }));
        handleUpdateWishlists(updatedWishlists, "Default wishlist set.");
    };

    const handleAddAllToCart = () => {
        if (!selectedWishlist) return;
        let itemsAdded = 0;
        selectedWishlist.items.forEach(item => {
            const product = allProducts?.find(p => p.id === item.productId);
            const variant = product?.variants.find(v => v.stock > 0) || product?.variants[0];
            if (product && variant && product.total_stock > 0) {
                addItem(product, variant, item.quantity);
                itemsAdded++;
            }
        });
        if (itemsAdded > 0) {
            toast({ title: `${itemsAdded} items added to your bag.` });
        } else {
            toast({ variant: 'destructive', title: 'No items could be added', description: 'All items in this wishlist may be out of stock.'});
        }
    };

    const handleMoveCopy = async (targetListId: string, action: 'move' | 'copy') => {
        if (!itemToMove || !selectedWishlistId) return;

        const { item: itemToProcess } = itemToMove;
        let sourceListModified = false;

        const updatedWishlists = wishlists.map(w => {
            // Add to target list
            if (w.id === targetListId) {
                const itemExists = w.items.some(i => i.productId === itemToProcess.productId);
                if (itemExists) {
                    toast({ variant: 'destructive', title: 'Item already in list' });
                    return w; // Don't modify if item exists
                }
                return { ...w, items: [...w.items, itemToProcess], updatedAt: Timestamp.now() };
            }
            // Remove from source list if it's a 'move' action
            if (w.id === selectedWishlistId && action === 'move') {
                sourceListModified = true;
                return { ...w, items: w.items.filter(i => i.productId !== itemToProcess.productId), updatedAt: Timestamp.now() };
            }
            return w;
        });

        // This handles the case where target and source are the same in a 'copy' action, so we don't proceed
        if (action === 'copy' && targetListId === selectedWishlistId) {
            toast({ variant: 'destructive', title: 'Item already in this list.' });
            setIsMoveCopyOpen(false);
            return;
        }

        await handleUpdateWishlists(updatedWishlists, `Item ${action}ed successfully.`);
        setIsMoveCopyOpen(false);
        setItemToMove(null);
    }
    
    const sortedWishlistProducts = useMemo(() => {
        if (!selectedWishlist || !allProducts) return [];
        const productMap = new Map(allProducts.map(p => [p.id, p]));
        const products = selectedWishlist.items
            .map(item => ({ item, product: productMap.get(item.productId) }))
            .filter(data => data.product) as { item: WishlistItem, product: Product }[];
        
        const [sortKey, direction] = sortBy.split('-');
        return sort(products).by({
            [direction]: (p: any) => {
                if (sortKey === 'price') return p.product.price;
                if (sortKey === 'name') return p.product.name;
                return p.item.addedAt.toMillis();
            }
        });

    }, [selectedWishlist, allProducts, sortBy]);


    if (productsLoading) return <div className="p-6"><Skeleton className="h-96 w-full" /></div>;

    return (
        <>
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold font-headline">My Wishlists</h1>
                {wishlists.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                        <Card className="lg:col-span-1 lg:sticky top-28">
                             <CardContent className="p-3">
                                <Dialog>
                                    <DialogTrigger asChild><Button className="w-full mb-3"><PlusCircle size={16} className="mr-2"/> New List</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Create a New Wishlist</DialogTitle></DialogHeader>
                                        <Input placeholder="E.g., Birthday Gifts" value={newWishlistName} onChange={(e) => setNewWishlistName(e.target.value)} />
                                        <DialogFooter><Button onClick={handleCreateWishlist}>Create</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <div className="space-y-1">
                                    {wishlists.map(w => (
                                        <button key={w.id} onClick={() => setSelectedWishlistId(w.id)} className={cn("w-full text-left p-2 rounded-md text-sm font-medium flex items-center gap-2", selectedWishlistId === w.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}>
                                            {w.isDefault && <Star size={14} className="fill-yellow-400 text-yellow-500" />}
                                            <span className="flex-1 truncate">{w.name}</span>
                                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{w.items.length}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="lg:col-span-3 space-y-6">
                            {selectedWishlist ? (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-6">
                                             {editingListName === selectedWishlist.id ? (
                                                <div className="flex gap-2">
                                                    <Input defaultValue={selectedWishlist.name} onChange={(e) => setTempListName(e.target.value)} autoFocus onBlur={() => handleRenameWishlist(selectedWishlist.id)} />
                                                    <Button onClick={() => handleRenameWishlist(selectedWishlist.id)}>Save</Button>
                                                </div>
                                            ) : (
                                                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">{selectedWishlist.name} <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingListName(selectedWishlist.id); setTempListName(selectedWishlist.name); }}><Edit size={16}/></Button></h2>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Select value={sortBy} onValueChange={setSortBy}>
                                                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="addedAt-desc">Sort by: Newest</SelectItem>
                                                        <SelectItem value="addedAt-asc">Sort by: Oldest</SelectItem>
                                                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreVertical size={16}/></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleSetDefault(selectedWishlist.id)} disabled={selectedWishlist.isDefault}><Star size={14} className="mr-2"/> Set as Default</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleTogglePublic(selectedWishlist.id)}>{selectedWishlist.isPublic ? <Lock size={14} className="mr-2"/> : <Unlock size={14} className="mr-2"/>} Make {selectedWishlist.isPublic ? 'Private' : 'Public'}</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleShare(selectedWishlist.id)} disabled={!selectedWishlist.isPublic}><Share2 size={14} className="mr-2"/> Share</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={handleAddAllToCart}><ShoppingBag size={14} className="mr-2"/>Add All to Bag</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDeleteWishlist(selectedWishlist.id)} className="text-destructive"><Trash2 size={14} className="mr-2"/> Delete List</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sortedWishlistProducts.map(({ item, product }) => (
                                                <WishlistItemCard 
                                                    key={item.productId}
                                                    item={item}
                                                    product={product}
                                                    onRemove={() => handleRemoveItem(item.productId)}
                                                    onUpdate={(updates) => handleUpdateItem(item.productId, updates)}
                                                    onMoveCopy={() => { setItemToMove({ item, product }); setIsMoveCopyOpen(true); }}
                                                />
                                            ))}
                                        </div>
                                        {sortedWishlistProducts.length === 0 && <p className="text-center text-muted-foreground py-10">This wishlist is empty. Add some products!</p>}
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
                        <p className="text-muted-foreground">Start by creating a new list and adding your favorite products!</p>
                    </div>
                )}
            </div>
            
            {itemToMove && (
                 <Dialog open={isMoveCopyOpen} onOpenChange={setIsMoveCopyOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Move/Copy Item</DialogTitle>
                            <DialogDescription>Move or copy "{itemToMove.product.name}" to another list.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            {wishlists.filter(w => w.id !== selectedWishlistId).map(list => (
                                <div key={list.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <span>{list.name}</span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleMoveCopy(list.id, 'copy')}><CopyIcon size={14} className="mr-2"/>Copy</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleMoveCopy(list.id, 'move')}><Move size={14} className="mr-2"/>Move</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}


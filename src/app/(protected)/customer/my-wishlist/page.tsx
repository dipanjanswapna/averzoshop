'use client';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Wishlist, WishlistItem } from '@/types/wishlist';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, PlusCircle, ShoppingBag, Trash2, Edit, MoreVertical, Share2, Copy, Lock, Unlock } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';

function WishlistItemCard({ item, product, onRemove, onUpdateNote }: { item: WishlistItem, product: Product, onRemove: () => void, onUpdateNote: (notes: string) => void }) {
    const { addItem } = useCart();
    const [notes, setNotes] = useState(item.notes || '');

    const handleAddToCart = () => {
        const variant = product.variants.find(v => v.stock > 0) || product.variants[0];
        if (variant) {
            addItem(product, variant);
        }
    };

    const handleNoteBlur = () => {
        if (notes !== item.notes) {
            onUpdateNote(notes);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 flex gap-4">
                <Image src={product.image} alt={product.name} width={100} height={100} className="rounded-lg object-cover aspect-square" />
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-sm">{product.name}</h3>
                        <p className="text-primary font-bold">৳{product.price.toFixed(2)}</p>
                    </div>
                    <Input
                        placeholder="Add a note..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNoteBlur}
                        className="text-xs h-8 mt-2"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" className="flex-1" onClick={handleAddToCart}><ShoppingBag size={14} className="mr-2"/> Add to Bag</Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={onRemove}><Trash2 size={16} /></Button>
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
    const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);
    const [newWishlistName, setNewWishlistName] = useState('');

    const wishlists = useMemo(() => userData?.wishlists || [], [userData]);
    
    useEffect(() => {
        if (!selectedWishlistId && wishlists.length > 0) {
            setSelectedWishlistId(wishlists[0].id);
        }
    }, [wishlists, selectedWishlistId]);
    
    const selectedWishlist = useMemo(() => {
        return wishlists.find(w => w.id === selectedWishlistId);
    }, [wishlists, selectedWishlistId]);

    const wishlistProducts = useMemo(() => {
        if (!selectedWishlist || !allProducts) return [];
        const productMap = new Map(allProducts.map(p => [p.id, p]));
        return selectedWishlist.items
            .map(item => ({ item, product: productMap.get(item.productId) }))
            .filter(data => data.product) as { item: WishlistItem, product: Product }[];
    }, [selectedWishlist, allProducts]);

    const handleUpdateWishlists = async (updatedWishlists: Wishlist[]) => {
        if (!user || !firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, { wishlists: updatedWishlists });
    };

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
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        await handleUpdateWishlists([...wishlists, newWishlist]);
        setNewWishlistName('');
        setSelectedWishlistId(newWishlist.id);
        toast({ title: 'Wishlist Created!' });
    };
    
    const handleRemoveItem = (productId: string) => {
        if (!selectedWishlistId) return;
        const updatedWishlists = wishlists.map(w => {
            if (w.id === selectedWishlistId) {
                return { ...w, items: w.items.filter(i => i.productId !== productId), updatedAt: Timestamp.now() };
            }
            return w;
        });
        handleUpdateWishlists(updatedWishlists);
    };

    const handleUpdateNote = (productId: string, notes: string) => {
        if (!selectedWishlistId) return;
        const updatedWishlists = wishlists.map(w => {
            if (w.id === selectedWishlistId) {
                return {
                    ...w,
                    items: w.items.map(i => i.productId === productId ? { ...i, notes } : i),
                    updatedAt: Timestamp.now(),
                };
            }
            return w;
        });
        handleUpdateWishlists(updatedWishlists);
    };

    const handleTogglePublic = (wishlistId: string) => {
        const updatedWishlists = wishlists.map(w => w.id === wishlistId ? { ...w, isPublic: !w.isPublic } : w);
        handleUpdateWishlists(updatedWishlists);
    };
    
    const handleShare = (wishlistId: string) => {
        const url = `${window.location.origin}/wishlist/view?userId=${user?.uid}&wishlistId=${wishlistId}`;
        navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'Public wishlist link copied to clipboard.' });
    };

    if (productsLoading) return <div className="p-6">Loading...</div>;

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">My Wishlists</h1>
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Manage Your Favorites</CardTitle>
                        <CardDescription>Organize your saved items into different lists.</CardDescription>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild><Button><PlusCircle size={16} className="mr-2"/> Create New List</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create a New Wishlist</DialogTitle></DialogHeader>
                            <Input placeholder="E.g., Birthday Gifts" value={newWishlistName} onChange={(e) => setNewWishlistName(e.target.value)} />
                            <DialogFooter><Button onClick={handleCreateWishlist}>Create</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {wishlists.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Select value={selectedWishlistId || ''} onValueChange={setSelectedWishlistId}>
                                    <SelectTrigger className="w-full md:w-[250px]"><SelectValue placeholder="Select a wishlist" /></SelectTrigger>
                                    <SelectContent>
                                        {wishlists.map(w => <SelectItem key={w.id} value={w.id}>{w.name} ({w.items.length})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {selectedWishlist && (
                                     <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleTogglePublic(selectedWishlist.id)}>
                                            {selectedWishlist.isPublic ? <Unlock size={16} className="text-green-600" /> : <Lock size={16} />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleShare(selectedWishlist.id)} disabled={!selectedWishlist.isPublic}>
                                            <Share2 size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wishlistProducts.map(({ item, product }) => (
                                    <WishlistItemCard 
                                        key={item.productId}
                                        item={item}
                                        product={product}
                                        onRemove={() => handleRemoveItem(item.productId)}
                                        onUpdateNote={(notes) => handleUpdateNote(item.productId, notes)}
                                    />
                                ))}
                            </div>
                            {wishlistProducts.length === 0 && <p className="text-center text-muted-foreground py-10">This wishlist is empty.</p>}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
                            <p className="text-muted-foreground">Start by creating a new list and adding your favorite products!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

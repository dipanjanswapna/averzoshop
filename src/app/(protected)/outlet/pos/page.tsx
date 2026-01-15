
'use client';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';

type CartItem = {
    product: Product;
    quantity: number;
};

export default function POSPage() {
    const { user, userData } = useAuth();
    const { data: allProducts, isLoading } = useFirestoreQuery<Product>('products');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { firestore } = useFirebase();

    const outletId = useMemo(() => userData?.outletId, [userData]);

    const availableProducts = useMemo(() => {
        if (!allProducts || !outletId) return [];
        return allProducts
            .filter(p => (p.outlet_stocks?.[outletId] ?? 0) > 0)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allProducts, outletId, searchTerm]);

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(prev => prev.filter(item => item.product.id !== productId));
        } else {
            setCart(prev => prev.map(item =>
                item.product.id === productId ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const handleCompleteSale = async () => {
        if (!firestore || !user || !outletId || cart.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Cannot complete sale. Check if you are logged in and the cart is not empty.',
            });
            return;
        }

        setIsProcessing(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                const saleItems = [];

                for (const cartItem of cart) {
                    const productRef = doc(firestore, 'products', cartItem.product.id);
                    const productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) {
                        throw new Error(`Product ${cartItem.product.name} not found.`);
                    }

                    const currentData = productDoc.data() as Product;
                    const currentOutletStock = currentData.outlet_stocks?.[outletId] ?? 0;

                    if (currentOutletStock < cartItem.quantity) {
                        throw new Error(`Not enough stock for ${cartItem.product.name}. Available: ${currentOutletStock}`);
                    }

                    const newOutletStock = currentOutletStock - cartItem.quantity;
                    const newTotalStock = (currentData.total_stock ?? 0) - cartItem.quantity;

                    transaction.update(productRef, {
                        [`outlet_stocks.${outletId}`]: newOutletStock,
                        total_stock: newTotalStock
                    });

                    saleItems.push({
                        productId: cartItem.product.id,
                        productName: cartItem.product.name,
                        quantity: cartItem.quantity,
                        price: cartItem.product.price,
                    });
                }
                
                const salesRef = collection(firestore, 'pos_sales');
                transaction.set(doc(salesRef), {
                    outletId: outletId,
                    soldBy: user.uid,
                    items: saleItems,
                    totalAmount: cartSubtotal,
                    paymentMethod: 'cash', // Placeholder
                    createdAt: serverTimestamp(),
                });
            });

            toast({
                title: 'Sale Completed!',
                description: `Successfully recorded sale of ${totalItems} items.`,
            });
            setCart([]);

        } catch (error: any) {
            console.error('Sale transaction failed: ', error);
            toast({
                variant: 'destructive',
                title: 'Sale Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
            <div className="flex-shrink-0 p-4 border-b">
                 <h1 className="text-2xl font-bold font-headline">Point of Sale</h1>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
                {/* Product List */}
                <div className="md:col-span-2 flex flex-col gap-4 h-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name or scan barcode..."
                            className="pl-10 h-12 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="flex-grow border rounded-lg">
                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                            {isLoading && Array.from({ length: 10 }).map((_, i) => <Card key={i} className="animate-pulse bg-muted aspect-square" />)}
                            {availableProducts.map(product => (
                                <Card key={product.id} onClick={() => addToCart(product)} className="cursor-pointer hover:border-primary transition-colors flex flex-col">
                                    <CardContent className="p-0 flex-grow">
                                        <div className="relative aspect-square">
                                            <Image src={product.image || 'https://placehold.co/300'} alt={product.name} fill className="object-cover rounded-t-lg" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-2 flex-col items-start">
                                        <p className="text-xs font-semibold truncate w-full">{product.name}</p>
                                        <p className="text-sm font-bold text-primary">৳{product.price}</p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        {!isLoading && availableProducts.length === 0 && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>No products found for &quot;{searchTerm}&quot;</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Cart Section */}
                <Card className="md:col-span-1 flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <ShoppingCart /> Cart
                        </CardTitle>
                        <CardDescription>
                            {totalItems} items in cart
                        </CardDescription>
                    </CardHeader>
                    <ScrollArea className="flex-grow">
                        <CardContent className="space-y-4">
                             {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <ShoppingCart className="w-16 h-16" />
                                    <p className="mt-4">Your cart is empty</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.product.id} className="flex items-center gap-4">
                                     <Image src={item.product.image || 'https://placehold.co/64'} alt={item.product.name} width={48} height={48} className="rounded-md object-cover w-12 h-12" />
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">৳{item.product.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                                        <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                                    </div>
                                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => updateQuantity(item.product.id, 0)}><XCircle className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </CardContent>
                    </ScrollArea>
                    <CardFooter className="flex-col items-stretch space-y-4 border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>৳{cartSubtotal.toFixed(2)}</span>
                        </div>
                        <Button 
                            size="lg" 
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCompleteSale}
                        >
                            {isProcessing ? 'Processing...' : 'Complete Sale'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

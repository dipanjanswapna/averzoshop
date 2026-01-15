
'use client';

import { useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import type { Product } from '@/types/product';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction, DocumentReference } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface CartItem extends Product {
    quantity: number;
}

export default function POSPage() {
    const { data: products, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
    const { firestore } = useFirebase();
    const { user } = useAuth();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (!searchTerm) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const addToCart = (product: Product) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id);
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
    };
    
    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart(cart.filter(item => item.id !== productId));
        } else {
            setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
        }
    };
    
    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    const completeSale = async () => {
        if (cart.length === 0 || !firestore || !user) return;
        setIsProcessing(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                // For simplicity, using a hardcoded outletId. In a real app, this would be dynamic.
                const outletId = "Dhanmondi Outlet"; 

                // 1. Create a new sale document
                const saleRef = collection(firestore, "pos_sales");
                await addDoc(saleRef, {
                    outletId: outletId,
                    soldBy: user.uid,
                    items: cart.map(item => ({
                        productId: item.id,
                        productName: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    totalAmount: subtotal,
                    paymentMethod: "cash", // Hardcoded for simplicity
                    createdAt: serverTimestamp(),
                });

                // 2. Update stock for each product in the cart
                for (const item of cart) {
                    const productRef = doc(firestore, 'products', item.id) as DocumentReference<Product>;
                    const productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) {
                        throw new Error(`Product ${item.name} not found!`);
                    }

                    const newStock = productDoc.data()!.stock - item.quantity;
                    if (newStock < 0) {
                        throw new Error(`Not enough stock for ${item.name}.`);
                    }
                    transaction.update(productRef, { stock: newStock });
                }
            });

            toast({
                title: "Sale Completed!",
                description: "The sale has been recorded and inventory updated."
            });
            setCart([]);

        } catch (error: any) {
            console.error("Sale failed: ", error);
            toast({
                variant: "destructive",
                title: "Sale Failed",
                description: error.message || "An unexpected error occurred."
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
            {/* Product Selection Column */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Point of Sale (POS)</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name or ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {productsLoading ? (
                                Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-muted animate-pulse rounded-lg aspect-square" />)
                            ) : (
                                filteredProducts.map(product => (
                                    <button key={product.id} onClick={() => addToCart(product)} className="border rounded-lg p-2 text-center hover:bg-accent transition-colors disabled:opacity-50" disabled={product.stock <= 0}>
                                        <p className="text-sm font-semibold truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">৳{product.price.toFixed(2)}</p>
                                        <p className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Cart & Checkout Column */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart /> Current Sale
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-32 text-center">Qty</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Your cart is empty.</TableCell>
                                    </TableRow>
                                ) : (
                                    cart.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                                                    <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)} className="h-8 w-12 text-center" />
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">৳{(item.price * item.quantity).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}><XCircle className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 !p-6 border-t">
                    <div className="w-full flex justify-between text-lg font-bold">
                        <span>Total ({totalItems} items)</span>
                        <span>৳{subtotal.toFixed(2)}</span>
                    </div>
                    <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={completeSale} 
                        disabled={cart.length === 0 || isProcessing}>
                        {isProcessing ? 'Processing...' : 'Complete Sale'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

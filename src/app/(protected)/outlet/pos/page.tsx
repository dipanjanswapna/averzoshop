
'use client';
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product, ProductVariant } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection, addDoc } from 'firebase/firestore';

type CartItem = {
    product: Product;
    variant: ProductVariant;
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
            .filter(p => p.status === 'approved' && p.total_stock > 0 && (p.outlet_stocks?.[outletId] ?? 0) > 0)
            .filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.baseSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.variants?.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [allProducts, outletId, searchTerm]);

    const findVariantInStock = (product: Product): ProductVariant | null => {
        if (!outletId) return null;
        
        // Find a variant that has stock in the current outlet
        const variantInStock = product.variants?.find(v => {
            // Assuming variant-level stock is not tracked per outlet yet, we check total variant stock
            // and main product outlet_stock. This can be refined.
            const productStockInOutlet = product.outlet_stocks?.[outletId] ?? 0;
            return v.stock > 0 && productStockInOutlet > 0;
        });

        // Fallback to the first variant if none specifically match, but the product has outlet stock
        if (!variantInStock && (product.outlet_stocks?.[outletId] ?? 0) > 0) {
            return product.variants?.[0] || null;
        }

        return variantInStock || null;
    }

    const addToCart = (product: Product, variant: ProductVariant | null) => {
        if (!variant) {
            toast({ variant: 'destructive', title: 'Variant not available', description: 'Please select a valid product variant.' });
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.variant.sku === variant.sku);
            if (existingItem) {
                const outletStock = product.outlet_stocks?.[outletId || ''] ?? 0;
                if (existingItem.quantity >= outletStock || existingItem.quantity >= variant.stock) {
                    toast({ variant: 'destructive', title: 'Stock limit reached' });
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.variant.sku === variant.sku
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, variant, quantity: 1 }];
        });
    };

    const updateQuantity = (variantSku: string, newQuantity: number) => {
        const cartItem = cart.find(item => item.variant.sku === variantSku);
        if (!cartItem) return;

        if (newQuantity > 0) {
            const outletStock = cartItem.product.outlet_stocks?.[outletId || ''] ?? 0;
            if (newQuantity > outletStock || newQuantity > cartItem.variant.stock) {
                toast({ variant: 'destructive', title: 'Stock limit reached' });
                return;
            }
            setCart(prev => prev.map(item =>
                item.variant.sku === variantSku ? { ...item, quantity: newQuantity } : item
            ));
        } else {
            setCart(prev => prev.filter(item => item.variant.sku !== variantSku));
        }
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (availableProducts.length === 1) {
            const product = availableProducts[0];
            const variant = findVariantInStock(product);
            if(variant){
                addToCart(product, variant);
                setSearchTerm('');
            }
        }
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);
    }, [cart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const handleCompleteSale = async () => {
        if (!firestore || !user || !outletId || cart.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot complete sale. Check login and cart.' });
            return;
        }
    
        setIsProcessing(true);
    
        try {
            await runTransaction(firestore, async (transaction) => {
                // 1. All reads first
                const productRefs = cart.map(item => doc(firestore, 'products', item.product.id));
                const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
    
                const saleItems: any[] = [];
                const productUpdates: any[] = [];
    
                // 2. Process data and prepare writes
                for (let i = 0; i < cart.length; i++) {
                    const cartItem = cart[i];
                    const productDoc = productDocs[i];
    
                    if (!productDoc.exists()) {
                        throw new Error(`Product ${cartItem.product.name} not found.`);
                    }
    
                    const currentData = productDoc.data() as Product;
                    const currentOutletStock = currentData.outlet_stocks?.[outletId] ?? 0;
                    
                    const variantIndex = currentData.variants.findIndex(v => v.sku === cartItem.variant.sku);
                    if (variantIndex === -1) {
                        throw new Error(`Variant ${cartItem.variant.sku} not found.`);
                    }
                    
                    const currentVariantStock = currentData.variants[variantIndex].stock;
    
                    if (currentOutletStock < cartItem.quantity || currentVariantStock < cartItem.quantity) {
                        throw new Error(`Not enough stock for ${cartItem.product.name}. Available: ${Math.min(currentOutletStock, currentVariantStock)}`);
                    }
    
                    // Prepare updates without actually writing them yet
                    const newVariants = [...currentData.variants];
                    newVariants[variantIndex].stock -= cartItem.quantity;
                    
                    productUpdates.push({
                        ref: productRefs[i],
                        data: {
                            [`outlet_stocks.${outletId}`]: currentOutletStock - cartItem.quantity,
                            total_stock: currentData.total_stock - cartItem.quantity,
                            variants: newVariants,
                        }
                    });
    
                    saleItems.push({
                        productId: cartItem.product.id,
                        productName: cartItem.product.name,
                        variantSku: cartItem.variant.sku,
                        quantity: cartItem.quantity,
                        price: cartItem.variant.price,
                    });
                }
    
                // 3. All writes last
                productUpdates.forEach(update => {
                    transaction.update(update.ref, update.data);
                });
                
                const salesRef = collection(firestore, 'pos_sales');
                transaction.set(doc(salesRef), {
                    outletId,
                    soldBy: user.uid,
                    items: saleItems,
                    totalAmount: cartSubtotal,
                    paymentMethod: 'cash',
                    createdAt: serverTimestamp(),
                });
            });
    
            toast({ title: 'Sale Completed!', description: `Successfully recorded sale of ${totalItems} items.` });
            setCart([]);
    
        } catch (error: any) {
            console.error('Sale transaction failed: ', error);
            toast({ variant: 'destructive', title: 'Sale Failed', description: error.message || 'An unexpected error occurred.' });
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
                <div className="md:col-span-2 flex flex-col gap-4 h-full">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search products by name or scan barcode/SKU..."
                                className="pl-10 h-12 text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </form>
                    <ScrollArea className="flex-grow border rounded-lg">
                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                            {isLoading && Array.from({ length: 10 }).map((_, i) => <Card key={i} className="animate-pulse bg-muted aspect-square" />)}
                            {availableProducts.map(product => {
                                const variant = findVariantInStock(product);
                                return (
                                <Card key={product.id} onClick={() => addToCart(product, variant)} className="cursor-pointer hover:border-primary transition-colors flex flex-col">
                                    <CardContent className="p-0 flex-grow">
                                        <div className="relative aspect-square">
                                            <Image src={product.image || 'https://placehold.co/300'} alt={product.name} fill className="object-cover rounded-t-lg" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-2 flex-col items-start">
                                        <p className="text-xs font-semibold truncate w-full">{product.name}</p>
                                        <p className="text-sm font-bold text-primary">৳{variant?.price ?? product.price}</p>
                                    </CardFooter>
                                </Card>
                            )})}
                        </div>
                        {!isLoading && availableProducts.length === 0 && (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>{searchTerm ? `No products found for "${searchTerm}"` : 'No products available in this outlet.'}</p>
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
                                <div key={item.variant.sku} className="flex items-center gap-4">
                                     <Image src={item.product.image || 'https://placehold.co/64'} alt={item.product.name} width={48} height={48} className="rounded-md object-cover w-12 h-12" />
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.variant.size} {item.variant.color}</p>
                                        <p className="text-xs text-muted-foreground">৳{item.variant.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                                        <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                                    </div>
                                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => updateQuantity(item.variant.sku, 0)}><XCircle className="h-4 w-4" /></Button>
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

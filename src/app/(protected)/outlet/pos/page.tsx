'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product, ProductVariant } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection } from 'firebase/firestore';
import { PrintableReceipt } from '@/components/pos/PrintableReceipt';
import type { POSSale } from '@/types/pos';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiptPreviewDialog } from '@/components/pos/ReceiptPreviewDialog';


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
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
    const [lastSale, setLastSale] = useState<POSSale | null>(null);
    const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);


    const outletId = useMemo(() => userData?.outletId, [userData]);

    const availableProducts = useMemo(() => {
        if (!allProducts || !outletId) return [];

        const productsInOutlet = allProducts
            .map(p => {
                const variantsArray = Array.isArray(p.variants) ? p.variants : Object.values(p.variants);
                const stockInOutlet = variantsArray.some(v => (v.outlet_stocks?.[outletId] ?? 0) > 0);
                
                if (p.status !== 'approved' || !stockInOutlet) return null;

                const searchableTerms = [
                    p.name.toLowerCase(),
                    p.baseSku.toLowerCase(),
                    ...variantsArray.map(v => v.sku.toLowerCase())
                ].join(' ');

                return { ...p, searchableTerms };
            })
            .filter((p): p is Product & { searchableTerms: string } => !!p);

        if (!searchTerm) {
            return productsInOutlet;
        }

        return productsInOutlet.filter(p => p.searchableTerms.includes(searchTerm.toLowerCase()));
    }, [allProducts, outletId, searchTerm]);

    const findVariantInStock = (product: Product, sku?: string): ProductVariant | null => {
        if (!outletId) return null;
        const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants);

        if (sku) {
            const variantBySku = variantsArray.find(v => v.sku.toLowerCase() === sku.toLowerCase() && (v.outlet_stocks?.[outletId] ?? 0) > 0);
            return variantBySku || null;
        }

        const variantInStock = variantsArray.find(v => (v.outlet_stocks?.[outletId] ?? 0) > 0);
        return variantInStock || null;
    }

    const addToCart = (product: Product, variant: ProductVariant | null) => {
        if (!variant || !outletId) {
            toast({ variant: 'destructive', title: 'Variant not available' });
            return;
        }
        const stockInOutlet = variant.outlet_stocks?.[outletId] ?? 0;
        if (stockInOutlet <= 0) {
             toast({ variant: 'destructive', title: 'Out of stock' });
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.variant.sku === variant.sku);
            if (existingItem) {
                if (existingItem.quantity >= stockInOutlet) {
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
        if (!cartItem || !outletId) return;

        if (newQuantity > 0) {
            const stockInOutlet = cartItem.variant.outlet_stocks?.[outletId] ?? 0;
            if (newQuantity > stockInOutlet) {
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
        const trimmedSearchTerm = searchTerm.trim().toLowerCase();
        if (!trimmedSearchTerm) return;
    
        // 1. Prioritize exact SKU match for barcode scanning
        if (allProducts && outletId) {
            for (const product of allProducts) {
                const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants);
                const variant = variantsArray.find(v => v.sku.toLowerCase() === trimmedSearchTerm);
    
                if (variant) {
                    // The addToCart function will handle stock checking and user feedback
                    addToCart(product, variant);
                    setSearchTerm(''); // Clear search field on successful scan
                    return; // Stop further processing
                }
            }
        }
    
        // 2. If no exact SKU match, it's a name search. The visual grid update is enough.
        // We can just give a toast if nothing is found after filtering.
        if (availableProducts.length === 0) {
            toast({ variant: 'destructive', title: 'Product Not Found', description: `No product matches "${searchTerm}".` });
        }
        // If it's a name search with multiple results, the grid shows them, which is the desired behavior.
        // No explicit toast is needed here, as it might be annoying. The user can see the results.
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);
    }, [cart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const handleCompleteSale = async () => {
        if (!firestore || !user || !outletId || cart.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot complete sale.' });
            return;
        }
    
        setIsProcessing(true);
        const saleId = doc(collection(firestore, 'id_generator')).id;
        const saleData: POSSale = {
            id: saleId,
            outletId,
            soldBy: user.uid,
            items: cart.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                variantSku: item.variant.sku,
                quantity: item.quantity,
                price: item.variant.price,
            })),
            totalAmount: cartSubtotal,
            paymentMethod: paymentMethod,
            createdAt: serverTimestamp(),
        };

        try {
            await runTransaction(firestore, async (transaction) => {
                const productRefs: Map<string, { ref: any; product: Product }> = new Map();

                // First, read all product documents to ensure atomicity and avoid race conditions
                for (const item of cart) {
                    if (!productRefs.has(item.product.id)) {
                         const productRef = doc(firestore, 'products', item.product.id);
                         const productDoc = await transaction.get(productRef);
                         if (!productDoc.exists()) {
                            throw new Error(`Product ${item.product.name} not found.`);
                         }
                         productRefs.set(item.product.id, { ref: productRef, product: productDoc.data() as Product });
                    }
                }

                // Then, perform all updates
                for (const item of cart) {
                    const { ref, product: productData } = productRefs.get(item.product.id)!;
                    
                    const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : [...Object.values(productData.variants)];
                    const variantIndex = variantsArray.findIndex(v => v.sku === item.variant.sku);

                    if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found.`);
                    
                    const currentStock = variantsArray[variantIndex].outlet_stocks?.[outletId] ?? 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Not enough stock for ${item.product.name}. Available: ${currentStock}`);
                    }
                    
                    // Modify the array in memory
                    variantsArray[variantIndex].stock -= item.quantity;
                    if (variantsArray[variantIndex].outlet_stocks) {
                       variantsArray[variantIndex].outlet_stocks![outletId] -= item.quantity;
                    }
                    
                    const newTotalStock = productData.total_stock - item.quantity;

                    // Write the entire modified array back
                    transaction.update(ref, {
                        variants: variantsArray,
                        total_stock: newTotalStock,
                    });
                }
    
                const salesRef = doc(firestore, 'pos_sales', saleId);
                transaction.set(salesRef, saleData);
            });
    
            toast({ title: 'Sale Completed!', description: 'Receipt is being prepared.' });
            setLastSale(saleData);
            setIsReceiptPreviewOpen(true);
            setCart([]);
            setSearchTerm('');
    
        } catch (error: any) {
            console.error('Sale transaction failed: ', error);
            toast({ variant: 'destructive', title: 'Sale Failed', description: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderProductSkeletons = () => (
        Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </div>
        ))
    );

    return (
         <>
            <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 no-print bg-muted/30">
                {/* Product Grid Section */}
                <div className="lg:col-span-3 flex flex-col gap-4 h-full">
                    <h1 className="text-2xl font-bold font-headline">Point of Sale</h1>
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Scan Barcode or Search products by name/SKU..."
                                className="pl-10 h-12 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </form>
                    <Card className="flex-1">
                        <ScrollArea className="h-[calc(100vh-230px)] rounded-lg">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                {isLoading ? renderProductSkeletons() : 
                                availableProducts.map(product => {
                                    if(!product) return null;
                                    const variant = findVariantInStock(product);
                                    return (
                                    <Card key={product.id} onClick={() => addToCart(product, variant)} className="cursor-pointer hover:border-primary transition-colors flex flex-col shadow-sm">
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
                                <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
                                    <p>{searchTerm ? `No products found for "${searchTerm}"` : 'No products available in this outlet. Check inventory.'}</p>
                                </div>
                            )}
                        </ScrollArea>
                    </Card>
                </div>

                {/* Cart Section */}
                <div className="lg:col-span-2 h-fit lg:h-full flex flex-col">
                    <Card className="flex-1 flex flex-col shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <ShoppingCart /> Current Sale
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-grow">
                             <CardContent className="space-y-4">
                                 {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <ShoppingCart className="w-16 h-16" />
                                        <p className="mt-4">Your cart is empty</p>
                                    </div>
                                ) : cart.map(item => (
                                    <div key={item.variant.sku} className="flex items-center gap-4 border-b pb-2">
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium truncate">{item.product.name} <span className="text-muted-foreground text-xs">({item.variant.sku})</span></p>
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
                        <CardFooter className="flex-col items-stretch space-y-4 border-t p-4 bg-muted/30">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total ({totalItems} items)</span>
                                <span>৳{cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Payment Method</label>
                                <div className='grid grid-cols-3 gap-2'>
                                    <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="flex-col h-16 gap-1"><Banknote size={20}/>Cash</Button>
                                    <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('card')} className="flex-col h-16 gap-1"><CreditCard size={20}/>Card</Button>
                                    <Button variant={paymentMethod === 'mobile' ? 'default' : 'outline'} onClick={() => setPaymentMethod('mobile')} className="flex-col h-16 gap-1"><Smartphone size={20}/>Mobile</Button>
                                </div>
                            </div>
                            <Button 
                                size="lg" 
                                disabled={cart.length === 0 || isProcessing}
                                onClick={handleCompleteSale}
                                className="h-14 text-lg"
                            >
                                {isProcessing ? 'Processing...' : 'Complete Sale'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            {lastSale && userData?.outletId && (
                <ReceiptPreviewDialog
                    open={isReceiptPreviewOpen}
                    onOpenChange={setIsReceiptPreviewOpen}
                    sale={lastSale}
                    outletId={userData.outletId}
                />
            )}
        </>
    );
}

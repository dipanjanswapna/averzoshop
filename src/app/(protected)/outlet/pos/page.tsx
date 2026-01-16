'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart, Banknote, CreditCard, Smartphone, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product, ProductVariant } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection } from 'firebase/firestore';
import type { POSSale } from '@/types/pos';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiptPreviewDialog } from '@/components/pos/ReceiptPreviewDialog';
import { CameraScanner } from '@/components/pos/CameraScanner';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type CartItem = {
    product: Product;
    variant: ProductVariant;
    quantity: number;
};

type SearchableVariant = ProductVariant & {
  product: Product;
  searchableTerms: string;
};

const CartPanel = ({
    cart,
    updateQuantity,
    totalItems,
    cartSubtotal,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    changeDue,
    isProcessing,
    handleCompleteSale
}: any) => (
    <div className="flex flex-col gap-4 h-full">
        {/* Customer Card */}
        <Card className="shadow-md flex-shrink-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User /> Customer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-2">
                    <Input placeholder="Search by phone number..." />
                    <Button variant="outline">Search</Button>
                </div>
                <div className="text-sm text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                    Default: Walk-in Customer
                </div>
            </CardContent>
        </Card>
        
        {/* Cart Section */}
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
                    ) : cart.map((item: CartItem) => (
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
                    <Label className='text-sm font-medium'>Payment Method</Label>
                    <div className='grid grid-cols-3 gap-2'>
                        <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="flex-col h-16 gap-1"><Banknote size={20}/>Cash</Button>
                        <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('card')} className="flex-col h-16 gap-1"><CreditCard size={20}/>Card</Button>
                        <Button variant={paymentMethod === 'mobile' ? 'default' : 'outline'} onClick={() => setPaymentMethod('mobile')} className="flex-col h-16 gap-1"><Smartphone size={20}/>Mobile</Button>
                    </div>
                </div>
                
                {paymentMethod === 'cash' && cart.length > 0 && (
                    <div className="space-y-4 p-4 border rounded-lg bg-background">
                        <div className="space-y-2">
                            <Label htmlFor="cash-received">Cash Received</Label>
                            <Input
                                id="cash-received"
                                type="number"
                                value={cashReceived || ''}
                                onChange={(e) => setCashReceived(Number(e.target.value))}
                                placeholder="Enter amount received"
                                className="h-12 text-lg font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[500, 1000, 2000].map(amt => (
                                <Button key={amt} type="button" variant="outline" onClick={() => setCashReceived((prev: number) => prev + amt)}>+ ৳{amt}</Button>
                            ))}
                             <Button type="button" variant="outline" onClick={() => setCashReceived(cartSubtotal)}>Exact</Button>
                             <Button type="button" variant="ghost" className="col-span-2 text-destructive hover:bg-destructive/10" onClick={() => setCashReceived(0)}>Clear</Button>
                        </div>
                        <div className={cn("p-3 rounded-md text-center", changeDue >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                            <span className="text-sm font-medium">Change Due: </span>
                            <span className="font-bold text-lg">৳ {Math.max(0, changeDue).toFixed(2)}</span>
                            {changeDue < 0 && <p className="text-xs">Need ৳{Math.abs(changeDue).toFixed(2)} more</p>}
                        </div>
                    </div>
                )}

                <Button 
                    size="lg" 
                    disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && cashReceived < cartSubtotal)}
                    onClick={handleCompleteSale}
                    className="h-14 text-lg"
                >
                    {isProcessing ? 'Processing...' : 'Complete Sale'}
                </Button>
            </CardFooter>
        </Card>
    </div>
);


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
    const [cashReceived, setCashReceived] = useState<number>(0);
    const [lastSale, setLastSale] = useState<(POSSale & { cashReceived?: number, changeDue?: number }) | null>(null);
    const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);


    const outletId = useMemo(() => userData?.outletId, [userData]);

    const availableVariants = useMemo(() => {
        if (!allProducts || !outletId) return [];

        const variants: SearchableVariant[] = [];
        allProducts.forEach(product => {
            if (product.status !== 'approved') return;

            const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});

            variantsArray.forEach(variant => {
                const stockInOutlet = variant.outlet_stocks?.[outletId] ?? 0;
                if (stockInOutlet > 0) {
                    const searchableTerms = [
                        product.name.toLowerCase(),
                        product.baseSku.toLowerCase(),
                        variant.sku.toLowerCase(),
                        variant.color?.toLowerCase(),
                        variant.size?.toLowerCase()
                    ].filter(Boolean).join(' ');

                    variants.push({
                        ...variant,
                        product: product,
                        searchableTerms: searchableTerms
                    });
                }
            });
        });

        if (!searchTerm) {
            return variants;
        }
        
        return variants.filter(v => v.searchableTerms.includes(searchTerm.toLowerCase()));

    }, [allProducts, outletId, searchTerm]);

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
    
    const findAndAddToCartBySku = (sku: string) => {
        const trimmedSku = sku.trim().toLowerCase();
        if (!trimmedSku || !allProducts || !outletId) return false;

        for (const product of allProducts) {
            const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants);
            const variant = variantsArray.find(v => v.sku.toLowerCase() === trimmedSku);
            
            if (variant) {
                const stockInOutlet = variant.outlet_stocks?.[outletId] ?? 0;
                if (stockInOutlet > 0) {
                    addToCart(product, variant);
                    return true; // Successfully found and added to cart
                }
            }
        }
        return false; // Not found or out of stock in this outlet
    };


    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const found = findAndAddToCartBySku(searchTerm);
        if (found) {
            setSearchTerm('');
        } else if (availableVariants.length === 0) {
            toast({ variant: 'destructive', title: 'Product Not Found', description: `No product matches "${searchTerm}".` });
        }
    };

    const handleCameraScan = (decodedText: string) => {
        const found = findAndAddToCartBySku(decodedText);
        if (found) {
            toast({ title: "Product Added", description: `Scanned item added to cart.` });
            setSearchTerm('');
        } else {
             toast({ variant: 'destructive', title: 'Product Not Found', description: `No product with barcode "${decodedText}" found in this outlet.` });
        }
    };


    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);
    }, [cart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);
    
    const changeDue = cashReceived - cartSubtotal;


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

                for (const item of cart) {
                    const { ref, product: productData } = productRefs.get(item.product.id)!;
                    
                    const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : [...Object.values(productData.variants)];
                    const variantIndex = variantsArray.findIndex(v => v.sku === item.variant.sku);

                    if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found.`);
                    
                    const currentStock = variantsArray[variantIndex].outlet_stocks?.[outletId] ?? 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Not enough stock for ${item.product.name}. Available: ${currentStock}`);
                    }
                    
                    variantsArray[variantIndex].stock -= item.quantity;
                    if (variantsArray[variantIndex].outlet_stocks) {
                       variantsArray[variantIndex].outlet_stocks![outletId] -= item.quantity;
                    }
                    
                    const newTotalStock = productData.total_stock - item.quantity;

                    transaction.update(ref, {
                        variants: variantsArray,
                        total_stock: newTotalStock,
                    });
                }
    
                const salesRef = doc(firestore, 'pos_sales', saleId);
                transaction.set(salesRef, saleData);
            });
    
            toast({ title: 'Sale Completed!', description: 'Receipt is being prepared.' });
            let saleInfoForReceipt: POSSale & { cashReceived?: number; changeDue?: number } = { ...saleData };
            if (paymentMethod === 'cash') {
                saleInfoForReceipt = { ...saleData, cashReceived, changeDue };
            }
            setLastSale(saleInfoForReceipt);
            setIsReceiptPreviewOpen(true);
            setCart([]);
            setSearchTerm('');
            setCashReceived(0);
    
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
    
    const cartPanelProps = {
        cart,
        updateQuantity,
        totalItems,
        cartSubtotal,
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        changeDue,
        isProcessing,
        handleCompleteSale
    };

    return (
         <>
            <div className="grid grid-cols-1 lg:grid-cols-5 no-print">
                {/* Product Grid Section */}
                <div className="lg:col-span-3 flex flex-col gap-4 p-4 h-screen overflow-y-auto">
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

                    <CameraScanner onScan={handleCameraScan} />

                    <Card className="flex-1">
                        <ScrollArea className="h-[calc(100vh-320px)] rounded-lg">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                {isLoading ? renderProductSkeletons() : 
                                availableVariants.map(variant => {
                                    const { product } = variant;
                                    const variantImage = variant.image || product.image;
                                    return (
                                    <Card key={variant.sku} onClick={() => addToCart(product, variant)} className="cursor-pointer hover:border-primary transition-colors flex flex-col shadow-sm">
                                        <CardContent className="p-0 flex-grow">
                                            <div className="relative aspect-square">
                                                <Image src={variantImage || 'https://placehold.co/300'} alt={product.name} fill className="object-cover rounded-t-lg" />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-2 flex-col items-start">
                                            <p className="text-xs font-semibold truncate w-full">{product.name}</p>
                                             <p className="text-[10px] text-muted-foreground">{[variant.color, variant.size].filter(Boolean).join(' / ')}</p>
                                            <p className="text-sm font-bold text-primary">৳{variant.price.toFixed(2)}</p>
                                        </CardFooter>
                                    </Card>
                                )})}
                            </div>
                            {!isLoading && availableVariants.length === 0 && (
                                <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
                                    <p>{searchTerm ? `No products found for "${searchTerm}"` : 'No products available in this outlet. Check inventory.'}</p>
                                </div>
                            )}
                        </ScrollArea>
                    </Card>
                </div>

                {/* Desktop Right Column: Customer + Cart */}
                <div className="hidden lg:block lg:col-span-2 h-screen sticky top-0 overflow-y-auto p-4 border-l bg-muted/30">
                     <CartPanel {...cartPanelProps} />
                </div>
            </div>

             {/* Mobile "View Cart" Button & Sheet */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3 border-t no-print">
                 <Sheet>
                    <SheetTrigger asChild>
                       <Button size="lg" className="w-full h-14 text-lg font-bold flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart />
                                <span>{totalItems} Items</span>
                            </div>
                            <span>৳{cartSubtotal.toFixed(2)}</span>
                       </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>Current Sale</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                <CartPanel {...cartPanelProps} />
                            </div>
                        </ScrollArea>
                    </SheetContent>
                 </Sheet>
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


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
import { doc, getDoc, runTransaction, serverTimestamp, collection, increment, setDoc } from 'firebase/firestore';
import type { Order } from '@/types/order';
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
import { Separator } from '@/components/ui/separator';
import type { Coupon } from '@/types/coupon';
import { UserData } from '@/types/user';


type CartItem = {
    product: Product;
    variant: ProductVariant;
    quantity: number;
    isPreOrder?: boolean;
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
    discountAmount,
    grandTotal,
    promoCodeInput,
    setPromoCodeInput,
    handleApplyPromo,
    isApplyingPromo,
    appliedCoupon,
    removePromoCode,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    changeDue,
    isProcessing,
    handleCompleteSale,
    isPreOrderCart,
    fullOrderTotal,
    selectedCustomer,
    customerSearch,
    setCustomerSearch,
    filteredCustomers,
    handleSelectCustomer,
    handleClearCustomer
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
               {selectedCustomer ? (
                    <div className="flex items-center justify-between p-3 border-2 border-dashed rounded-lg bg-green-50">
                        <div>
                            <p className="font-bold text-sm text-green-800">{selectedCustomer.displayName}</p>
                            <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleClearCustomer}><XCircle className="h-4 w-4" /></Button>
                    </div>
                ) : (
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="pl-8"
                        />
                        {customerSearch && (
                             <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                {filteredCustomers.length > 0 ? filteredCustomers.map((cust: UserData) => (
                                    <div
                                        key={cust.uid}
                                        onClick={() => handleSelectCustomer(cust)}
                                        className="p-3 hover:bg-muted cursor-pointer border-b"
                                    >
                                        <p className="font-semibold text-sm">{cust.displayName}</p>
                                        <p className="text-xs text-muted-foreground">{cust.email}</p>
                                    </div>
                                )) : (
                                    <div className="p-3 text-center text-xs text-muted-foreground">
                                        No customers found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                 {!selectedCustomer && (
                    <div className="text-sm text-center text-muted-foreground p-2 border-2 border-dashed rounded-lg">
                        Default: Walk-in Customer
                    </div>
                 )}
            </CardContent>
        </Card>
        
        {/* Cart Section */}
        <Card className="flex-1 flex flex-col shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <ShoppingCart /> {isPreOrderCart ? 'Pre-order Booking' : 'Current Sale'}
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
                
                {isPreOrderCart ? (
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Total Value</span>
                            <span>৳{fullOrderTotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-primary">
                            <span>Deposit Payable</span>
                            <span>৳{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>৳{cartSubtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount ({appliedCoupon?.code})</span>
                                <span>- ৳{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                         <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total ({totalItems} items)</span>
                            <span>৳{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                )}
                

                <Separator />
                
                <div className="space-y-2">
                    {appliedCoupon ? (
                        <div className="flex justify-between items-center bg-green-100/50 p-2 rounded-md">
                            <div className="text-green-700">
                                <p className="text-sm font-bold">Code Applied: {appliedCoupon.code}</p>
                                <p className="text-xs">-৳{discountAmount.toFixed(2)}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={removePromoCode}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="promo-code" className="text-xs font-medium">Promo Code</Label>
                                <Input 
                                    id="promo-code" 
                                    placeholder="Enter code"
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value)}
                                    disabled={isApplyingPromo || isPreOrderCart}
                                />
                            </div>
                            <Button onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCodeInput || isPreOrderCart}>
                                {isApplyingPromo ? 'Applying...' : 'Apply'}
                            </Button>
                        </div>
                    )}
                </div>

                <Separator />
                
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
                             <Button type="button" variant="outline" onClick={() => setCashReceived(grandTotal)}>Exact</Button>
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
                    disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && cashReceived < grandTotal)}
                    onClick={handleCompleteSale}
                    className="h-14 text-lg"
                >
                    {isProcessing ? 'Processing...' : (isPreOrderCart ? 'Book Pre-order' : 'Complete Sale')}
                </Button>
            </CardFooter>
        </Card>
    </div>
);


export default function POSPage() {
    const { user, userData } = useAuth();
    const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery('products');
    const { data: allUsers, isLoading: usersLoading } = useFirestoreQuery<UserData>('users');

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
    const [cashReceived, setCashReceived] = useState<number>(0);
    const [lastSale, setLastSale] = useState<any | null>(null);
    const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);

    const isLoading = productsLoading || usersLoading;

    const outletId = useMemo(() => userData?.outletId, [userData]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch || !allUsers) return [];
        return allUsers.filter(u => u.role === 'customer' &&
            (u.displayName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
             u.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
             u.phone?.includes(customerSearch)
            )
        ).slice(0, 5); // limit results
    }, [customerSearch, allUsers]);

    const handleSelectCustomer = (customer: UserData) => {
        setSelectedCustomer(customer);
        setCustomerSearch('');
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
    };

    const availableVariants = useMemo(() => {
        if (!allProducts || !outletId) return [];

        const variants: SearchableVariant[] = [];
        allProducts.forEach(product => {
            if (product.status !== 'approved') return;

            const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});

            variantsArray.forEach(variant => {
                const stockInOutlet = variant.outlet_stocks?.[outletId] ?? 0;
                if (stockInOutlet > 0 || product.preOrder?.enabled) {
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
        if (stockInOutlet <= 0 && !product.preOrder?.enabled) {
             toast({ variant: 'destructive', title: 'Out of stock' });
            return;
        }

        setCart(prevCart => {
            const isPreOrderItem = !!product.preOrder?.enabled;
            if (prevCart.length > 0) {
                const cartIsPreOrder = !!prevCart[0].isPreOrder;
                if (isPreOrderItem !== cartIsPreOrder) {
                    toast({
                        variant: 'destructive',
                        title: 'Mixed Cart Not Allowed',
                        description: 'Pre-order and regular items cannot be in the same transaction.',
                    });
                    return prevCart;
                }
            }

            const existingItem = prevCart.find(item => item.variant.sku === variant.sku);
            if (existingItem) {
                if (!product.preOrder?.enabled && existingItem.quantity >= stockInOutlet) {
                    toast({ variant: 'destructive', title: 'Stock limit reached' });
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.variant.sku === variant.sku
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, variant, quantity: 1, isPreOrder: isPreOrderItem }];
        });
    };

    const updateQuantity = (variantSku: string, newQuantity: number) => {
        const cartItem = cart.find(item => item.variant.sku === variantSku);
        if (!cartItem || !outletId) return;

        if (newQuantity > 0) {
            if (!cartItem.isPreOrder) {
                const stockInOutlet = cartItem.variant.outlet_stocks?.[outletId] ?? 0;
                if (newQuantity > stockInOutlet) {
                    toast({ variant: 'destructive', title: 'Stock limit reached' });
                    return;
                }
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
                if (stockInOutlet > 0 || product.preOrder?.enabled) {
                    addToCart(product, variant);
                    return true;
                }
            }
        }
        return false;
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

    const isPreOrderCart = useMemo(() => cart.length > 0 && !!cart[0].isPreOrder, [cart]);

    const { cartSubtotal, grandTotal, fullOrderTotal } = useMemo(() => {
        const subtotal = cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);

        if (isPreOrderCart) {
            let depositTotal = 0;
            cart.forEach(item => {
                const preOrderInfo = item.product.preOrder;
                const itemSubtotal = item.variant.price * item.quantity;
                if (preOrderInfo?.enabled && preOrderInfo.depositAmount != null && preOrderInfo.depositAmount > 0) {
                  if (preOrderInfo.depositType === 'percentage') {
                    depositTotal += (itemSubtotal * preOrderInfo.depositAmount) / 100;
                  } else { // fixed
                    depositTotal += (preOrderInfo.depositAmount * item.quantity);
                  }
                } else {
                  depositTotal += itemSubtotal;
                }
            });
            return { cartSubtotal: subtotal, grandTotal: depositTotal, fullOrderTotal: subtotal };
        }

        return { cartSubtotal: subtotal, grandTotal: subtotal - discountAmount, fullOrderTotal: subtotal };
    }, [cart, discountAmount, isPreOrderCart]);

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);
    
    const changeDue = cashReceived - grandTotal;

    const calculateDiscount = (subtotal: number, coupon: Coupon): number => {
        if (subtotal < coupon.minimumSpend) {
            toast({ variant: 'destructive', title: `Minimum spend of ৳${coupon.minimumSpend} required.` });
            return 0;
        };
        if (coupon.discountType === 'fixed') {
            return Math.min(coupon.value, subtotal);
        }
        if (coupon.discountType === 'percentage') {
            return (subtotal * coupon.value) / 100;
        }
        return 0;
    };

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim() || !firestore || isPreOrderCart) return;
        setIsApplyingPromo(true);

        const code = promoCodeInput.trim().toUpperCase();
        const couponRef = doc(firestore, 'coupons', code);
        try {
            const couponSnap = await getDoc(couponRef);
            if (!couponSnap.exists()) {
                toast({ variant: 'destructive', title: 'Invalid Promo Code' });
                return;
            }
            const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
            
            if (coupon.expiryDate.toDate() < new Date()) {
                toast({ variant: 'destructive', title: 'Promo code expired.' });
                return;
            }

            if (coupon.usedCount >= coupon.usageLimit) {
                toast({ variant: 'destructive', title: 'Promo code usage limit reached.' });
                return;
            }

            const discount = calculateDiscount(cartSubtotal, coupon);
            if (discount > 0) {
                setAppliedCoupon(coupon);
                setDiscountAmount(discount);
                toast({ title: 'Promo code applied!' });
            }

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error applying promo code.' });
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const removePromoCode = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setPromoCodeInput('');
        toast({ title: 'Promo code removed.' });
    };
    
    const clearSaleState = () => {
        setCart([]);
        setSearchTerm('');
        setCashReceived(0);
        setPromoCodeInput('');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setSelectedCustomer(null);
        setCustomerSearch('');
    };

    const handleCompleteSale = async () => {
        if (!firestore || !user || !outletId || cart.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot complete sale.' });
            return;
        }
    
        setIsProcessing(true);
        
        if (isPreOrderCart) {
            if (!selectedCustomer) {
                toast({ variant: 'destructive', title: 'Customer Required', description: 'Please select a customer for pre-orders.' });
                setIsProcessing(false);
                return;
            }

            let latestReleaseDate: Date | null = null;
            cart.forEach(item => {
                if (item.product.preOrder?.enabled && item.product.preOrder.releaseDate) {
                    const releaseDateValue = item.product.preOrder.releaseDate as any;
                    const itemReleaseDate = releaseDateValue?.toDate ? releaseDateValue.toDate() : new Date(releaseDateValue);
                    
                    if (itemReleaseDate instanceof Date && !isNaN(itemReleaseDate.getTime())) {
                        if (!latestReleaseDate || itemReleaseDate > latestReleaseDate) {
                            latestReleaseDate = itemReleaseDate;
                        }
                    }
                }
            });

            const orderId = doc(collection(firestore, 'id_generator')).id;

            const preOrderData: Omit<Order, 'id'> & { id: string } = {
                id: orderId,
                customerId: selectedCustomer.uid,
                shippingAddress: { 
                    name: selectedCustomer.displayName || 'In-Store Customer',
                    phone: selectedCustomer.phone || 'N/A',
                    address: `Pickup at Outlet ID: ${outletId}`,
                    city: 'In-Store',
                },
                items: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    variantSku: item.variant.sku,
                    quantity: item.quantity,
                    price: item.variant.price
                })),
                subtotal: cartSubtotal,
                totalAmount: grandTotal,
                fullOrderValue: fullOrderTotal,
                assignedOutletId: outletId,
                status: 'pre-ordered',
                orderType: 'pre-order',
                createdAt: serverTimestamp(),
            };

            try {
                const orderRef = doc(firestore, 'orders', orderId);
                const userRef = doc(firestore, 'users', selectedCustomer.uid);
                
                await runTransaction(firestore, async (transaction) => {
                    transaction.set(orderRef, preOrderData);
                    
                    const pointsEarned = Math.floor(grandTotal / 100) * 5;
                    transaction.update(userRef, {
                        loyaltyPoints: increment(pointsEarned),
                        totalSpent: increment(grandTotal),
                    });

                    const pointsHistoryRef = doc(collection(firestore, `users/${selectedCustomer.uid}/points_history`));
                    transaction.set(pointsHistoryRef, {
                        userId: selectedCustomer.uid,
                        pointsChange: pointsEarned,
                        type: 'earn',
                        reason: `Pre-order Booking: ${orderId}`,
                        createdAt: serverTimestamp(),
                    });
                });
                
                const receiptData = {
                    ...preOrderData,
                    paymentMethod: paymentMethod,
                    cashReceived: cashReceived,
                    changeDue: cashReceived - grandTotal,
                    releaseDate: latestReleaseDate,
                };
                
                setLastSale(receiptData);
                setIsReceiptPreviewOpen(true);
                clearSaleState();
                toast({ title: 'Pre-order Booked!', description: 'Receipt is being prepared.' });
            } catch (error: any) {
                console.error('Pre-order failed: ', error);
                toast({ variant: 'destructive', title: 'Pre-order Failed', description: error.message || 'An unexpected error occurred.' });
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        // Regular Sale
        try {
            const saleId = doc(collection(firestore, 'id_generator')).id;
            await runTransaction(firestore, async (transaction) => {
                const saleRef = doc(firestore, 'pos_sales', saleId);

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
                    subtotal: cartSubtotal,
                    discountAmount: discountAmount,
                    promoCode: appliedCoupon?.code,
                    totalAmount: grandTotal,
                    paymentMethod: paymentMethod,
                    createdAt: serverTimestamp(),
                };
                transaction.set(saleRef, saleData);

                for (const item of cart) {
                    const productRef = doc(firestore, 'products', item.product.id);
                    const productDoc = await transaction.get(productRef);
                    if (!productDoc.exists()) throw new Error(`Product ${item.product.name} not found.`);
                    
                    const productData = productDoc.data() as Product;
                    const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : [...Object.values(productData.variants)];
                    const variantIndex = variantsArray.findIndex(v => v.sku === item.variant.sku);

                    if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found.`);
                    
                    const currentStock = variantsArray[variantIndex].outlet_stocks?.[outletId] ?? 0;
                    if (currentStock < item.quantity) throw new Error(`Not enough stock for ${item.product.name}. Available: ${currentStock}`);
                    
                    variantsArray[variantIndex].stock = (variantsArray[variantIndex].stock || 0) - item.quantity;
                    variantsArray[variantIndex].outlet_stocks![outletId] = currentStock - item.quantity;

                    transaction.update(productRef, {
                        variants: variantsArray,
                        total_stock: increment(-item.quantity),
                    });
                }
    
                if (appliedCoupon) {
                    const couponRef = doc(firestore, 'coupons', appliedCoupon.id);
                    transaction.update(couponRef, { usedCount: increment(1) });
                }

                if (selectedCustomer) {
                    const userRef = doc(firestore, 'users', selectedCustomer.uid);
                    const pointsEarned = Math.floor(grandTotal / 100) * 5;
                    transaction.update(userRef, {
                        loyaltyPoints: increment(pointsEarned),
                        totalSpent: increment(grandTotal),
                    });
                     const pointsHistoryRef = doc(collection(firestore, `users/${selectedCustomer.uid}/points_history`));
                    transaction.set(pointsHistoryRef, {
                        userId: selectedCustomer.uid,
                        pointsChange: pointsEarned,
                        type: 'earn',
                        reason: `POS Sale: ${saleId}`,
                        createdAt: serverTimestamp(),
                    });
                }
                
                let saleInfoForReceipt: any = { ...saleData, orderType: 'regular' };
                if (paymentMethod === 'cash') {
                    saleInfoForReceipt = { ...saleInfoForReceipt, cashReceived, changeDue };
                }
                setLastSale(saleInfoForReceipt);
            });
    
            toast({ title: 'Sale Completed!', description: 'Receipt is being prepared.' });
            setIsReceiptPreviewOpen(true);
            clearSaleState();
    
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
        discountAmount,
        grandTotal,
        promoCodeInput,
        setPromoCodeInput,
        handleApplyPromo,
        isApplyingPromo,
        appliedCoupon,
        removePromoCode,
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        changeDue,
        isProcessing,
        handleCompleteSale,
        isPreOrderCart,
        fullOrderTotal,
        selectedCustomer,
        customerSearch,
        setCustomerSearch,
        filteredCustomers,
        handleSelectCustomer,
        handleClearCustomer
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
                                                 {product.preOrder?.enabled && (
                                                    <div className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                        Pre-order
                                                    </div>
                                                )}
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
            <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-background/80 backdrop-blur-sm p-3 border-t no-print">
                 <Sheet>
                    <SheetTrigger asChild>
                       <Button size="lg" className="w-full h-14 text-lg font-bold flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart />
                                <span>{totalItems} Items</span>
                            </div>
                            <span>৳{grandTotal.toFixed(2)}</span>
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

    

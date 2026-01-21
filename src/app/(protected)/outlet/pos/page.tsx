'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart, Banknote, CreditCard, Smartphone, User, Nfc, Loader2, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery, useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { Product, ProductVariant } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, serverTimestamp, collection, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
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
  SheetDescription,
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
    cart, updateQuantity, totalItems, cartSubtotal, discountAmount, grandTotal,
    promoCodeInput, setPromoCodeInput, handleApplyPromo, isApplyingPromo,
    appliedCoupon, removePromoCode, paymentMethod, setPaymentMethod,
    cashReceived, setCashReceived, changeDue, isProcessing, handleCompleteSale,
    isPreOrderCart, selectedCustomer, customerSearch,
    setCustomerSearch, filteredCustomers, handleSelectCustomer, handleClearCustomer,
    handleNfcRead, isScanningNfc, pointsToUse, setPointsToUse, handleApplyPoints,
    pointsApplied, pointsDiscount, removePoints, cardPromoDiscountAmount, potentialPointsDiscount,
    handleApplyMaxPoints, maxPointsForSale, maxDiscountFromPoints
}: any) => (
    <div className="flex flex-col gap-4 h-full">
        <Card className="shadow-md flex-shrink-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User /> Customer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {selectedCustomer ? (
                    <div className="p-3 border-2 border-dashed rounded-lg bg-green-50/50 border-green-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-bold text-sm text-green-800">{selectedCustomer.displayName}</p>
                                <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleClearCustomer}><XCircle className="h-4 w-4" /></Button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200/50 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tier:</span>
                                <span className="font-bold capitalize">{selectedCustomer.membershipTier || 'Silver'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Points:</span>
                                <span className="font-bold">{selectedCustomer.loyaltyPoints || 0}</span>
                            </div>
                            {selectedCustomer.cardPromoDiscount > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span className="font-bold">Card Promo:</span>
                                    <span className="font-bold">{selectedCustomer.cardPromoDiscount}% OFF</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
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
                        <Button 
                            variant="outline" 
                            className="w-full gap-2" 
                            onClick={handleNfcRead} 
                            disabled={isScanningNfc}
                        >
                            {isScanningNfc ? <Loader2 className="animate-spin" /> : <Nfc />}
                            {isScanningNfc ? 'Scanning...' : 'Scan Customer NFC'}
                        </Button>
                    </div>
                )}
                 {!selectedCustomer && (
                    <div className="text-sm text-center text-muted-foreground p-2 border-2 border-dashed rounded-lg">
                        Default: Walk-in Customer
                    </div>
                 )}
            </CardContent>
        </Card>
        
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
                
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>৳{cartSubtotal.toFixed(2)}</span>
                    </div>
                    {cardPromoDiscountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Card Discount ({selectedCustomer?.cardPromoDiscount}%)</span>
                            <span>- ৳{cardPromoDiscountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Promo Discount ({appliedCoupon?.code})</span>
                            <span>- ৳{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {pointsDiscount > 0 && (
                         <div className="flex justify-between text-green-600">
                            <span>Loyalty Discount</span>
                            <span>- ৳{pointsDiscount.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                        <span>Total ({totalItems} items)</span>
                        <span>৳{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

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

                {selectedCustomer && (selectedCustomer.loyaltyPoints || 0) > 0 && (
                   <div className="space-y-3 pt-2">
                        <Label className="font-bold flex items-center gap-2"><Award size={16} className="text-primary" /> Use Loyalty Points</Label>
                        <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg space-y-2">
                            <p className="text-xs text-muted-foreground">Available: <span className="font-bold text-primary">{selectedCustomer.loyaltyPoints}</span> points</p>
                            {pointsApplied > 0 ? (
                                <div className="flex justify-between items-center bg-green-100/50 p-2 rounded-md">
                                    <div className="text-green-700">
                                        <p className="text-sm font-bold">Points Applied: {pointsApplied}</p>
                                        <p className="text-xs">-৳{pointsDiscount.toFixed(2)}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={removePoints}><XCircle className="h-4 w-4" /></Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input placeholder="Points to use" type="number" value={pointsToUse} onChange={(e) => setPointsToUse(e.target.value)} />
                                        <Button onClick={handleApplyPoints}>Apply</Button>
                                    </div>
                                    {potentialPointsDiscount > 0 && (
                                        <p className="text-xs text-center text-muted-foreground">Will apply a discount of ~৳{potentialPointsDiscount.toFixed(2)}</p>
                                    )}
                                    {maxPointsForSale > 0 && (
                                        <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs w-full" onClick={handleApplyMaxPoints}>
                                            Use maximum ({maxPointsForSale} pts for ৳{maxDiscountFromPoints.toFixed(2)})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
    const { data: loyaltySettings } = useFirestoreDoc<any>('settings/loyalty');
    const pointValue = loyaltySettings?.pointValueInTaka ?? 0.20;

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
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);
    const [isScanningNfc, setIsScanningNfc] = useState(false);
    
    const [pointsToUse, setPointsToUse] = useState<string>('');
    const [pointsApplied, setPointsApplied] = useState(0);
    const [pointsDiscount, setPointsDiscount] = useState(0);
    const [cardPromoDiscountAmount, setCardPromoDiscountAmount] = useState(0);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [cartSubtotal, setCartSubtotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [potentialPointsDiscount, setPotentialPointsDiscount] = useState(0);

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
        // Reset discounts when customer changes
        setAppliedCoupon(null);
        setPromoDiscount(0);
        setPointsApplied(0);
        setPointsDiscount(0);
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        // Reset discounts
        setAppliedCoupon(null);
        setPromoDiscount(0);
        setCardPromoDiscountAmount(0);
        setPointsApplied(0);
        setPointsDiscount(0);
    };
    
    const handleApplyPoints = () => {
        if (!selectedCustomer) return;
        const pointsNum = parseInt(pointsToUse, 10);
        const availablePoints = selectedCustomer.loyaltyPoints || 0;
        if (isNaN(pointsNum) || pointsNum <= 0) {
            toast({ variant: 'destructive', title: 'Invalid amount' });
            return;
        }
        if (pointsNum > availablePoints) {
            toast({ variant: 'destructive', title: 'Not enough points' });
            return;
        }

        const currentSubtotalAfterDiscounts = cartSubtotal - promoDiscount - cardPromoDiscountAmount;
        const requestedDiscount = pointsNum * pointValue;

        if (requestedDiscount > currentSubtotalAfterDiscounts) {
            const maxPoints = Math.floor(currentSubtotalAfterDiscounts / pointValue);
            toast({ title: `You can use a maximum of ${maxPoints} points for this sale.` });
            setPointsApplied(maxPoints);
        } else {
            setPointsApplied(pointsNum);
        }
        setPointsToUse('');
    };

    const removePoints = () => {
        setPointsApplied(0);
        setPointsDiscount(0);
    }
    
    const { 
        totalItems,
        regularItemsSubtotal,
        preOrderItemsSubtotal,
        isPreOrderCart
    } = useMemo(() => {
        let regularSub = 0;
        let preOrderSub = 0;
        let itemsCount = 0;

        cart.forEach(item => {
            const itemTotal = (item.variant?.price || 0) * item.quantity;
            itemsCount += item.quantity;

            if (item.isPreOrder) {
                preOrderSub += itemTotal;
            } else {
                regularSub += itemTotal;
            }
        });
        
        return { 
            totalItems: itemsCount,
            regularItemsSubtotal: regularSub,
            preOrderItemsSubtotal: preOrderSub,
            isPreOrderCart: cart.length > 0 && cart.some(i => i.isPreOrder),
        };
    }, [cart]);

    // Central effect for recalculating totals
    useEffect(() => {
        const subtotal = regularItemsSubtotal + preOrderItemsSubtotal;
        setCartSubtotal(subtotal);

        // 1. Apply Card Promo (only on regular items)
        const cardDiscountPercent = selectedCustomer?.cardPromoDiscount || 0;
        const cardDiscount = (regularItemsSubtotal * cardDiscountPercent) / 100;
        setCardPromoDiscountAmount(cardDiscount);

        // 2. Apply Coupon (only on eligible regular items)
        let currentPromoDiscount = 0;
        if (appliedCoupon) {
            const eligibleItems = cart.filter(item => {
                if (item.isPreOrder) return false;
                if (!appliedCoupon.applicableProducts || appliedCoupon.applicableProducts.length === 0) return true;
                return appliedCoupon.applicableProducts.includes(item.product.id);
            });

            if (eligibleItems.length > 0) {
                const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0);
                if (eligibleSubtotal >= appliedCoupon.minimumSpend) {
                    if (appliedCoupon.discountType === 'fixed') {
                        currentPromoDiscount = Math.min(appliedCoupon.value, eligibleSubtotal);
                    } else { // percentage
                        currentPromoDiscount = (eligibleSubtotal * appliedCoupon.value) / 100;
                    }
                }
            }
        }
        setPromoDiscount(currentPromoDiscount);

        // 3. Apply Points (on the remaining total)
        let currentPointsDiscount = 0;
        const subtotalAfterPromos = subtotal - cardDiscount - currentPromoDiscount;
        if (pointsApplied > 0) {
            const maxDiscountFromPoints = pointsApplied * pointValue;
            currentPointsDiscount = Math.min(maxDiscountFromPoints, subtotalAfterPromos > 0 ? subtotalAfterPromos : 0);
        }
        setPointsDiscount(currentPointsDiscount);
        
        const finalTotal = subtotal - cardDiscount - currentPromoDiscount - currentPointsDiscount;
        setGrandTotal(finalTotal < 0 ? 0 : finalTotal);

    }, [cart, regularItemsSubtotal, preOrderItemsSubtotal, selectedCustomer, appliedCoupon, pointsApplied, pointValue]);


    const { maxPointsForSale, maxDiscountFromPoints } = useMemo(() => {
        if (!selectedCustomer) return { maxPointsForSale: 0, maxDiscountFromPoints: 0 };
    
        const currentSubtotalAfterDiscounts = (regularItemsSubtotal + preOrderItemsSubtotal) - promoDiscount - cardPromoDiscountAmount;
        const maxDiscount = Math.max(0, currentSubtotalAfterDiscounts);
        const maxPoints = Math.floor(maxDiscount / pointValue);
        
        const usablePoints = Math.min(maxPoints, selectedCustomer.loyaltyPoints || 0);
        const discount = usablePoints * pointValue;
    
        return { maxPointsForSale: usablePoints, maxDiscountFromPoints: discount };
    }, [regularItemsSubtotal, preOrderItemsSubtotal, promoDiscount, cardPromoDiscountAmount, selectedCustomer, pointValue]);
    
    useEffect(() => {
        const pointsNum = parseInt(pointsToUse, 10);
        if (!isNaN(pointsNum) && pointsNum > 0) {
            const discountValue = Math.min(pointsNum, maxPointsForSale) * pointValue;
            setPotentialPointsDiscount(discountValue);
        } else {
            setPotentialPointsDiscount(0);
        }
    }, [pointsToUse, maxPointsForSale, pointValue]);

    const handleApplyMaxPoints = () => {
        setPointsToUse(String(maxPointsForSale));
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
            if (product.status !== 'approved') continue;
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
    
    const handleNfcRead = async () => {
        if (!('NDEFReader' in window)) {
            toast({ variant: "destructive", title: "NFC Not Supported", description: "This browser or device does not support Web NFC for reading." });
            return;
        }
        
        setIsScanningNfc(true);
        toast({ title: "Scanning for NFC Tag", description: "Please tap a customer's membership card/device." });

        try {
            const ndef = new (window as any).NDEFReader();
            const controller = new AbortController();
            
            const timeoutId = setTimeout(() => {
                try { controller.abort(); } catch(e) {}
                if (isScanningNfc) {
                    setIsScanningNfc(false);
                    toast({ variant: 'destructive', title: 'NFC Scan Timed Out' });
                }
            }, 15000);

            await ndef.scan({ signal: controller.signal });

            ndef.onreading = (event: any) => {
                clearTimeout(timeoutId);
                const decoder = new TextDecoder();
                for (const record of event.message.records) {
                    if (record.recordType === "text") {
                        const customerId = decoder.decode(record.data);
                        const customer = allUsers?.find(u => u.uid === customerId);
                        if (customer) {
                            handleSelectCustomer(customer);
                            toast({ title: "Customer Found!", description: `${customer.displayName} has been selected.` });
                        } else {
                            toast({ variant: 'destructive', title: 'Customer Not Found', description: 'The scanned NFC tag does not correspond to a valid customer.' });
                        }
                        setIsScanningNfc(false);
                        try { controller.abort(); } catch(e) {}
                        return;
                    }
                }
            };
            ndef.onreadingerror = () => {
                clearTimeout(timeoutId);
                toast({ variant: 'destructive', title: 'NFC Read Error', description: 'Could not read data from the tag.' });
                setIsScanningNfc(false);
            };
            
        } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error("NFC scan error:", error);
              toast({ variant: 'destructive', title: 'NFC Error', description: error.message });
            }
            setIsScanningNfc(false);
        }
    };

    const changeDue = cashReceived - grandTotal;

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim() || !firestore || isPreOrderCart) return;
        setIsApplyingPromo(true);

        const code = promoCodeInput.trim().toUpperCase();
        const couponsRef = collection(firestore, 'coupons');
        const q = query(couponsRef, where("code", "==", code), limit(1));
        
        try {
            const couponSnap = await getDocs(q);

            if (couponSnap.empty) {
                throw new Error('Invalid code');
            }
            const couponDoc = couponSnap.docs[0];
            const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
            
            if (new Date(coupon.expiryDate.seconds * 1000) < new Date()) {
                throw new Error('Promo code expired.');
            }
    
            if (coupon.usedCount >= coupon.usageLimit) {
                throw new Error('Promo code usage limit reached.');
            }
    
            const eligibleItems = cart.filter(item => {
                if (item.isPreOrder) return false;
                if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) return true;
                return coupon.applicableProducts.includes(item.product.id);
            });
    
            if (eligibleItems.length === 0) {
                throw new Error('This coupon does not apply to any items in your cart.');
            }
    
            const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0);
    
            if (eligibleSubtotal < coupon.minimumSpend) {
                throw new Error(`A minimum spend of ৳${coupon.minimumSpend} on eligible items is required.`);
            }
            
            setAppliedCoupon(coupon);
            toast({ title: 'Promo code applied!' });
    
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Applying Code', description: error.message });
            setAppliedCoupon(null);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const removePromoCode = () => {
        setAppliedCoupon(null);
        setPromoDiscount(0);
        setPromoCodeInput('');
        toast({ title: 'Promo code removed.' });
    };
    
    const clearSaleState = () => {
        setCart([]);
        setSearchTerm('');
        setCashReceived(0);
        setPromoCodeInput('');
        handleClearCustomer();
    };

    const handleCompleteSale = async () => {
        if (!firestore || !user || !outletId || cart.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot complete sale.' });
            return;
        }
    
        setIsProcessing(true);
        
        try {
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
                subtotal: cartSubtotal,
                cardPromoDiscountAmount: cardPromoDiscountAmount,
                discountAmount: promoDiscount,
                promoCode: appliedCoupon ? appliedCoupon.code : undefined,
                loyaltyPointsUsed: pointsApplied,
                loyaltyDiscount: pointsDiscount,
                totalAmount: grandTotal,
                paymentMethod: paymentMethod,
                createdAt: serverTimestamp(),
                customerId: selectedCustomer?.uid,
                customerName: selectedCustomer?.displayName || 'Walk-in Customer',
            };

            const response = await fetch('/api/pos/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to complete sale from server.');
            }
            
            let saleInfoForReceipt: any = { ...saleData, orderType: 'regular', createdAt: new Date() };
            if (paymentMethod === 'cash') {
                saleInfoForReceipt = { ...saleInfoForReceipt, cashReceived, changeDue };
            }
            setLastSale(saleInfoForReceipt);
    
            toast({ title: 'Sale Completed!', description: 'Receipt is being prepared.' });
            setIsReceiptPreviewOpen(true);
            clearSaleState();
    
        } catch (error: any) {
            console.error('Sale completion failed: ', error);
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
        cart, updateQuantity, totalItems, cartSubtotal, discountAmount: promoDiscount, grandTotal,
        promoCodeInput, setPromoCodeInput, handleApplyPromo, isApplyingPromo,
        appliedCoupon, removePromoCode, paymentMethod, setPaymentMethod,
        cashReceived, setCashReceived, changeDue, isProcessing, handleCompleteSale,
        isPreOrderCart, selectedCustomer, customerSearch,
        setCustomerSearch, filteredCustomers, handleSelectCustomer, handleClearCustomer,
        handleNfcRead, isScanningNfc, pointsToUse, setPointsToUse, handleApplyPoints,
        pointsApplied, pointsDiscount, removePoints, cardPromoDiscountAmount, potentialPointsDiscount,
        handleApplyMaxPoints, maxPointsForSale, maxDiscountFromPoints,
    };

    return (
         <>
            <div className="grid grid-cols-1 lg:grid-cols-5 no-print">
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

                <div className="hidden lg:block lg:col-span-2 h-screen sticky top-0 overflow-y-auto p-4 border-l bg-muted/30">
                     <CartPanel {...cartPanelProps} />
                </div>
            </div>

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
                            <SheetDescription>Manage items and complete the sale.</SheetDescription>
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

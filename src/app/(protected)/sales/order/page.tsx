'use client';
import { useState, useMemo, useRef, useEffect }from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart, User, ArrowLeft, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery, useFirestoreDoc } from '@/hooks/useFirestoreQuery';
import { Product, ProductVariant } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection, increment, query, where, DocumentReference, getDoc } from 'firebase/firestore';
import type { Order, ShippingAddress } from '@/types/order';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { UserData } from '@/types/user';
import { calculateDistance } from '@/lib/distance';
import type { Outlet } from '@/types/outlet';
import type { Coupon } from '@/types/coupon';
import { Label } from '@/components/ui/label';

type CartItem = {
    product: Product;
    variant: ProductVariant;
    quantity: number;
};

type SearchableVariant = ProductVariant & {
  product: Product;
  searchableTerms: string;
};

export default function SalesOrderPage() {
    const { user } = useAuth();
    const { data: allProducts, isLoading: productsLoading } = useFirestoreQuery<Product>('products');
    
    const customersQuery = useMemo(() => user ? query(collection(useFirebase().firestore!, 'users'), where('managedBy', '==', user.uid)) : null, [user]);
    const { data: managedCustomers, isLoading: customersLoading } = useFirestoreQuery<UserData>(customersQuery);
    const { data: allOutlets, isLoading: outletsLoading } = useFirestoreQuery<Outlet>('outlets');

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    
    const [pointsToUse, setPointsToUse] = useState<string>('');
    const [pointsApplied, setPointsApplied] = useState(0);
    const [pointsDiscount, setPointsDiscount] = useState(0);

    const [cardPromoDiscount, setCardPromoDiscount] = useState(0);
    const [cardPromoDiscountAmount, setCardPromoDiscountAmount] = useState(0);
    const [promoDiscount, setPromoDiscount] = useState(0);

    const [grandTotal, setGrandTotal] = useState(0);

    const { data: loyaltySettings } = useFirestoreDoc<any>('settings/loyalty');
    const pointValue = loyaltySettings?.pointValueInTaka ?? 0.20;

    const isLoading = productsLoading || customersLoading || outletsLoading;

    useEffect(() => {
        if (selectedCustomer && selectedCustomer.cardPromoDiscount && selectedCustomer.cardPromoDiscount > 0) {
            setCardPromoDiscount(selectedCustomer.cardPromoDiscount);
        } else {
            setCardPromoDiscount(0);
        }
        // Reset discounts when customer changes
        setAppliedCoupon(null);
        setPromoCodeInput('');
        setPointsApplied(0);
        setPointsDiscount(0);
        setPointsToUse('');
    }, [selectedCustomer]);
    
    const { 
        totalItems,
        regularItemsSubtotal,
        preOrderItemsSubtotal,
        preOrderDepositPayable,
        isPartialPayment
    } = useMemo(() => {
        let regularSub = 0;
        let preOrderSub = 0;
        let preOrderDeposit = 0;
        let partialPayment = false;
        let itemsCount = 0;

        cart.forEach(item => {
            const itemTotal = (item.variant?.price || 0) * item.quantity;
            itemsCount += item.quantity;

            if (item.product.preOrder?.enabled) {
                preOrderSub += itemTotal;
                const preOrderInfo = item.product.preOrder;
                if (preOrderInfo.enabled && preOrderInfo.depositAmount != null && preOrderInfo.depositAmount > 0) {
                    partialPayment = true;
                    if (preOrderInfo.depositType === 'percentage') {
                        preOrderDeposit += (itemTotal * preOrderInfo.depositAmount) / 100;
                    } else { // fixed
                        preOrderDeposit += (preOrderInfo.depositAmount * item.quantity);
                    }
                } else {
                    preOrderDeposit += itemTotal;
                }
            } else {
                regularSub += itemTotal;
            }
        });
        
        return { 
            totalItems: itemsCount,
            regularItemsSubtotal: regularSub,
            preOrderItemsSubtotal: preOrderSub,
            preOrderDepositPayable: preOrderDeposit,
            isPartialPayment: partialPayment,
        };
    }, [cart]);

    const cartSubtotal = regularItemsSubtotal + preOrderItemsSubtotal;

     useEffect(() => {
        // Card promo discount applies only to regular items
        const cardDiscountAmount = (regularItemsSubtotal * cardPromoDiscount) / 100;
        setCardPromoDiscountAmount(cardDiscountAmount);

        // Coupon discount also applies only to eligible regular items
        let promoDiscountAmount = 0;
        if (appliedCoupon) {
            const eligibleItems = cart.filter(item => {
                if (item.product.preOrder?.enabled) return false;
                if (!appliedCoupon.applicableProducts || appliedCoupon.applicableProducts.length === 0) return true;
                return appliedCoupon.applicableProducts.includes(item.product.id);
            });
    
            if (eligibleItems.length > 0) {
                const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0);
                if (eligibleSubtotal >= appliedCoupon.minimumSpend) {
                    if (appliedCoupon.discountType === 'fixed') {
                        promoDiscountAmount = Math.min(appliedCoupon.value, eligibleSubtotal);
                    } else { // percentage
                        promoDiscountAmount = (eligibleSubtotal * appliedCoupon.value) / 100;
                    }
                }
            }
        }
        setPromoDiscount(promoDiscountAmount);

        // Subtotal after all percentage/fixed discounts
        const subtotalAfterDiscounts = regularItemsSubtotal - cardDiscountAmount - promoDiscountAmount;

        // Points can be applied against the remaining regular item total + pre-order deposit
        const maxPayableBeforePoints = subtotalAfterDiscounts + preOrderDepositPayable;
        const applicablePointsDiscount = Math.min(pointsDiscount, maxPayableBeforePoints > 0 ? maxPayableBeforePoints : 0);
        
        if (pointsDiscount > 0 && applicablePointsDiscount < pointsDiscount) {
            setPointsDiscount(applicablePointsDiscount);
        }

        const finalTotal = maxPayableBeforePoints - applicablePointsDiscount;
        setGrandTotal(finalTotal < 0 ? 0 : finalTotal);
    }, [regularItemsSubtotal, preOrderDepositPayable, cardPromoDiscount, appliedCoupon, pointsDiscount, cart]);


    const filteredCustomers = useMemo(() => {
        if (!customerSearch || !managedCustomers) return [];
        return managedCustomers.filter(u =>
            u.displayName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
            u.phone?.includes(customerSearch)
        ).slice(0, 5);
    }, [customerSearch, managedCustomers]);

    const handleSelectCustomer = (customer: UserData) => {
        setSelectedCustomer(customer);
        setCustomerSearch('');
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setCart([]);
    };

    const availableVariants = useMemo(() => {
        if (!allProducts || !selectedCustomer) return [];

        const variants: SearchableVariant[] = [];
        allProducts.forEach(product => {
            if (product.status !== 'approved') return;

            const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});

            variantsArray.forEach(variant => {
                if (product.total_stock > 0) { // Check overall product stock
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

    }, [allProducts, selectedCustomer, searchTerm]);

    const addToCart = (product: Product, variant: ProductVariant | null) => {
        if (!variant) {
            toast({ variant: 'destructive', title: 'Variant not available' });
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.variant.sku === variant.sku);
            if (existingItem) {
                return prevCart.map(item => item.variant.sku === variant.sku ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { product, variant, quantity: 1 }];
        });
    };

    const updateQuantity = (variantSku: string, newQuantity: number) => {
        if (newQuantity > 0) {
            setCart(prev => prev.map(item => item.variant.sku === variantSku ? { ...item, quantity: newQuantity } : item));
        } else {
            setCart(prev => prev.filter(item => item.variant.sku !== variantSku));
        }
    };
    
    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim() || !firestore) return;
        setIsApplyingPromo(true);
    
        const code = promoCodeInput.trim().toUpperCase();
        const couponRef = doc(firestore, 'coupons', code);
        try {
            const couponSnap = await getDoc(couponRef);
            if (!couponSnap.exists()) throw new Error('Invalid code');
            
            const coupon = { id: couponSnap.id, ...couponSnap.data() } as Coupon;
            if (new Date(coupon.expiryDate.seconds * 1000) < new Date()) throw new Error('Expired code');
            if (coupon.usedCount >= coupon.usageLimit) throw new Error('Usage limit reached');
    
            const eligibleItems = cart.filter(item => {
                if (item.product.preOrder?.enabled) return false;
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
            toast({ variant: 'destructive', title: 'Error applying promo code', description: error.message });
            setAppliedCoupon(null);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const removePromoCode = () => {
        setAppliedCoupon(null);
        setPromoCodeInput('');
        toast({ title: 'Promo code removed.' });
    };

    const handleApplyPoints = () => {
        if (!selectedCustomer) return;
        const pointsNum = parseInt(pointsToUse, 10);
        const availablePoints = selectedCustomer.loyaltyPoints || 0;
        if (isNaN(pointsNum) || pointsNum <= 0 || pointsNum > availablePoints) {
            toast({ variant: 'destructive', title: 'Invalid points amount' });
            return;
        }

        const maxDiscount = (regularItemsSubtotal - cardPromoDiscountAmount - promoDiscount) + preOrderDepositPayable;
        const requestedDiscount = pointsNum * pointValue;

        if (requestedDiscount > maxDiscount) {
            const maxPoints = Math.floor(maxDiscount / pointValue);
            toast({ title: 'Discount Limit Exceeded', description: `You can use a maximum of ${maxPoints} points for this order.` });
            if(maxPoints > 0) {
              setPointsApplied(maxPoints);
              setPointsDiscount(maxPoints * pointValue);
            } else {
              setPointsApplied(0);
              setPointsDiscount(0);
            }
        } else {
            setPointsApplied(pointsNum);
            setPointsDiscount(requestedDiscount);
            toast({ title: 'Points Applied!', description: `${pointsNum} points used for a discount of ৳${requestedDiscount.toFixed(2)}.` });
        }
        setPointsToUse('');
    };

    const removePoints = () => {
        setPointsApplied(0);
        setPointsDiscount(0);
        toast({ title: 'Points discount removed.' });
    };

    const handlePlaceOrder = async () => {
        if (!firestore || !user || !selectedCustomer || cart.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot place order. Ensure customer and cart are not empty.' });
            return;
        }
        
        setIsProcessing(true);

        const primaryAddress = selectedCustomer.addresses?.[0];
        if (!primaryAddress) {
            toast({ variant: 'destructive', title: 'Address Missing', description: "Selected customer doesn't have a shipping address."});
            setIsProcessing(false);
            return;
        }

        let assignedOutletId: string | null = null;
        if (allOutlets && allProducts) {
             const suitableOutlets = allOutlets.filter(outlet => 
                outlet.status === 'Active' &&
                cart.every(cartItem => {
                    const product = allProducts.find(p => p.id === cartItem.product.id);
                    if (!product || product.preOrder?.enabled) return true;
                    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
                    const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
                    return (variant?.outlet_stocks?.[outlet.id] ?? 0) >= cartItem.quantity;
                })
            );

            if (primaryAddress.coordinates?.lat && primaryAddress.coordinates?.lng && suitableOutlets.length > 0) {
                const customerCoords = { lat: primaryAddress.coordinates.lat, lng: primaryAddress.coordinates.lng };
                const outletsWithDistance = suitableOutlets.map(outlet => ({ ...outlet, distance: calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng)}));
                assignedOutletId = outletsWithDistance.sort((a, b) => a.distance - b.distance)[0]?.id;
            } else if (suitableOutlets.length > 0) {
                assignedOutletId = suitableOutlets[0].id;
            }
        }
        
        if (!assignedOutletId && cart.some(i => !i.product.preOrder?.enabled)) {
            toast({ variant: 'destructive', title: 'Cannot Place Order', description: 'No suitable outlet found to fulfill the regular items.' });
            setIsProcessing(false);
            return;
        }

        const orderId = doc(collection(firestore, 'id_generator')).id;
        try {
            await runTransaction(firestore, async (transaction) => {
                const orderRef = doc(firestore, 'orders', orderId);

                const finalShippingAddress: ShippingAddress = {
                    name: primaryAddress.name, phone: primaryAddress.phone, division: primaryAddress.division, district: primaryAddress.district,
                    upazila: primaryAddress.upazila, area: primaryAddress.area, streetAddress: primaryAddress.streetAddress,
                };
                
                const orderData: Order = {
                    id: orderId,
                    customerId: selectedCustomer.uid,
                    salesRepId: user.uid,
                    shippingAddress: finalShippingAddress,
                    items: cart.map(item => ({ productId: item.product.id, productName: item.product.name, variantSku: item.variant.sku, quantity: item.quantity, price: item.variant.price })),
                    subtotal: cartSubtotal,
                    cardPromoDiscountAmount,
                    discountAmount: promoDiscount,
                    promoCode: appliedCoupon?.code,
                    loyaltyPointsUsed: pointsApplied,
                    loyaltyDiscount,
                    totalAmount: grandTotal,
                    fullOrderValue: cartSubtotal,
                    assignedOutletId: assignedOutletId || undefined,
                    status: 'new',
                    paymentStatus: 'Unpaid',
                    orderType: cart.some(i => i.product.preOrder?.enabled) ? 'pre-order' : 'regular',
                    orderMode: 'delivery',
                    createdAt: serverTimestamp() as any,
                };
                transaction.set(orderRef, orderData);

                // Stock deduction
                if(assignedOutletId){
                    for (const item of cart.filter(i => !i.product.preOrder?.enabled)) {
                        const productRef = doc(firestore, 'products', item.product.id);
                        const productDoc = await transaction.get(productRef);
                        if (!productDoc.exists()) throw new Error(`Product ${item.product.name} not found.`);
                        
                        const productData = productDoc.data() as Product;
                        const variantsArray = Array.isArray(productData.variants) ? JSON.parse(JSON.stringify(productData.variants)) : JSON.parse(JSON.stringify(Object.values(productData.variants || {})));
                        const variantIndex = variantsArray.findIndex((v: ProductVariant) => v.sku === item.variant.sku);

                        if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found for product ${product.name}.`);
                        
                        const variant = variantsArray[variantIndex];
                        const currentOutletStock = variant.outlet_stocks?.[assignedOutletId] ?? 0;
                        if (currentOutletStock < item.quantity) throw new Error(`Not enough stock for ${item.product.name}.`);
                        
                        variant.stock = (variant.stock || 0) - item.quantity;
                        if (variant.outlet_stocks) variant.outlet_stocks[assignedOutletId] = currentOutletStock - item.quantity;

                        transaction.update(productRef, { variants: variantsArray, total_stock: increment(-item.quantity) });
                    }
                }
                
                if (pointsApplied > 0) {
                     const userRef = doc(firestore, 'users', selectedCustomer.uid);
                     transaction.update(userRef, { loyaltyPoints: increment(-pointsApplied) });
                     const historyRef = doc(collection(firestore, `users/${selectedCustomer.uid}/points_history`));
                     transaction.set(historyRef, {
                        userId: selectedCustomer.uid,
                        pointsChange: -pointsApplied,
                        type: 'redeem',
                        reason: `Order placed by Sales Rep: ${orderId}`,
                        createdAt: serverTimestamp()
                     })
                }
                 if (appliedCoupon) {
                    const couponRef = doc(firestore, 'coupons', appliedCoupon.id);
                    transaction.update(couponRef, { usedCount: increment(1) });
                }
            });
            toast({ title: 'Order Placed Successfully!', description: `Order ID: ${orderId}` });
            handleClearCustomer();
        } catch (error: any) {
            console.error('Order placement failed:', error);
            toast({ variant: 'destructive', title: 'Order Failed', description: error.message || 'Could not place order.' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!selectedCustomer) {
        return (
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> Select Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                         <ScrollArea className="h-64 border rounded-md">
                            {customersLoading ? <p className="p-4 text-center">Loading customers...</p> : 
                            filteredCustomers.length > 0 ? filteredCustomers.map((cust: UserData) => (
                                <div key={cust.uid} onClick={() => handleSelectCustomer(cust)} className="p-3 hover:bg-muted cursor-pointer border-b">
                                    <p className="font-semibold text-sm">{cust.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{cust.email}</p>
                                </div>
                            )) : (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    {customerSearch ? 'No customers found.' : 'Start typing to search.'}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
         <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
            <div className="lg:col-span-3 flex flex-col gap-4 p-4">
                <form onSubmit={(e) => { e.preventDefault(); searchInputRef.current?.focus(); }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search products by name/SKU..."
                            className="pl-10 h-12 text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>

                <Card className="flex-1">
                    <ScrollArea className="h-[calc(100vh-250px)] rounded-lg">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                            {isLoading ? [...Array(12)].map((_, i) => (
                                <div key={i} className="flex flex-col space-y-2">
                                    <Skeleton className="aspect-square w-full rounded-lg" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-5 w-1/2" />
                                </div>
                            )) : availableVariants.map(variant => {
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
                                        <p className="text-sm font-bold text-primary">৳{variant.price.toFixed(2)}</p>
                                    </CardFooter>
                                </Card>
                            )})}
                        </div>
                    </ScrollArea>
                </Card>
            </div>

            <div className="lg:col-span-2 h-full p-4 border-l bg-muted/30">
                 <div className="flex flex-col gap-4 h-full">
                    <Card className="shadow-md flex-shrink-0">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg"><User /> Customer</CardTitle>
                                <p className="font-bold text-sm text-primary">{selectedCustomer.displayName}</p>
                                <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClearCustomer}><ArrowLeft className="mr-2 h-4 w-4"/>Change</Button>
                        </CardHeader>
                        <CardContent className="pt-0 text-xs space-y-1">
                            <Separator className="mb-2" />
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
                        </CardContent>
                    </Card>
                    
                    <Card className="flex-1 flex flex-col shadow-lg">
                        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart /> Current Order</CardTitle></CardHeader>
                        <ScrollArea className="flex-grow">
                            <CardContent className="space-y-4">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground"><ShoppingCart className="w-16 h-16" /><p className="mt-4">Cart is empty</p></div>
                                ) : cart.map((item: CartItem) => (
                                    <div key={item.variant.sku} className="flex items-center gap-4 border-b pb-2">
                                        <div className="flex-grow"><p className="text-sm font-medium truncate">{item.product.name} <span className="text-muted-foreground text-xs">({item.variant.sku})</span></p><p className="text-xs text-muted-foreground">৳{item.variant.price.toFixed(2)}</p></div>
                                        <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variant.sku, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button><span className="font-bold text-sm w-6 text-center">{item.quantity}</span><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button></div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => updateQuantity(item.variant.sku, 0)}><XCircle className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </CardContent>
                        </ScrollArea>
                        <CardFooter className="flex-col items-stretch space-y-4 border-t p-4 bg-muted/30">
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>Subtotal</span><span>৳{cartSubtotal.toFixed(2)}</span></div>
                                {cardPromoDiscountAmount > 0 && <div className="flex justify-between text-green-600"><span>Card Discount ({cardPromoDiscount}%)</span><span>- ৳{cardPromoDiscountAmount.toFixed(2)}</span></div>}
                                {promoDiscount > 0 && <div className="flex justify-between text-green-600"><span>Promo ({appliedCoupon?.code})</span><span>- ৳{promoDiscount.toFixed(2)}</span></div>}
                                {pointsDiscount > 0 && <div className="flex justify-between text-green-600"><span>Loyalty Discount</span><span>- ৳{pointsDiscount.toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total ({totalItems} items)</span><span>৳{grandTotal.toFixed(2)}</span></div>
                            </div>
                            <Separator />
                             <div className="space-y-2">
                                {appliedCoupon ? (
                                    <div className="flex justify-between items-center bg-green-100/50 p-2 rounded-md"><div className="text-green-700"><p className="text-sm font-bold">Applied: {appliedCoupon.code}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={removePromoCode}><XCircle className="h-4 w-4" /></Button></div>
                                ) : (
                                    <div className="flex items-end gap-2"><div className="flex-1 space-y-1"><Label htmlFor="promo-code" className="text-xs font-medium">Promo Code</Label><Input id="promo-code" placeholder="Enter code" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} disabled={isApplyingPromo} /></div><Button onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCodeInput}>{isApplyingPromo ? '...' : 'Apply'}</Button></div>
                                )}
                            </div>
                            {selectedCustomer && (selectedCustomer.loyaltyPoints || 0) > 0 && (
                                <div className="space-y-2 pt-2"><Label className="font-bold flex items-center gap-2 text-sm"><Award size={16} /> Use Loyalty Points</Label><div className="p-3 bg-primary/5 border border-primary/10 rounded-lg space-y-2"><p className="text-xs text-muted-foreground">Available: <span className="font-bold text-primary">{selectedCustomer.loyaltyPoints}</span> points</p>{pointsApplied > 0 ? (<div className="flex justify-between items-center bg-green-100/50 p-2 rounded-md"><div className="text-green-700"><p className="text-sm font-bold">Applied: {pointsApplied} points</p><p className="text-xs">-৳{pointsDiscount.toFixed(2)}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={removePoints}><XCircle className="h-4 w-4" /></Button></div>) : (<div className="flex items-end gap-2"><Input placeholder="Points to use" type="number" value={pointsToUse} onChange={(e) => setPointsToUse(e.target.value)} /><Button onClick={handleApplyPoints}>Apply</Button></div>)}</div></div>
                            )}
                            <Separator />
                            <Button size="lg" disabled={cart.length === 0 || isProcessing} onClick={handlePlaceOrder} className="h-14 text-lg">
                                {isProcessing ? 'Processing...' : 'Place Order'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

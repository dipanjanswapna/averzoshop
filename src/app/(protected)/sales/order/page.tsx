'use client';
import { useState, useMemo, useRef }from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MinusCircle, XCircle, ShoppingCart, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Product, ProductVariant } from '@/types/product';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp, collection, increment, query, where } from 'firebase/firestore';
import type { Order, ShippingAddress } from '@/types/order';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { UserData } from '@/types/user';
import { calculateDistance } from '@/lib/distance';
import type { Outlet } from '@/types/outlet';

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

    const isLoading = productsLoading || customersLoading || outletsLoading;

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
    
    const { cartSubtotal, totalItems } = useMemo(() => {
        const subtotal = cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);
        const itemsCount = cart.reduce((total, item) => total + item.quantity, 0);
        return { cartSubtotal: subtotal, totalItems: itemsCount };
    }, [cart]);

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

        // Logic to find the best outlet
        const regularItems = cart.filter(item => !item.product.preOrder?.enabled);
        let assignedOutletId: string | null = null;
        if (regularItems.length > 0 && allOutlets) {
             const suitableOutlets = allOutlets.filter(outlet => 
                outlet.status === 'Active' &&
                regularItems.every(cartItem => {
                    const product = allProducts?.find(p => p.id === cartItem.product.id);
                    if (!product) return false;
                    const variantsArray = Array.isArray(product.variants) ? product.variants : Object.values(product.variants || {});
                    const variant = variantsArray.find(v => v.sku === cartItem.variant.sku);
                    return (variant?.outlet_stocks?.[outlet.id] ?? 0) >= cartItem.quantity;
                })
            );

            if (primaryAddress.coordinates?.lat && primaryAddress.coordinates?.lng && suitableOutlets.length > 0) {
                const customerCoords = { lat: primaryAddress.coordinates.lat, lng: primaryAddress.coordinates.lng };
                const outletsWithDistance = suitableOutlets.map(outlet => ({ ...outlet, distance: calculateDistance(customerCoords.lat, customerCoords.lng, outlet.location.lat, outlet.location.lng)}));
                const sortedOutlets = outletsWithDistance.sort((a, b) => a.distance - b.distance);
                assignedOutletId = sortedOutlets[0]?.id;
            } else if (suitableOutlets.length > 0) {
                assignedOutletId = suitableOutlets[0].id;
            }
        }
        
        if (!assignedOutletId && regularItems.length > 0) {
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
                    items: cart.map(item => ({
                        productId: item.product.id,
                        productName: item.product.name,
                        variantSku: item.variant.sku,
                        quantity: item.quantity,
                        price: item.variant.price
                    })),
                    subtotal: cartSubtotal,
                    totalAmount: cartSubtotal, // Simplified for now, no complex discounts
                    assignedOutletId: assignedOutletId || undefined,
                    status: 'new',
                    paymentStatus: 'Unpaid',
                    orderType: cart.some(i => i.product.preOrder?.enabled) ? 'pre-order' : 'regular',
                    orderMode: 'delivery',
                    createdAt: serverTimestamp() as any,
                };
                transaction.set(orderRef, orderData);

                // Stock deduction
                for (const item of regularItems) {
                    const productRef = doc(firestore, 'products', item.product.id);
                    const productDoc = await transaction.get(productRef);
                    if (!productDoc.exists()) throw new Error(`Product ${item.product.name} not found.`);
                    
                    const productData = productDoc.data() as Product;
                    const variantsArray = Array.isArray(productData.variants) ? [...productData.variants] : [...Object.values(productData.variants)];
                    const variantIndex = variantsArray.findIndex(v => v.sku === item.variant.sku);

                    if (variantIndex === -1) throw new Error(`Variant ${item.variant.sku} not found.`);
                    
                    // The outlet stock check was already done, here we just perform the deduction.
                    if (assignedOutletId) {
                        variantsArray[variantIndex].stock = (variantsArray[variantIndex].stock || 0) - item.quantity;
                        variantsArray[variantIndex].outlet_stocks![assignedOutletId] = (variantsArray[variantIndex].outlet_stocks![assignedOutletId] || 0) - item.quantity;
                    }

                    transaction.update(productRef, {
                        variants: variantsArray,
                        total_stock: increment(-item.quantity),
                    });
                }
            });
            toast({ title: 'Order Placed Successfully!', description: `Order ID: ${orderId}` });
            handleClearCustomer(); // Resets the form
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
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                <span>Total ({totalItems} items)</span>
                                <span>৳{cartSubtotal.toFixed(2)}</span>
                            </div>
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

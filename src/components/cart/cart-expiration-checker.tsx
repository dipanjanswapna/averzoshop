'use client';
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

export function CartExpirationChecker() {
    const removeExpiredItems = useCart(state => state.removeExpiredItems);
  
    useEffect(() => {
        // Periodically check for and remove expired item reservations from the cart.
        const interval = setInterval(() => {
            removeExpiredItems();
        }, 15 * 1000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, [removeExpiredItems]);

    return null; // This component does not render anything.
}

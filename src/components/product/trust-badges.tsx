'use client';
import { ShieldCheck, Truck, RotateCw, BadgeCheck } from 'lucide-react';

const trustItems = [
    { icon: ShieldCheck, text: "100% Authentic Product" },
    { icon: Truck, text: "Cash on Delivery Available" },
    { icon: RotateCw, text: "7 Days Replacement" },
    { icon: BadgeCheck, text: "Warranty Information" }
]

export function TrustBadges() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-6">
            {trustItems.map(item => (
                <div key={item.text} className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-primary">
                        <item.icon size={24} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{item.text}</span>
                </div>
            ))}
        </div>
    );
}

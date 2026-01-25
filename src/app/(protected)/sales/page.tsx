
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/sales/dashboard');
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to sales dashboard...</p>
        </div>
    );
}

'use client';

import { AddressManager } from "@/components/customer/address-manager";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import AverzoLogo from "@/components/averzo-logo";
import { FirebaseClientProvider } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function OnboardingPageContent() {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && userData?.addresses && userData.addresses.length > 0) {
            router.replace('/customer');
        }
    }, [userData, loading, router]);
    
    if (loading) {
         return (
             <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center justify-center gap-6">
                    <div className="lds-ring"><div /><div /><div /><div /></div>
                    <AverzoLogo className="text-xl" />
                    <p className="text-muted-foreground animate-pulse">Loading onboarding...</p>
                </div>
            </div>
         )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="w-full max-w-4xl space-y-6">
                <div className="text-center">
                    <AverzoLogo className="mx-auto mb-4" />
                    <h1 className="text-3xl font-bold font-headline">Welcome to Averzo!</h1>
                    <p className="text-muted-foreground">Just one more step to complete your profile.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Add Your Address</CardTitle>
                        <CardDescription>
                            Please add at least one shipping address to start shopping with us. This will help us deliver your orders quickly and accurately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AddressManager />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <FirebaseClientProvider>
            <OnboardingPageContent />
        </FirebaseClientProvider>
    )
}

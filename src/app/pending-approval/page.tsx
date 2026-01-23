'use client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AverzoLogo from '@/components/averzo-logo';
import { Clock, XCircle } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase';

function PendingApprovalPageContent() {
    const { auth, userData, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        if (auth) {
            await firebaseSignOut(auth);
            router.replace('/login');
        }
    };
    
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center gap-6 h-48">
                    <div className="lds-ring">
                        <div /><div /><div /><div />
                    </div>
                    <p className="text-muted-foreground animate-pulse">Checking account status...</p>
                </div>
            );
        }

        switch (userData?.status) {
            case 'pending':
                return (
                    <>
                        <Clock className="mx-auto h-16 w-16 text-primary mb-4" />
                        <h1 className="text-2xl font-bold font-headline">Account Pending Approval</h1>
                        <p className="text-muted-foreground mt-2">
                            Thank you for registering! Your account is currently under review by our admin team.
                            We'll notify you via email once your account has been approved.
                        </p>
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-500/30">
                            <p>If you have any urgent queries, please contact us at <a href="mailto:support@averzo.com" className="font-bold underline">support@averzo.com</a></p>
                        </div>
                    </>
                );
            case 'rejected':
                return (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                        <h1 className="text-2xl font-bold font-headline text-destructive">Account Suspended</h1>
                        <p className="text-muted-foreground mt-2">
                            Your account has been suspended or rejected. If you believe this is an error, please contact our support team.
                        </p>
                         <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/30">
                            <p>Contact support at <a href="mailto:support@averzo.com" className="font-bold underline">support@averzo.com</a> for assistance.</p>
                        </div>
                    </>
                );
            default:
                 // Redirect if status is somehow approved or something else
                if (typeof window !== 'undefined') {
                    router.replace('/');
                }
                return <p>Redirecting...</p>;
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="w-full max-w-md text-center">
                 <AverzoLogo className="mx-auto mb-6" />
                <div className="bg-background p-8 rounded-xl shadow-lg">
                    {renderContent()}
                    <Button onClick={handleLogout} variant="outline" className="mt-8 w-full">
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PendingApprovalPage() {
    return (
        <FirebaseClientProvider>
            <PendingApprovalPageContent />
        </FirebaseClientProvider>
    )
}

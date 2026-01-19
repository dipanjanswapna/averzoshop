'use client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AverzoLogo from '@/components/averzo-logo';
import { Clock, Mail } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase';

function PendingApprovalPageContent() {
    const { auth } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        if (auth) {
        await firebaseSignOut(auth);
        router.replace('/login');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="w-full max-w-md text-center">
                 <AverzoLogo className="mx-auto mb-6" />
                <div className="bg-background p-8 rounded-xl shadow-lg">
                    <Clock className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h1 className="text-2xl font-bold font-headline">Account Pending Approval</h1>
                    <p className="text-muted-foreground mt-2">
                        Thank you for registering! Your account is currently under review by our admin team.
                        We'll notify you via email once your account has been approved.
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                        <p>If you have any urgent queries, please contact us at <a href="mailto:support@averzo.com" className="font-bold underline">support@averzo.com</a></p>
                    </div>
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

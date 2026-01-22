
'use client';
import StoreLayout from './(store)/layout';
import StoreFrontPage from './(store)/page';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function Page() {
    return (
        <FirebaseClientProvider>
            <StoreLayout>
                <StoreFrontPage />
            </StoreLayout>
        </FirebaseClientProvider>
    )
}


import AverzoLogo from '@/components/averzo-logo';
import StoreHeader from '@/components/store-header';
import Link from 'next/link';

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <StoreHeader />
      <main className="flex-1 pt-[112px]">{children}</main>
      {/* --- Desktop Footer --- */}
      <footer className="bg-secondary text-secondary-foreground hidden lg:block">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <AverzoLogo className="h-7 w-auto" />
              <p className="mt-4 text-sm text-muted-foreground font-body">
                The future of fashion and retail.
              </p>
            </div>
            <div>
              <h3 className="font-semibold font-headline">Shop</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Men
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Women
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Kids
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline">About</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold font-headline">Support</h3>
              <ul className="mt-4 space-y-2 text-sm font-body">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Shipping &amp; Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground font-body">
            <p>&copy; {new Date().getFullYear()} Averzo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

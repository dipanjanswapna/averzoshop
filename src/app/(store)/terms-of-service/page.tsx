
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from '@/components/ui/breadcrumb';
  
  export default function TermsOfServicePage() {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Terms of Service</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl font-extrabold font-headline tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
  
        <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">1. Introduction</h2>
            <p>Welcome to Averzo. These Terms of Service ("Terms") govern your use of our website located at [Your Website URL] (the "Service") and form a binding contractual agreement between you, the user of the Service, and us. By using the Service, you agree to be bound by these Terms.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">2. User Accounts</h2>
            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">3. Products and Pricing</h2>
            <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Service. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors. All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">4. Orders and Payment</h2>
            <p>We accept various forms of payment as indicated at checkout. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service. We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">5. Shipping and Delivery</h2>
            <p>We will arrange for shipment of the products to you. Please check the individual product page for specific delivery options. You will pay all shipping and handling charges specified during the ordering process. Shipping and delivery dates are estimates only and cannot be guaranteed. We are not liable for any delays in shipments.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">6. Returns and Refunds</h2>
            <p>Please review our Return Policy posted on the Service prior to making any purchases. Generally, we offer a 7-day return policy for unused and unopened products.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">7. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Averzo and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">8. Limitation of Liability</h2>
            <p>In no event shall Averzo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">9. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">10. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@averzo.com.</p>
          </section>
        </div>
      </div>
    );
  }

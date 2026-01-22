
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from '@/components/ui/breadcrumb';
  
  export default function PrivacyPolicyPage() {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-4xl font-extrabold font-headline tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
  
        <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, such as when you create an account, place an order, or communicate with us. This information may include your name, email address, shipping address, phone number, and payment information. We also collect some information automatically, such as your IP address and browsing behavior.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and fulfill your orders, including sending you emails to confirm your order status and shipment.</li>
              <li>Communicate with you about products, services, offers, and promotions.</li>
              <li>Improve our website, products, and services.</li>
              <li>Detect and prevent fraud and abuse.</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">3. Information Sharing</h2>
            <p>We do not sell or rent your personal information to third parties. We may share your information with third-party service providers who perform services on our behalf, such as payment processing, shipping, and data analysis. These service providers are authorized to use your personal information only as necessary to provide these services to us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">4. Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain types of processing of your personal information. You can exercise these rights by accessing your account settings or by contacting us directly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">6. Cookies</h2>
            <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@averzo.com.</p>
          </section>
        </div>
      </div>
    );
  }

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
        <h1 className="text-4xl font-extrabold font-headline tracking-tight mb-4">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
  
        <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>Welcome to Averzo! These terms and conditions outline the rules and regulations for the use of Averzo's Website, located at [Your Website URL]. By accessing this website we assume you accept these terms and conditions. Do not continue to use Averzo if you do not agree to take all of the terms and conditions stated on this page.</p>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">1. Interpretation and Definitions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>"Company"</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Averzo.</li>
              <li><strong>"Service"</strong> refers to the Website.</li>
              <li><strong>"Terms and Conditions"</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</li>
              <li><strong>"You"</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
              <li><strong>"Website"</strong> refers to Averzo, accessible from [Your Website URL].</li>
              <li><strong>"Product"</strong> refers to any item sold on the Website.</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">2. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on our Service.</li>
                <li>You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password.</li>
                <li>You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming aware of any breach of security or unauthorized use of Your account.</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">3. Products and Pricing</h2>
             <ul className="list-disc pl-5 space-y-2">
                <li>We reserve the right to modify or discontinue any Product at any time without prior notice.</li>
                <li>Prices for our Products are subject to change without notice.</li>
                <li>We shall not be liable to You or to any third-party for any modification, price change, suspension, or discontinuance of the Service.</li>
                <li>We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">4. Orders, Payment, and Fulfillment</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li>We reserve the right to refuse or cancel any order You place with Us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.</li>
                <li>You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</li>
                <li>For online payments, we use a third-party payment gateway (SSLCommerz). We are not responsible for any issues arising from the use of the payment gateway.</li>
                <li>Order fulfillment is subject to stock availability. We may route your order to be fulfilled from any of our designated outlets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">5. Shipping and Delivery</h2>
             <ul className="list-disc pl-5 space-y-2">
                <li>Shipping and delivery times are estimates only and cannot be guaranteed.</li>
                <li>Risk of loss and title for all Products ordered by You pass to You on our delivery to the carrier.</li>
            </ul>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">6. Returns and Refunds</h2>
            <p>Our Return and Refund Policy provides detailed information about options and procedures for returning your order. Please review our policy, which is accessible on our website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">7. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Averzo and its licensors. The Service is protected by copyright, trademark, and other laws of both Bangladesh and foreign countries.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">8. Limitation of Liability</h2>
            <p>In no event shall Averzo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">9. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">10. Changes to These Terms and Conditions</h2>
            <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-bold font-headline text-foreground">11. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>By email: support@averzo.com</li>
              <li>By visiting this page on our website: [Your Contact Page URL]</li>
            </ul>
          </section>
        </div>
      </div>
    );
  }

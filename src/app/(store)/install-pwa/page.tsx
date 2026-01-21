
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function InstallPwaPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-extrabold font-headline tracking-tight mb-4">Install Averzo App (PWA)</h1>
      <p className="text-muted-foreground mb-8">
        You can install our website as an app on your computer or mobile device for a faster, more integrated experience. Follow the instructions for your device below.
      </p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. For PC/Computer (Chrome)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Method 1 (Direct Install):</h4>
              <p className="text-muted-foreground">
                If our website supports app installation, you will see an "Install" icon (a small computer icon with a downward arrow) on the right side of the address bar. Click on it and then click 'Install' to add the app to your desktop.
              </p>
            </div>
             <Separator />
            <div>
              <h4 className="font-semibold">Method 2 (From Menu):</h4>
               <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>Open the website.</li>
                    <li>Click the three-dot (⋮) menu in the top-right corner.</li>
                    <li>Go to 'Save and Share' and click 'Install page as app...'.</li>
                    <li>In the pop-up that appears, click 'Install'.</li>
                </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. For Android Mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>Open the website in your Chrome browser.</li>
                <li>Tap the three-dot (⋮) menu in the top-right corner.</li>
                <li>Find and tap 'Add to Home screen' or 'Install app'.</li>
                <li>Give it a name and tap 'Add' or 'Install'.</li>
                <li>The app icon will now appear on your mobile home screen.</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. For iPhone (iOS)</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>Open the website in the Safari browser.</li>
                <li>Tap the Share icon (a box with an upward arrow) at the bottom.</li>
                <li>Scroll down and select 'Add to Home Screen'.</li>
                <li>Tap 'Add' in the top-right corner to save it as an app.</li>
            </ol>
          </CardContent>
        </Card>

        <p className="text-sm text-center text-muted-foreground pt-4">
          <strong>Note:</strong> Not all websites support app installation. If the option is not available, the site will be saved as a simple shortcut.
        </p>
      </div>
    </div>
  );
}

import AverzoLogo from '@/components/averzo-logo';

export default function SplashPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative h-24 w-24">
            <span className="loader"></span>
            <div className="absolute inset-0 flex items-center justify-center">
                <AverzoLogo className="text-2xl" />
            </div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading Averzo...</p>
      </div>
    </div>
  );
}


import AverzoLogo from '@/components/averzo-logo';

export default function SplashPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="lds-ring">
            <div />
            <div />
            <div />
            <div />
          </div>
          <AverzoLogo className="absolute text-2xl" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading Averzo...</p>
      </div>
    </div>
  );
}

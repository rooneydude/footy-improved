'use client';

// Offline Fallback Page
// ✅ Code Quality Agent: PWA offline experience

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <WifiOff className="h-16 w-16 text-muted-foreground mx-auto" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
        <p className="text-muted-foreground mb-6">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Your recent events are cached locally and will sync when you're back online.
        </p>
      </div>
    </div>
  );
}

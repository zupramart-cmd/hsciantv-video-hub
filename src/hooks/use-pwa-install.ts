import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Global variable to persist the prompt across component re-renders and page navigations
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

export const usePwaInstall = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(globalDeferredPrompt);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      promptRef.current = promptEvent;
      setIsReady(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsReady(false);
      globalDeferredPrompt = null;
      promptRef.current = null;
    };

    // Check if prompt is already available from previous capture
    if (globalDeferredPrompt) {
      promptRef.current = globalDeferredPrompt;
      setIsReady(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (isInstalled) {
      toast({
        title: 'Already installed',
        description: 'অ্যাপটি ইতিমধ্যেই ইন্সটল করা আছে।',
      });
      return;
    }

    const prompt = promptRef.current || globalDeferredPrompt;

    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        globalDeferredPrompt = null;
        promptRef.current = null;
        setIsReady(false);
      } catch (error) {
        console.error('Install error:', error);
      }
    } else {
      // Fallback: Show manual install instructions for browsers that don't support beforeinstallprompt
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

      if (isIOS || isSafari) {
        toast({
          title: 'Safari-তে ম্যানুয়াল ইন্সটল',
          description: 'Safari-তে অটো ইন্সটল প্রম্পট সাপোর্ট করে না। Share/Menu থেকে “Add to Home Screen / Add to Dock” ব্যবহার করুন।',
        });
      } else {
        toast({
          title: 'ইন্সটল প্রস্তুত নয়',
          description: 'এই ব্রাউজারে অটো-ইন্সটল প্রম্পট এখনই দেখানো যাচ্ছে না। URL বারের ডান পাশে Install আইকনে ক্লিক করুন।',
        });
      }
    }
  }, [isInstalled]);

  return { 
    isInstallable: isReady && !isInstalled, 
    isInstalled, 
    installApp
  };
};

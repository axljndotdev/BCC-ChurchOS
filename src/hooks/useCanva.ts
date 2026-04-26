import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Canva?: {
      DesignButton: {
        initialize: (config: { apiKey: string }) => Promise<void>;
        create: (options: {
          type: string;
          onDesignPublished: (result: { url: string; designId: string }) => void;
        }) => void;
      };
    };
  }
}

export function useCanva() {
  const [isReady, setIsReady] = useState(false);
  const apiKey = import.meta.env.VITE_CANVA_API_KEY;

  useEffect(() => {
    if (!apiKey) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
    script.async = true;
    script.onload = () => {
      if (window.Canva) {
        window.Canva.DesignButton.initialize({ apiKey })
          .then(() => setIsReady(true))
          .catch(err => console.error('Failed to initialize Canva SDK:', err));
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [apiKey]);

  const openCanva = (type: string = 'SocialMedia', onPublished: (url: string) => void) => {
    if (!isReady || !window.Canva) {
      if (!apiKey) {
        alert('Please configure VITE_CANVA_API_KEY in your environment to use Canva features.');
      } else {
        alert('Canva SDK is still loading. Please try again in a moment.');
      }
      return;
    }

    window.Canva.DesignButton.create({
      type,
      onDesignPublished: (result) => {
        onPublished(result.url);
      }
    });
  };

  return { isReady, openCanva, hasKey: !!apiKey };
}

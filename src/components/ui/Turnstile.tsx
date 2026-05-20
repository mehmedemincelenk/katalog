import { useEffect, useRef } from 'react';
import { TurnstileProps, TurnstileOptions } from '../../types';

export default function Turnstile({ onVerify, options = {} }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!window.turnstile) return;
    if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);
    const hostname = window.location.hostname;
    const activeSiteKey =
      hostname === 'localhost' || hostname === '127.0.0.1'
        ? '1x00000000000000000000AA'
        : import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADAJkSXkZ8wkzSTM';
    widgetIdRef.current = window.turnstile.render(containerRef.current!, {
      sitekey: activeSiteKey,
      callback: (token: string) => onVerify(token),
      theme: options.theme || 'auto',
      size: options.size || 'normal',
    });
    return () => {
      if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);
    };
  }, [onVerify, options.theme, options.size]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions,
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

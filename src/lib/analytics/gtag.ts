// =========================================================
// Helper GA4 — funzioni per tracciare pageview ed eventi
// personalizzati. Non fanno nulla se l'utente non ha ancora
// dato consenso (gtag stesso ignora gli eventi finche'
// 'analytics_storage' e' 'denied', grazie al Consent Mode).
// =========================================================

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

interface TrackEventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export function trackEvent({ action, category, label, value }: TrackEventParams) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}
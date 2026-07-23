"use client";

/**
 * LanguageSwitcher
 * =====================================================================
 * Manual override — writes the same cookie LocaleSync reads, then
 * refreshes so both static text (next-intl) and Lara-translated CMS
 * content re-render in the chosen language. No navigation, same URL.
 * =====================================================================
 */

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, type Locale } from "@/i18n/localeShared";

const LABELS: Record<Locale, string> = {
  en: "EN",
  it: "IT",
};

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {

  const router = useRouter();

  function setLocale(locale: Locale) {
    if (locale === currentLocale) return;

    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs uppercase tracking-[0.15em]">
      {(Object.keys(LABELS) as Locale[]).map((locale) => (
        <button
          key={locale}
          onClick={() => setLocale(locale)}
          className={
            locale === currentLocale
              ? "text-white font-medium"
              : "text-white/40 hover:text-white/70 transition-colors"
          }
        >
          {LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
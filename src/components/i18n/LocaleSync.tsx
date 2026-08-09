"use client";

/**
 * LocaleSync
 * =====================================================================
 * Mount this once, near the root layout. Keeps the locale cookie
 * always in sync with the browser's actual navigator.language — no
 * manual override exists anywhere in the UI, so the only way to
 * change the site's language is to change the browser's language.
 *
 * Runs on every mount (every navigation/refresh triggers the effect,
 * but it's a no-op whenever the cookie already matches the browser):
 * if the cookie is missing, or disagrees with navigator.language
 * (first visit, or the browser's language changed since the last
 * visit), it (re)writes the cookie and does a soft refresh so the
 * next server render picks up the correct locale — invisible to the
 * user, no full page reload.
 * =====================================================================
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LOCALES, LOCALE_COOKIE_NAME, DEFAULT_LOCALE, type Locale } from "@/i18n/localeShared";

function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function writeCookie(name: string, value: string) {
  // 1 year, available site-wide
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function detectBrowserLocale(): Locale {
  const lang = navigator.language?.split("-")[0]?.toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(lang)
    ? (lang as Locale)
    : DEFAULT_LOCALE;
}

export default function LocaleSync({ serverLocale }: { serverLocale: Locale }) {

  const router = useRouter();

  useEffect(() => {

    const existingCookie = readCookie(LOCALE_COOKIE_NAME);
    const browserLocale = detectBrowserLocale();

    // Cookie already matches the browser's current language -> nothing
    // to do. Otherwise (missing, or the browser's language changed
    // since it was last written) overwrite it — always follow the
    // browser, never a frozen past choice.
    if (existingCookie === browserLocale) return;

    writeCookie(LOCALE_COOKIE_NAME, browserLocale);

    if (browserLocale !== serverLocale) {
      // Server rendered with a different guess — refresh once so
      // everything (static text + Lara-translated CMS content)
      // re-renders in the locale the browser actually reports.
      router.refresh();
    }

  }, [serverLocale, router]);

  return null;
}
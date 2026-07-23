"use client";

/**
 * LocaleSync
 * =====================================================================
 * Mount this once, near the root layout. It does NOT run on every
 * render — only fixes a mismatch between what the server guessed
 * (from the Accept-Language header, which can differ slightly from
 * the browser's actual navigator.language depending on proxies/CDN)
 * and what the browser really reports.
 *
 * If there's no cookie yet, or the cookie disagrees with
 * navigator.language, it sets the cookie and does a soft refresh so
 * the next server render picks up the correct locale — invisible to
 * the user, no full page reload.
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

    // Already has an explicit/confirmed cookie -> nothing to do,
    // respects a manual choice made via the LanguageSwitcher too.
    if (existingCookie) return;

    const browserLocale = detectBrowserLocale();

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
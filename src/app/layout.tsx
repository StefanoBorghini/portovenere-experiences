import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IubendaCookieSolution from "@/components/analytics/IubendaCookieSolution";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MicrosoftClarity from "../components/analytics/MicrosoftClarity";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getCurrentLocale } from "../i18n/locale";
import { DEFAULT_LOCALE, type Locale } from "../i18n/localeShared";
import LocaleSync from "../components/i18n/LocaleSync";
import LanguageSwitcher from "../components/i18n/LanguageSwitcher";
import enMessages from "../messages/en.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portovenere Experiences",
  description: "Private luxury experiences on the Italian Riviera.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Portovenere Experiences",
    description: "Private luxury experiences on the Italian Riviera.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com",
    siteName: "Portovenere Experiences",
    images: [
      {
        url: "/hero-config.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portovenere Experiences",
    description: "Private luxury experiences on the Italian Riviera.",
    images: ["/hero-config.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // =====================================================
  // LOCALE — stessa fonte di verita' usata anche da Lara
  // Translate (cookie "locale" -> fallback Accept-Language).
  // getMessages() legge da i18n/request.ts, che internamente
  // chiama la stessa getCurrentLocale(), quindi locale e
  // messages sono sempre coerenti tra loro.
  //
  // ECCEZIONE: /admin non va mai tradotto. E' un pannello ad
  // uso interno, non contenuto rivolto ai visitatori — resta
  // sempre in inglese, senza switcher e senza il refresh di
  // LocaleSync. Il pathname arriva dall'header che il middleware
  // imposta apposta (i Server Component non lo ricevono come prop).
  // =====================================================

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  const locale: Locale = isAdmin ? DEFAULT_LOCALE : await getCurrentLocale();
  // Per /admin non passiamo da getMessages() (che risolve il locale da
  // se' tramite getCurrentLocale() / i18n/request.ts, ignorando l'isAdmin
  // qui sopra): forziamo direttamente il bundle inglese cosi' locale e
  // messages restano coerenti anche quando la cookie "locale" e' "it".
  const messages = isAdmin ? enMessages : await getMessages();

  return (
    <html
      lang={locale} translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* Iubenda + Google Analytics — qui nel root layout,
            cosi' coprono TUTTE le pagine del sito (landing,
            configuratore, proposal page) con un solo punto
            di montaggio. Prima erano solo dentro page.tsx
            (solo landing) — vedi nota nello stato del progetto,
            da aggiornare dopo questa modifica. */}

        <IubendaCookieSolution />
        <GoogleAnalytics />
        <MicrosoftClarity />

        <NextIntlClientProvider locale={locale} messages={messages}>

          {!isAdmin && (
            <>
              {/* Corregge il locale se l'header Accept-Language letto
                  dal server differisce dal navigator.language reale del
                  browser — invisibile, nessun redirect, solo un refresh
                  se serve. Non renderizza nulla di suo. */}
              <LocaleSync serverLocale={locale} />

              {/* Switch manuale EN/IT — montato qui cosi' compare su
                  tutte le pagine pubbliche senza dover toccare gli
                  header di landing/configuratore/proposal uno per uno.
                  Mai su /admin (vedi isAdmin sopra). */}
              <div className="fixed top-4 right-4 z-[100]">
                <LanguageSwitcher currentLocale={locale} />
              </div>
            </>
          )}

          {children}

        </NextIntlClientProvider>

      </body>
    </html>
  );
}
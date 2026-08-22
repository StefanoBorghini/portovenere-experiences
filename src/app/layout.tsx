import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IubendaCookieSolution from "@/components/analytics/IubendaCookieSolution";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MicrosoftClarity from "../components/analytics/MicrosoftClarity";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getCurrentLocale } from "../i18n/locale";
import { DEFAULT_LOCALE, type Locale } from "../i18n/localeShared";
import LocaleSync from "../components/i18n/LocaleSync";

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
  // qui sopra). L'admin non consuma mai useTranslations(), quindi un
  // oggetto vuoto basta — evita anche una query a Supabase inutile.
  const messages = isAdmin ? {} : await getMessages();

  return (
    <html
      lang={locale} translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* Google Tag Manager (noscript) — fallback statico per i
            browser senza JS, richiesto dal setup standard GTM. A
            differenza degli script sotto, questo iframe non passa
            dall'autoblocking Iubenda (e' HTML puro, niente JS da
            bloccare): carica il container a prescindere dal
            consenso. Scelta esplicita nonostante l'incoerenza con
            il resto dei tracker qui sotto (tutti gated). */}

        {process.env.NEXT_PUBLIC_GTM_CONTAINER_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_CONTAINER_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* Iubenda + Google Analytics — qui nel root layout,
            cosi' coprono TUTTE le pagine del sito (landing,
            configuratore, proposal page) con un solo punto
            di montaggio. Prima erano solo dentro page.tsx
            (solo landing) — vedi nota nello stato del progetto,
            da aggiornare dopo questa modifica. */}

        <IubendaCookieSolution />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <GoogleTagManager />

        <NextIntlClientProvider locale={locale} messages={messages}>

          {!isAdmin && (
            // Corregge il locale se l'header Accept-Language letto dal
            // server differisce dal navigator.language reale del
            // browser (o se il browser cambia lingua da una visita
            // all'altra) — invisibile, nessun redirect, solo un
            // refresh se serve. Nessuno switch manuale: la lingua del
            // sito segue sempre e solo quella del browser. Non
            // renderizza nulla di suo, mai su /admin (vedi isAdmin
            // sopra).
            <LocaleSync serverLocale={locale} />
          )}

          {children}

        </NextIntlClientProvider>

      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IubendaCookieSolution from "@/components/analytics/IubendaCookieSolution";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MicrosoftClarity from "../components/analytics/MicrosoftClarity";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getCurrentLocale } from "../i18n/locale";
import LocaleSync from "../components/i18n/LocaleSync";
import LanguageSwitcher from "../components/i18n/LanguageSwitcher";

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
  // =====================================================

  const locale = await getCurrentLocale();
  const messages = await getMessages();

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

          {/* Corregge il locale se l'header Accept-Language letto
              dal server differisce dal navigator.language reale del
              browser — invisibile, nessun redirect, solo un refresh
              se serve. Non renderizza nulla di suo. */}
          <LocaleSync serverLocale={locale} />

          {/* Switch manuale EN/IT — montato qui cosi' compare su
              tutte le pagine senza dover toccare gli header di
              landing/configuratore/proposal uno per uno. Posizione
              fissa in alto a destra; spostalo/restylizzalo quando
              integriamo il resto dell'i18n nelle singole pagine. */}
          <div className="fixed top-4 right-4 z-[100]">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {children}

        </NextIntlClientProvider>

      </body>
    </html>
  );
}
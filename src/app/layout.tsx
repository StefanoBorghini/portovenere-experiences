import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
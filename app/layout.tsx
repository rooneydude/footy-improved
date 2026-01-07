// Root Layout
// 📚 Library Research Agent: next.js (136,976 ⭐)
// ✅ Code Quality Agent: Proper metadata, fonts, providers setup

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

// Metadata for SEO and PWA
export const metadata: Metadata = {
  title: {
    default: 'FootyTracker',
    template: '%s | FootyTracker',
  },
  description: 'Track your sports events, concerts, and live experiences. Log matches, discover stats, and relive your memories.',
  keywords: ['sports', 'tracker', 'football', 'soccer', 'basketball', 'baseball', 'tennis', 'concerts', 'events'],
  authors: [{ name: 'FootyTracker' }],
  creator: 'FootyTracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FootyTracker',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'FootyTracker',
    title: 'FootyTracker - Track Your Sports Events',
    description: 'Track your sports events, concerts, and live experiences.',
  },
};

// Viewport configuration for PWA
export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

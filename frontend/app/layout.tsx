import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { BottomNav } from '../components/bottom-nav';
import { ApkDownloadFab } from '../components/apk-download-fab';
import { ServiceWorkerRegister } from '../components/sw-register';

export const metadata: Metadata = {
  title: 'SignAction - Sign Language Translator',
  description:
    'Translate text and speech into sign language gestures.',
  keywords: [
    'sign language',
    'ISL',
    'accessibility',
    'translation',
    'offline',
  ],
  authors: [{ name: 'SignAction' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SignAction',
  },
};

export const viewport: Viewport = {
  themeColor: '#0066cc',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        <Providers>
          {/* Desktop nav - hidden on mobile */}
          <div className="hidden md:block">
            <Navbar />
          </div>

          {/* Main content - padding for bottom nav on mobile */}
          <main className="min-h-screen pb-24 md:pb-0">
            {children}
          </main>

          {/* Footer - hidden on mobile (app feel) */}
          <div className="hidden md:block">
            <Footer />
          </div>

          {/* Bottom navigation - mobile only */}
          <BottomNav />

          {/* APK download FAB */}
          <ApkDownloadFab />

          {/* Register service worker for offline PWA */}
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}

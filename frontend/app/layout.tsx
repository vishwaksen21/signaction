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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F6' },
    { media: '(prefers-color-scheme: dark)', color: '#050B14' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-[100dvh] flex flex-col bg-[#FAF9F6] dark:bg-[#050B14] text-[#062B5C] dark:text-slate-100 overflow-x-hidden">
        <Providers>
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Main content */}
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>

          {/* Modern Footer */}
          <Footer />

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

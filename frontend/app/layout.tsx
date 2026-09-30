import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { BottomNav } from '../components/bottom-nav';
import { ApkDownloadFab } from '../components/apk-download-fab';
import { ServiceWorkerRegister } from '../components/sw-register';

export const metadata: Metadata = {
  title: 'SignAction — Indian Sign Language Translator',
  description:
    'Convert spoken audio and written English into verified Indian Sign Language gestures. 100% on-device, private, and offline-first.',
  keywords: [
    'Indian Sign Language',
    'ISL',
    'accessibility',
    'sign language translator',
    'offline translation',
    'speech to sign',
  ],
  authors: [{ name: 'SignAction Project' }],
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
  themeColor: '#0757E8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#FAF9F6] dark:bg-[#050B14] text-[#0F172A] dark:text-slate-100 antialiased selection:bg-[#0EA5E9]/20 selection:text-[#062B5C]">
        <Providers>
          {/* Floating Pill Navbar */}
          <Navbar />

          {/* Main content - padding for bottom nav on mobile */}
          <main className="min-h-screen pb-24 md:pb-0">
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

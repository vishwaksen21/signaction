import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { ServiceWorkerRegister } from '../components/sw-register';
import { ApkDownloadFab } from '../components/apk-download-fab';

export const metadata: Metadata = {
  title: 'SignAction - Text & Speech to Sign Language',
  description:
    'Translate text and speech into sign language gestures. Works offline on mobile.',
  keywords: [
    'sign language',
    'ASL',
    'accessibility',
    'AI',
    'translation',
    'offline',
    'PWA',
  ],
  authors: [{ name: 'SignAction Team' }],
  icons: {
    icon: '/logo1.png',
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
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <ServiceWorkerRegister />
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <ApkDownloadFab />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';

export const metadata: Metadata = {
  title: 'SignAction - Text & Speech to Sign Language',
  description: 'Transform text and speech into beautiful sign language gestures powered by AI.',
  keywords: ['sign language', 'ASL', 'accessibility', 'AI', 'translation'],
  authors: [{ name: 'SignAction Team' }],
  icons: {
    icon: '/logo1.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent layout shift from scrollbar */}
        <style>{`html { scroll-behavior: smooth; }`}</style>
        <link rel="icon" href="/logo1.png" />
      </head>
      <body className="bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-300">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

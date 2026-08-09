'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-apple-canvas-parchment text-apple-ink-muted-80 pt-[64px] pb-[32px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-[48px]">
          <div className="flex flex-col gap-2">
            <h3 className="text-apple-caption-strong text-apple-ink mb-1">SignAction</h3>
            <div className="text-apple-dense-link flex flex-col">
              <Link href="/about" className="hover:underline focus-ring rounded-xs">About Us</Link>
              <Link href="/translator" className="hover:underline focus-ring rounded-xs">Translator</Link>
              <Link href="/realtime" className="hover:underline focus-ring rounded-xs">Real-time Translation</Link>
              <Link href="/dictionary" className="hover:underline focus-ring rounded-xs">Dictionary</Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-apple-caption-strong text-apple-ink mb-1">Resources</h3>
            <div className="text-apple-dense-link flex flex-col">
              <Link href="/api-status" className="hover:underline focus-ring rounded-xs">API Status</Link>
              <a href="https://github.com/vishwaksen21/signaction" target="_blank" rel="noopener noreferrer" className="hover:underline focus-ring rounded-xs">GitHub Repository</a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-apple-caption-strong text-apple-ink mb-1">Download</h3>
            <div className="text-apple-dense-link flex flex-col">
              <a href="/signaction.apk" download="signaction.apk" className="inline-flex items-center gap-1.5 hover:underline focus-ring rounded-xs">
                <Smartphone size={14} />
                Android APK
              </a>
            </div>
          </div>
        </div>
        
        {/* Legal Row */}
        <div className="border-t border-apple-hairline pt-4 flex flex-col items-center justify-between gap-4 md:flex-row text-apple-fine-print text-apple-ink-muted-48">
          <p>Copyright © {currentYear} SignAction. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline focus-ring rounded-xs">Privacy Policy</Link>
            <span className="text-apple-hairline">|</span>
            <Link href="#" className="hover:underline focus-ring rounded-xs">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

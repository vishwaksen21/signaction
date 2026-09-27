'use client';

import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 pt-16 sm:pt-20 pb-12">
      {/* Giant Background Watermark Text - Matching Avelyn Reference */}
      <div className="absolute inset-x-0 bottom-16 sm:bottom-10 flex justify-center items-center pointer-events-none select-none overflow-hidden z-0 opacity-40 dark:opacity-20">
        <span className="text-[13vw] font-black tracking-widest text-slate-100 dark:text-slate-800/80 uppercase leading-none text-center">
          SIGNACTION
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Left Hero Branding + Right Multi-Column Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 sm:mb-20">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Status Pill Badge with green dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SYSTEM OPERATIONAL - V2.1
            </div>

            {/* Bold Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-6">
              <span className="text-slate-950 dark:text-white block">Sign freely.</span>
              <span className="text-slate-400 dark:text-slate-500 block">Never compromise</span>
              <span className="text-slate-400 dark:text-slate-500 block">privacy.</span>
            </h2>

            {/* CTA Button matching reference */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/translator"
                className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-full px-6 py-3 text-sm font-semibold shadow-md transition-all group"
              >
                <span>Early Beta Access</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="/download-apk"
                className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-full px-5 py-3 text-sm font-medium transition-all"
              >
                <span>Android APK</span>
              </a>
            </div>
          </div>

          {/* Right Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            
            {/* Column 1: DOCUMENTATION */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-white">
                Documentation
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <Link href="/about" className="hover:text-slate-950 dark:hover:text-white transition-colors">Docs Overview</Link>
                <Link href="/offline-setup" className="hover:text-slate-950 dark:hover:text-white transition-colors">Getting Started</Link>
                <Link href="/offline-setup" className="hover:text-slate-950 dark:hover:text-white transition-colors">Vosk Model Setup</Link>
                <Link href="/api-status" className="hover:text-slate-950 dark:hover:text-white transition-colors">API Architecture</Link>
                <Link href="/about#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">Troubleshooting</Link>
              </div>
            </div>

            {/* Column 2: FEATURES & TOOLS */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-white">
                Features & Tools
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <Link href="/translator" className="hover:text-slate-950 dark:hover:text-white transition-colors">Speech to Sign</Link>
                <Link href="/translator" className="hover:text-slate-950 dark:hover:text-white transition-colors">Text to Sign</Link>
                <Link href="/realtime" className="hover:text-slate-950 dark:hover:text-white transition-colors">Real-Time Mode</Link>
                <Link href="/offline-setup" className="hover:text-slate-950 dark:hover:text-white transition-colors">Offline AI Engine</Link>
                <Link href="/dictionary" className="hover:text-slate-950 dark:hover:text-white transition-colors">ISL Dictionary</Link>
              </div>
            </div>

            {/* Column 3: COMPARISONS */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-white">
                Comparisons
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <Link href="/about#comparison" className="hover:text-slate-950 dark:hover:text-white transition-colors">vs. Cloud Translators</Link>
                <Link href="/about#comparison" className="hover:text-slate-950 dark:hover:text-white transition-colors">vs. Online STT</Link>
                <Link href="/dictionary" className="hover:text-slate-950 dark:hover:text-white transition-colors">vs. Static Images</Link>
                <Link href="/about#offline" className="hover:text-slate-950 dark:hover:text-white transition-colors">Zero-Telemetry Privacy</Link>
                <Link href="/about#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">Central FAQ</Link>
              </div>
            </div>

            {/* Column 4: TRUST & GOVERNANCE */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-white">
                Trust & Governance
              </h3>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <Link href="/about" className="hover:text-slate-950 dark:hover:text-white transition-colors">About SignAction</Link>
                <Link href="/about#privacy" className="hover:text-slate-950 dark:hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/about#security" className="hover:text-slate-950 dark:hover:text-white transition-colors">Security & Keys</Link>
                <Link href="/about#roadmap" className="hover:text-slate-950 dark:hover:text-white transition-colors">Product Roadmap</Link>
                <a href="https://github.com/vishwaksen21/signaction" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors">GitHub Repository</a>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Privacy Shield + Copyright + Links & Github */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% LOCAL SANDBOX & ZERO TELEMETRY
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span>© {currentYear} SignAction. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/about" className="hover:text-slate-950 dark:hover:text-white transition-colors">Docs</Link>
            <Link href="/about#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">FAQ</Link>
            <a
              href="https://github.com/vishwaksen21/signaction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

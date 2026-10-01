'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Github, Smartphone, Download } from 'lucide-react';
import { OFFICIAL_APK_DOWNLOAD_URL } from '@/lib/platform';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#FAF9F6] dark:bg-[#040913] border-t border-slate-200/80 dark:border-slate-800 pt-16 sm:pt-20 pb-24 md:pb-14 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Grid: Balanced, Spacious 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-14 sm:pb-16">
          
          {/* Brand & Action Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <Link href="/" className="inline-flex items-center gap-3 focus-ring rounded-xl">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="SignAction Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain select-none drop-shadow-sm"
                  priority
                />
              </div>
              <span className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
                Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
              </span>
            </Link>

            <div className="space-y-2 max-w-lg">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#062B5C] dark:text-white tracking-tight">
                Communicate better. A more inclusive world.
              </h3>
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 leading-relaxed font-normal">
                An open, privacy-focused Indian Sign Language engine translating speech and text into natural ISL gestures. 100% on-device and free forever.
              </p>
            </div>

            {/* Clear Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/translator"
                className="inline-flex items-center gap-2 bg-[#0757E8] hover:bg-[#064BD1] text-white font-semibold text-sm px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(7,87,232,0.25)] hover:shadow-[0_6px_20px_rgba(7,87,232,0.35)] transition-all duration-200 active:scale-95 focus-ring"
              >
                <span>Start Translating</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={OFFICIAL_APK_DOWNLOAD_URL}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-[#062B5C] dark:text-white font-semibold text-sm px-6 py-3 rounded-full shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 focus-ring"
              >
                <Smartphone className="w-4 h-4 text-[#0757E8] dark:text-[#12CFF3]" />
                <span>Download Android APK</span>
              </a>
            </div>
          </div>

          {/* Navigation Links (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 text-left">
            
            {/* Column 1: Translation Tools */}
            <div className="space-y-4">
              <div className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#062B5C] dark:text-white">
                Translation
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/translator"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    Text & Voice Translator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/realtime"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    Live Speech Mode
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dictionary"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    347 Gesture Dictionary
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offline-setup"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    Offline Engine Setup
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Platform & Project */}
            <div className="space-y-4">
              <div className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#062B5C] dark:text-white">
                Platform
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    About SignAction
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#faq"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <a
                    href={OFFICIAL_APK_DOWNLOAD_URL}
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Android APK (145 MB)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/vishwaksen21/signaction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#64748B] dark:text-slate-400 hover:text-[#0757E8] dark:hover:text-[#12CFF3] transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Clean, Uncongested Bottom Bar */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] dark:text-slate-400">
          
          {/* Privacy & Copyright */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#062B5C] dark:text-slate-200">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              100% On-Device Privacy
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span>Zero Cloud Telemetry</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span>© {currentYear} SignAction. All rights reserved.</span>
          </div>

          {/* GitHub Only (YouTube & LinkedIn Removed) */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/vishwaksen21/signaction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#062B5C] dark:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="font-semibold text-xs">Open Source</span>
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}

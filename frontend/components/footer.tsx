'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Github, Youtube, Linkedin, Smartphone, Download } from 'lucide-react';
import { OFFICIAL_APK_DOWNLOAD_URL } from '@/lib/platform';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#FAF9F6] dark:bg-[#040913] border-t border-slate-200/80 dark:border-slate-800 pt-16 sm:pt-20 pb-28 md:pb-12 transition-colors duration-300">
      {/* Background Subtle Gradient Wave */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -bottom-24 -right-24 w-[700px] h-[400px] bg-gradient-to-tl from-blue-100/40 via-sky-100/25 to-transparent dark:from-blue-950/30 dark:via-sky-950/15 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 w-[500px] h-[300px] bg-[#EAF9FF]/40 dark:bg-blue-950/20 rounded-full blur-2xl" />

        {/* Sweeping Soft Blue Wave */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35 dark:opacity-15 pointer-events-none"
          viewBox="0 0 1440 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 380 C350 460, 720 220, 1500 280 L1500 500 L-50 500 Z"
            fill="url(#footer-wave-grad)"
          />
          <defs>
            <linearGradient id="footer-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0757E8" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#12CFF3" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#7DEBFA" stopOpacity="0.03" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Giant Background Watermark Text - Distinct, prominent & clearly readable */}
      <div className="absolute inset-x-0 bottom-24 sm:bottom-16 flex justify-center lg:justify-end items-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none select-none overflow-hidden z-0">
        <span className="text-[14vw] sm:text-[12vw] lg:text-[10vw] font-black tracking-widest text-[#0757E8]/15 dark:text-blue-400/15 uppercase leading-none select-none pr-0 lg:pr-4">
          SIGNACTION
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Section: Clean Editorial Layout */}
        <div className="flex flex-col items-start max-w-2xl mb-14 sm:mb-20">
          {/* Logo */}
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="SignAction Logo"
              width={88}
              height={88}
              className="object-contain drop-shadow-md select-none"
              priority
            />
          </div>

          {/* Brand Wordmark */}
          <div className="mb-3">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
              Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
            </span>
          </div>

          {/* Headline */}
          <div className="mb-7 space-y-1">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
              Communicate better.
            </h3>
            <p className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#64748B] dark:text-slate-400">
              A more <span className="text-[#0757E8] dark:text-[#12CFF3]">inclusive world.</span>
            </p>
          </div>

          {/* Action Buttons: Get Started + Download Android APK */}
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/translator"
              className="inline-flex items-center gap-2 bg-[#0757E8] hover:bg-[#064BD1] text-white font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-[0_4px_16px_rgba(7,87,232,0.28)] hover:shadow-[0_6px_22px_rgba(7,87,232,0.38)] transition-all duration-200 group active:scale-95 focus-ring"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href={OFFICIAL_APK_DOWNLOAD_URL}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-700 text-[#062B5C] dark:text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 focus-ring"
            >
              <Smartphone className="w-4 h-4 text-[#0757E8] dark:text-[#12CFF3]" />
              <span>Download Android APK</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar: Privacy Shield + Copyright + Links & Social Icons */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B] dark:text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-[#0757E8] dark:text-[#12CFF3] stroke-[2.2]" />
            <span>100% OFFLINE • YOUR DATA STAYS ON YOUR DEVICE</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span>© {currentYear} SignAction. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 text-xs font-medium text-[#64748B] dark:text-slate-400">
            <a
              href={OFFICIAL_APK_DOWNLOAD_URL}
              className="font-semibold text-[#0757E8] dark:text-[#12CFF3] hover:underline transition-colors flex items-center gap-1"
            >
              <Smartphone size={13} />
              <span>Android APK</span>
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link href="/about" className="hover:text-[#062B5C] dark:hover:text-white transition-colors">Docs</Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link href="/about#faq" className="hover:text-[#062B5C] dark:hover:text-white transition-colors">FAQ</Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <a
              href="https://github.com/vishwaksen21/signaction"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#062B5C] dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <div className="flex items-center gap-2 ml-2">
              <a
                href="https://github.com/vishwaksen21/signaction"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center transition-colors shadow-2xs"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center transition-colors shadow-2xs"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center transition-colors shadow-2xs"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

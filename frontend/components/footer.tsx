'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Github, Youtube, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 pt-16 sm:pt-20 pb-12">
      {/* Background Subtle Gradient Wave & Glow */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -bottom-24 -right-24 w-[750px] h-[450px] bg-gradient-to-tl from-sky-200/40 via-blue-100/25 to-transparent dark:from-blue-950/30 dark:via-sky-950/15 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 w-[600px] h-[350px] bg-sky-100/35 dark:bg-blue-950/20 rounded-full blur-2xl" />

        {/* Sweeping Soft Blue Wave matching reference */}
        <svg
          className="absolute inset-0 w-full h-full opacity-45 dark:opacity-20"
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 480 C350 560, 720 280, 1500 360 L1500 600 L-50 600 Z"
            fill="url(#footer-wave-grad)"
          />
          <path
            d="M-50 530 C450 580, 800 380, 1500 450 L1500 600 L-50 600 Z"
            fill="url(#footer-wave-grad-2)"
          />
          <defs>
            <linearGradient id="footer-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="footer-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Giant Background Watermark Text - Exact Match to Reference */}
      <div className="absolute inset-x-0 bottom-24 sm:bottom-18 flex justify-center items-center pointer-events-none select-none overflow-hidden z-0">
        <span className="text-[12vw] font-black tracking-widest text-sky-100/60 dark:text-slate-800/40 uppercase leading-none text-center">
          SIGNACTION
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Left Brand Block + Right 4 Categorized Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 sm:mb-20">
          
          {/* Left Column: Status Badge, 3D Logo, Wordmark, Headline, CTA Button */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 shadow-2xs mb-6 text-[11px] font-semibold text-sky-700 dark:text-sky-300 tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              SYSTEM OPERATIONAL • v1.0
            </div>

            {/* 3D Wave Logo Icon */}
            <div className="mb-2">
              <Image
                src="/logo.png"
                alt="SignAction Logo"
                width={80}
                height={80}
                className="object-contain drop-shadow-sm select-none"
                priority
              />
            </div>

            {/* Brand Wordmark */}
            <div className="mb-4">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Sign<span className="text-blue-600 dark:text-blue-500">Action</span>
              </span>
            </div>

            {/* Headline matching reference */}
            <div className="mb-6 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Communicate better.
              </h3>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-400 dark:text-slate-500">
                A more <span className="text-sky-500 dark:text-sky-400">inclusive world.</span>
              </p>
            </div>

            {/* Vibrant Blue Gradient Pill CTA Button */}
            <Link
              href="/translator"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_4px_16px_rgba(2,132,199,0.35)] hover:shadow-[0_6px_22px_rgba(2,132,199,0.45)] transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right 4 Columns: PRODUCT | DEVELOPERS | RESOURCES | ABOUT */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            
            {/* Column 1: PRODUCT */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Product
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/translator" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link>
                <Link href="/about#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</Link>
                <Link href="/about#use-cases" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Use Cases</Link>
                <Link href="/translator" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Screenshots</Link>
                <Link href="/about#roadmap" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Roadmap</Link>
              </div>
            </div>

            {/* Column 2: DEVELOPERS */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Developers
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</Link>
                <Link href="/api-status" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Reference</Link>
                <Link href="/offline-setup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Offline Setup</Link>
                <Link href="/offline-setup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Download Assets</Link>
                <a href="https://github.com/vishwaksen21/signaction" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contribute</a>
              </div>
            </div>

            {/* Column 3: RESOURCES */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Resources
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">User Guide</Link>
                <Link href="/about#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQs</Link>
                <Link href="/api-status" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Troubleshooting</Link>
                <Link href="/dictionary" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dataset Guide</Link>
                <Link href="/about#privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy & Security</Link>
              </div>
            </div>

            {/* Column 4: ABOUT */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                About
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About SignAction</Link>
                <Link href="/about#mission" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Our Mission</Link>
                <Link href="/about#accessibility" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Accessibility</Link>
                <Link href="/about#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
                <Link href="/about#terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Privacy Shield + Copyright + Links & Social Icons */}
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-blue-500 stroke-[2.2]" />
            <span>100% OFFLINE • YOUR DATA STAYS ON YOUR DEVICE</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span>© {currentYear} SignAction. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</Link>
            <Link href="/about#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/vishwaksen21/signaction"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs"
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

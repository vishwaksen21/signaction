'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Github, Youtube, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-[#020b24] border-t border-[rgba(7,87,232,0.12)] dark:border-blue-900/40 pt-16 sm:pt-20 pb-12">
      {/* Background Subtle Gradient Wave & Glow */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -bottom-24 -right-24 w-[750px] h-[450px] bg-gradient-to-tl from-[#12CFF3]/15 via-[#0757E8]/10 to-transparent dark:from-blue-950/40 dark:via-sky-950/20 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 w-[600px] h-[350px] bg-[#EAF9FF]/50 dark:bg-blue-950/20 rounded-full blur-2xl" />

        {/* Sweeping Soft Blue Wave matching reference */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 dark:opacity-20"
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
              <stop offset="0%" stopColor="#12CFF3" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#0757E8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#7DEBFA" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="footer-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0757E8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#12CFF3" stopOpacity="0.03" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Giant Background Watermark Text - Subtle & elegant */}
      <div className="absolute inset-x-0 bottom-20 sm:bottom-16 flex justify-center items-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none select-none overflow-hidden z-0">
        <span className="text-[14vw] sm:text-[12vw] lg:text-[10vw] font-black tracking-widest text-[#0757E8]/10 dark:text-blue-500/10 uppercase leading-none select-none">
          SIGNACTION
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Left Brand Block + Right 4 Categorized Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 sm:mb-20">
          
          {/* Left Column: 3D Logo, Wordmark, Headline, CTA Button */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* 3D Wave Logo Icon */}
            <div className="mb-3">
              <Image
                src="/logo.png"
                alt="SignAction Logo"
                width={84}
                height={84}
                className="object-contain drop-shadow-md select-none"
                priority
              />
            </div>

            {/* Brand Wordmark */}
            <div className="mb-4">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
                Sign<span className="bg-gradient-to-r from-[#0757E8] to-[#12CFF3] bg-clip-text text-transparent">Action</span>
              </span>
            </div>

            {/* Headline matching reference */}
            <div className="mb-6 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
                Communicate better.
              </h3>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#60759A] dark:text-slate-400">
                A more <span className="text-[#12CFF3] dark:text-[#7DEBFA]">inclusive world.</span>
              </p>
            </div>

            {/* Vibrant Blue/Cyan Gradient Pill CTA Button */}
            <Link
              href="/translator"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0757E8] via-[#087FF5] to-[#12CFF3] hover:from-[#064ad1] hover:to-[#0ebde0] text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-full shadow-[0_4px_20px_rgba(7,87,232,0.35)] hover:shadow-[0_6px_25px_rgba(7,87,232,0.45)] transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right 4 Columns: PRODUCT | DEVELOPERS | RESOURCES | ABOUT */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            
            {/* Column 1: PRODUCT */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#062B5C] dark:text-white">
                Product
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-[#60759A] dark:text-slate-400">
                <Link href="/translator" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Features</Link>
                <Link href="/about#how-it-works" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">How It Works</Link>
                <Link href="/translator" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Translate</Link>
                <Link href="/realtime" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Live</Link>
                <Link href="/dictionary" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Dictionary</Link>
              </div>
            </div>

            {/* Column 2: DEVELOPERS */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#062B5C] dark:text-white">
                Developers
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-[#60759A] dark:text-slate-400">
                <Link href="/about" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Documentation</Link>
                <Link href="/api-status" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">API</Link>
                <Link href="/offline-setup" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Offline Setup</Link>
                <a href="https://github.com/vishwaksen21/signaction" target="_blank" rel="noopener noreferrer" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">GitHub</a>
                <a href="https://github.com/vishwaksen21/signaction" target="_blank" rel="noopener noreferrer" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Contribute</a>
              </div>
            </div>

            {/* Column 3: RESOURCES */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#062B5C] dark:text-white">
                Resources
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-[#60759A] dark:text-slate-400">
                <Link href="/about" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">User Guide</Link>
                <Link href="/about#faq" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">FAQs</Link>
                <Link href="/api-status" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Troubleshooting</Link>
                <Link href="/about#accessibility" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Accessibility</Link>
                <Link href="/about#privacy" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Privacy</Link>
              </div>
            </div>

            {/* Column 4: ABOUT */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#062B5C] dark:text-white">
                About
              </h4>
              <div className="flex flex-col gap-2.5 text-sm text-[#60759A] dark:text-slate-400">
                <Link href="/about" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">About SignAction</Link>
                <Link href="/about#mission" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Our Mission</Link>
                <Link href="/about#contact" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Contact</Link>
                <Link href="/about#terms" className="hover:text-[#0757E8] dark:hover:text-[#7DEBFA] transition-colors">Terms of Service</Link>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Privacy Shield + Copyright + Links & Social Icons */}
        <div className="border-t border-[rgba(7,87,232,0.12)] dark:border-blue-900/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#60759A] dark:text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-[#0757E8] dark:text-[#12CFF3] stroke-[2.2]" />
            <span>100% OFFLINE • YOUR DATA STAYS ON YOUR DEVICE</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span>© 2026 SignAction. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#60759A] dark:text-slate-400">
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
                className="w-8 h-8 rounded-full bg-[#EAF9FF] dark:bg-blue-950/60 hover:bg-[#7DEBFA]/20 text-[#0757E8] dark:text-[#7DEBFA] flex items-center justify-center transition-colors shadow-2xs"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-8 h-8 rounded-full bg-[#EAF9FF] dark:bg-blue-950/60 hover:bg-[#7DEBFA]/20 text-[#0757E8] dark:text-[#7DEBFA] flex items-center justify-center transition-colors shadow-2xs"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#EAF9FF] dark:bg-blue-950/60 hover:bg-[#7DEBFA]/20 text-[#0757E8] dark:text-[#7DEBFA] flex items-center justify-center transition-colors shadow-2xs"
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

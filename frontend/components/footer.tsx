'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Github, Youtube, Linkedin, Smartphone, FileText } from 'lucide-react';
import { OFFICIAL_APK_DOWNLOAD_URL } from '@/lib/platform';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#FAF9F6] dark:bg-[#040913] border-t border-slate-200 dark:border-slate-800 pt-16 sm:pt-20 pb-28 md:pb-12 transition-colors duration-300">
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Section: Clean Editorial Layout */}
        <div className="flex flex-col items-start max-w-2xl mb-12 sm:mb-16">
          {/* Logo */}
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="SignAction Logo"
              width={76}
              height={76}
              className="object-contain select-none"
              priority
            />
          </div>

          {/* Brand Wordmark */}
          <div className="mb-3">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
              Sign<span className="text-[#0757E8] dark:text-[#38BDF8]">Action</span>
            </span>
          </div>

          {/* Headline */}
          <div className="mb-7 space-y-1">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
              Communicate better.
            </h3>
            <p className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#64748B] dark:text-slate-400">
              A more <span className="text-[#0757E8] dark:text-[#38BDF8]">inclusive world.</span>
            </p>
          </div>

          {/* Action Buttons: Get Started + Download Android APK */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/translator"
              className="inline-flex items-center gap-2 bg-[#0757E8] hover:bg-[#064BD1] text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-xl shadow-xs transition-colors duration-150 active:scale-[0.99] focus-ring"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={OFFICIAL_APK_DOWNLOAD_URL}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-xl shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 active:scale-[0.99] focus-ring"
            >
              <Smartphone className="w-4 h-4 text-[#0757E8] dark:text-[#38BDF8]" />
              <span>Download Android APK</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar: Privacy Shield + Copyright + Links & Social Icons */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B] dark:text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-[#0757E8] dark:text-[#38BDF8] shrink-0" />
            <span>100% Offline · On-device processing</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            <span>© {currentYear} SignAction. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-[#64748B] dark:text-slate-400">
            <Link href="/terms" className="hover:text-[#062B5C] dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <Link href="/privacy" className="hover:text-[#062B5C] dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <Link href="/about" className="hover:text-[#062B5C] dark:hover:text-white transition-colors">
              About
            </Link>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <a
              href="https://github.com/vishwaksen21/signaction"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#062B5C] dark:hover:text-white transition-colors"
            >
              GitHub
            </a>

            <div className="flex items-center gap-1.5 ml-2">
              <a
                href="https://github.com/vishwaksen21/signaction"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Channel"
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}


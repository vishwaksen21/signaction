'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/translator', label: 'Translate' },
  { href: '/realtime', label: 'Live' },
  { href: '/dictionary', label: 'Dictionary' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-3 sm:px-6 pointer-events-none mb-3 sm:mb-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Floating Header Container */}
        <nav
          className={`pointer-events-auto w-full rounded-full transition-all duration-300 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 ${
            scrolled
              ? 'bg-white/95 dark:bg-[#03133b]/95 backdrop-blur-md border border-[rgba(7,87,232,0.18)] dark:border-blue-900/60 shadow-[0_10px_35px_rgba(7,87,232,0.12)]'
              : 'bg-white/90 dark:bg-[#041644]/90 backdrop-blur-md border border-[rgba(7,87,232,0.12)] dark:border-blue-900/40 shadow-[0_4px_24px_rgba(7,87,232,0.06)]'
          }`}
        >
          {/* Left: SignAction Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3 pl-1 group">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#0757E8] via-[#087FF5] to-[#12CFF3] p-0.5 shadow-sm transition-transform group-hover:scale-105 flex items-center justify-center shrink-0">
              <Image
                src="/signaction-.png"
                alt="SignAction Logo"
                width={38}
                height={38}
                className="w-full h-full rounded-[14px] object-contain bg-white dark:bg-[#020b24] p-0.5"
                priority
              />
            </div>
            <div className="flex items-center tracking-tight">
              <span className="font-extrabold text-lg sm:text-xl text-[#062B5C] dark:text-white">
                Sign<span className="bg-gradient-to-r from-[#0757E8] to-[#12CFF3] bg-clip-text text-transparent">Action</span>
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-all px-3.5 py-1.5 rounded-full ${
                    isActive
                      ? 'text-[#0757E8] dark:text-[#7DEBFA] font-semibold bg-[#EAF9FF] dark:bg-blue-950/60'
                      : 'text-[#60759A] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-3.5 right-3.5 h-[2px] rounded-full bg-gradient-to-r from-[#0757E8] to-[#12CFF3]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: CTA & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Primary CTA: Start Translating */}
            <Link
              href="/translator"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#0757E8] via-[#087FF5] to-[#12CFF3] hover:from-[#064ad1] hover:to-[#0ebde0] rounded-full px-4 sm:px-5 py-2 shadow-[0_4px_16px_rgba(7,87,232,0.25)] hover:shadow-[0_6px_20px_rgba(7,87,232,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Translating</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 text-[#60759A] hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-[#EAF9FF] dark:hover:bg-slate-800/60 transition-colors focus-ring"
              aria-label="Toggle theme"
            >
              <Sun className="w-5 h-5 hidden dark:block text-amber-400" />
              <Moon className="w-5 h-5 block dark:hidden text-[#0757E8]" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-[#60759A] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu Card */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto md:hidden w-full mt-2 rounded-[24px] bg-white/95 dark:bg-[#03133b]/95 backdrop-blur-xl border border-[rgba(7,87,232,0.18)] dark:border-blue-900/60 shadow-xl overflow-hidden p-3"
            >
              <div className="flex flex-col gap-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#EAF9FF] dark:bg-blue-950/60 text-[#0757E8] dark:text-[#7DEBFA] font-semibold'
                          : 'text-[#60759A] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/translator"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0757E8] to-[#12CFF3] text-white rounded-xl py-3 text-sm font-semibold shadow-md"
                >
                  <span>Start Translating</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

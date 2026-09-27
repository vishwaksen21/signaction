'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, Menu, X, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const links = [
  { href: '/translator', label: 'Translator' },
  { href: '/realtime', label: 'Real-time' },
  { href: '/dictionary', label: 'Dictionary' },
  { href: '/offline-setup', label: 'Offline' },
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
        {/* Floating Pill Container */}
        <nav
          className={`pointer-events-auto w-full rounded-full transition-all duration-300 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 ${
            scrolled
              ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.45)]'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-2px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 pl-1 group">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 shadow-xs transition-transform group-hover:scale-105 flex items-center justify-center">
              <Image
                src="/signaction-.png"
                alt="SignAction Logo"
                width={28}
                height={28}
                className="rounded-[9px] object-contain bg-white dark:bg-slate-950"
                priority
              />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-950 dark:text-white">
              SignAction
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-all px-3.5 py-1.5 rounded-full ${
                    isActive
                      ? 'text-slate-950 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Docs link with purple book icon */}
            <Link
              href="/about"
              className="hidden lg:inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-2.5 py-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/30"
            >
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>

            {/* Signature Black Pill CTA Button */}
            <Link
              href="/translator"
              className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300 dark:text-purple-600" />
              <span>Beta Access</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="pointer-events-auto md:hidden w-full mt-2 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl overflow-hidden p-3"
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
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Documentation</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

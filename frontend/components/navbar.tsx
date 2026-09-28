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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#050B14]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)]'
          : 'bg-white/80 dark:bg-[#050B14]/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="SignAction Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain select-none transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
          <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-[#062B5C] dark:text-white">
            Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
          </span>
        </Link>

        {/* Center: Slim & Refined Editorial Nav Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors py-1 ${
                  isActive
                    ? 'text-[#0757E8] dark:text-[#12CFF3] font-semibold'
                    : 'text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-line"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#0757E8] dark:bg-[#12CFF3]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Clear Primary CTA & Clean Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Primary CTA Button */}
          <Link
            href="/translator"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-[0_4px_14px_rgba(7,87,232,0.24)] hover:shadow-[0_6px_20px_rgba(7,87,232,0.34)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            <span>Start Translating</span>
            <ArrowRight size={15} />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 text-[#64748B] hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            <Sun size={18} className="hidden dark:block text-amber-400" />
            <Moon size={18} className="block dark:hidden text-[#0757E8]" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#050B14]/98 backdrop-blur-xl px-5 py-4 space-y-2 shadow-lg"
          >
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0757E8] dark:text-[#12CFF3] font-semibold'
                      : 'text-[#4A5568] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

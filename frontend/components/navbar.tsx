'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const { toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full pt-[env(safe-area-inset-top,0px)] transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#050B14]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)]'
          : 'bg-white/85 dark:bg-[#050B14]/85 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Left: Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group focus-ring rounded-2xl min-w-0">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="SignAction Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain select-none drop-shadow-sm"
              priority
            />
          </div>
          <span className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-[#062B5C] dark:text-white truncate">
            Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
          </span>
        </Link>

        {/* Center: Clean Editorial Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10" aria-label="Main Navigation">
          {links.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative text-sm font-semibold transition-colors py-1.5 ${
                  isActive
                    ? 'text-[#0757E8] dark:text-[#12CFF3]'
                    : 'text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-line"
                    className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full bg-[#0757E8] dark:bg-[#12CFF3]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Offline Setup Shortcut & Dark/Light Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/offline-setup"
            aria-label="Offline engine setup"
            title="Offline Setup"
            className={`w-11 h-11 sm:w-auto sm:px-3.5 sm:h-10 flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors focus-ring ${
              pathname === '/offline-setup'
                ? 'bg-[#0757E8] text-white'
                : 'bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-[#062B5C] dark:text-slate-200'
            }`}
          >
            <WifiOff size={16} className={pathname === '/offline-setup' ? 'text-white' : 'text-[#0757E8] dark:text-[#12CFF3]'} />
            <span className="hidden sm:inline">Offline</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-11 h-11 flex items-center justify-center text-[#64748B] hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white rounded-full bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-700 transition-colors focus-ring"
            aria-label="Toggle dark/light mode"
          >
            <Sun size={19} className="hidden dark:block text-amber-400" />
            <Moon size={19} className="block dark:hidden text-[#0757E8]" />
          </button>
        </div>

      </div>
    </header>
  );
}

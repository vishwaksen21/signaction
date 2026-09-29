'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun } from 'lucide-react';
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
    window.addEventListener('scroll', handleScroll);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
        
        {/* Left: Brand Logo & Wordmark (Enlarged) */}
        <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group focus-ring rounded-2xl">
          <div className="relative w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="SignAction Logo"
              width={52}
              height={52}
              className="w-full h-full object-contain select-none drop-shadow-sm"
              priority
            />
          </div>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[#062B5C] dark:text-white">
            Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
          </span>
        </Link>

        {/* Center: Clean Editorial Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10" aria-label="Main Navigation">
          {links.map((link) => {
            const isActive = pathname === link.href;
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

        {/* Right: Only the Dark/Light Mode Toggle */}
        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className="w-11 h-11 flex items-center justify-center text-[#64748B] hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white rounded-full bg-slate-100/70 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-700 transition-colors focus-ring"
            aria-label="Toggle dark/light mode"
          >
            <Sun size={20} className="hidden dark:block text-amber-400" />
            <Moon size={20} className="block dark:hidden text-[#0757E8]" />
          </button>
        </div>

      </div>
    </header>
  );
}

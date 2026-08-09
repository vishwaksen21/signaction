'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, Menu, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/translator', label: 'Translator' },
  { href: '/realtime', label: 'Real-time' },
  { href: '/dictionary', label: 'Dictionary' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-apple-surface-black border-b border-apple-hairline text-apple-ink h-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 rounded-sm p-1.5 transition-opacity hover:opacity-80">
            <Image
              src="/logo1.png"
              alt="SignAction Logo"
              width={28}
              height={28}
              className="rounded-md"
              priority
            />
            <span className="font-semibold text-lg tracking-tight">
              SignAction
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <motion.div
                  key={link.href}
                  className="relative flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-all duration-200 px-4 py-1.5 rounded-full ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-apple-ink-muted-80 hover:text-apple-ink hover:bg-apple-surface-pearl'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* APK Download */}
            <a
              href="/signaction.apk"
              download="signaction.apk"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-500 transition-colors"
            >
              <Smartphone size={14} />
              Get App
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-apple-ink-muted-80 hover:text-apple-ink bg-apple-surface-pearl border border-apple-hairline transition-colors rounded-full p-2"
              aria-label="Toggle theme"
            >
              <Sun size={18} className="dark:hidden" />
              <Moon size={18} className="hidden dark:block" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-apple-ink-muted-80 hover:text-apple-ink bg-apple-surface-pearl border border-apple-hairline transition-colors rounded-full p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-apple-hairline bg-white dark:bg-apple-surface-black overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-apple-ink-muted-80 hover:bg-apple-surface-pearl'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

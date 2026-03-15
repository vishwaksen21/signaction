'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, Github } from 'lucide-react';

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

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800 light:bg-white/80 light:border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo1.png"
              alt="SignAction Logo"
              width={32}
              height={32}
              className="rounded-md"
              priority
            />
            <span className="font-semibold text-lg bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
              SignAction
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-indigo-300 light:text-indigo-700'
                      : 'text-slate-400 hover:text-slate-200 light:text-slate-700 light:hover:text-slate-900'
                  } after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-indigo-400 after:transition-transform after:duration-200 hover:after:scale-x-100 ${
                    isActive ? 'after:scale-x-100' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* GitHub */}
            <a
              href="https://github.com/vishwaksen21/signaction"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors dark:hover:bg-slate-800/50 light:text-slate-700 light:hover:text-slate-900 light:hover:bg-slate-100"
              aria-label="GitHub repository"
            >
              <Github size={20} />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors dark:hover:bg-slate-800/50 light:text-slate-700 light:hover:text-slate-900 light:hover:bg-slate-100"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}
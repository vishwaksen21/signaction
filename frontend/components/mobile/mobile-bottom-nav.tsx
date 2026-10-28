'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Languages, Radio, BookOpen, Sliders } from 'lucide-react';

const mobileNavDestinations = [
  { href: '/', label: 'Home', icon: Home, isCenter: false },
  { href: '/translator', label: 'Translate', icon: Languages, isCenter: false },
  { href: '/realtime', label: 'Live', icon: Radio, isCenter: true },
  { href: '/dictionary', label: 'Dictionary', icon: BookOpen, isCenter: false },
  { href: '/offline-setup', label: 'Settings', icon: Sliders, isCenter: false },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Android Bottom Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#111827]/85 backdrop-blur-2xl backdrop-saturate-150 border-t border-slate-900/[0.06] dark:border-white/[0.08] pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] select-none transition-colors duration-200"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {mobileNavDestinations.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          // Special Centerpiece: Live Speech elevated circular AI button with gradient aura
          if (item.isCenter) {
            return (
              <div key={item.href} className="relative flex flex-col items-center">
                <Link
                  href={item.href}
                  aria-label="Live Voice Studio"
                  aria-current={isActive ? 'page' : undefined}
                  className="relative -top-3.5 flex flex-col items-center group active:scale-95 transition-transform duration-150 touch-manipulation"
                >
                  {/* Subtle breathing gradient halo */}
                  <span
                    className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] blur-xs opacity-70 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'animate-pulse opacity-90' : ''
                    }`}
                  />

                  {/* Elevated circular AI button */}
                  <div className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(124,58,237,0.45)] border-2 border-white dark:border-[#090D16]">
                    <Icon size={22} className={isActive ? 'scale-110 transition-transform' : ''} />
                  </div>

                  <span
                    className={`text-[10px] leading-none tracking-tight font-bold mt-1 transition-colors ${
                      isActive
                        ? 'text-violet-600 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 rounded-2xl transition-[transform,color] duration-150 active:scale-[0.92] touch-manipulation ${
                isActive
                  ? 'text-violet-600 dark:text-cyan-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Luminous top indicator pill for active tab */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-top-indicator"
                  className="absolute top-0 h-[3px] w-6 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#06B6D4] shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.9}
                className={isActive ? 'scale-105 transition-transform' : ''}
                aria-hidden="true"
              />
              <span className="text-[10px] leading-none tracking-tight truncate max-w-full px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

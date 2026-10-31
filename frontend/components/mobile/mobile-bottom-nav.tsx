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
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-1 select-none pointer-events-none"
    >
      <div className="nm-flat rounded-3xl flex items-center justify-around h-16 px-2 max-w-md mx-auto pointer-events-auto">
        {mobileNavDestinations.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          // Special Centerpiece: Live Speech elevated convex circular button with indigo aura ring
          if (item.isCenter) {
            return (
              <div key={item.href} className="relative flex flex-col items-center">
                <Link
                  href={item.href}
                  aria-label="Live Voice Studio"
                  aria-current={isActive ? 'page' : undefined}
                  className="relative -mt-5 flex flex-col items-center group active:scale-95 transition-transform duration-150 touch-manipulation"
                >
                  {/* Elevated convex circular tactile button */}
                  <div className={`w-14 h-14 rounded-full nm-convex flex items-center justify-center text-indigo-600 dark:text-indigo-400 active:nm-inset nm-led-indigo transition-all ${
                    isActive ? 'scale-105' : ''
                  }`}>
                    <Icon size={24} className={isActive ? 'scale-110 text-indigo-500 dark:text-indigo-300' : ''} />
                  </div>

                  <span
                    className={`text-[10px] leading-none tracking-tight font-bold mt-1 transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
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
              className={`relative flex-1 min-w-0 max-w-[70px] flex flex-col items-center justify-center gap-1 min-h-[46px] py-1.5 rounded-2xl transition-all duration-150 active:scale-[0.92] touch-manipulation ${
                isActive
                  ? 'nm-inset text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.5 : 1.9}
                className={isActive ? 'scale-105 text-indigo-600 dark:text-indigo-400' : ''}
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

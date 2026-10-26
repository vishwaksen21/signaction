'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Languages, Radio, BookOpen, Sliders } from 'lucide-react';

const mobileNavDestinations = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/translator', label: 'Translate', icon: Languages },
  { href: '/realtime', label: 'Live', icon: Radio },
  { href: '/dictionary', label: 'Dictionary', icon: BookOpen },
  { href: '/offline-setup', label: 'Settings', icon: Sliders },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Android Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#07132C]/95 backdrop-blur-2xl backdrop-saturate-150 border-t border-slate-200/80 dark:border-white/10 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] shadow-[0_-8px_32px_rgba(6,43,135,0.08)] select-none"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
        {mobileNavDestinations.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 min-w-0 max-w-[76px] flex flex-col items-center justify-center gap-1 min-h-[48px] py-1.5 rounded-2xl transition-[transform,color] duration-140 ease-apple active:scale-[0.92] focus-ring touch-manipulation ${
                isActive
                  ? 'text-[#0757E8] dark:text-[#12CFF3] font-bold'
                  : 'text-[#60759A] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white'
              }`}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <motion.span
                  layoutId="mobile-bottom-nav-active-pill"
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-blue-500/10 dark:bg-cyan-400/15 -z-10"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                />
              )}

              <Icon
                size={21}
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

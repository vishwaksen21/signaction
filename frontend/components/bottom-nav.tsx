'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Languages, Radio, BookOpen, Info } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/translator', label: 'Translate', icon: Languages },
  { href: '/realtime', label: 'Live', icon: Radio },
  { href: '/dictionary', label: 'Dictionary', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl backdrop-saturate-150 border-t border-slate-200/80 dark:border-white/10 pb-[env(safe-area-inset-bottom,0px)] md:hidden shadow-[0_-4px_24px_rgba(10,25,47,0.06)]"
    >
      <div className="flex items-center justify-around h-16 px-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
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
              className={`relative flex-1 min-w-0 max-w-[84px] flex flex-col items-center justify-center gap-1 min-h-[48px] py-1.5 rounded-2xl transition-[transform,color] duration-160 ease-apple active:scale-[0.93] focus-ring select-none touch-manipulation ${
                isActive
                  ? 'text-[#0757E8] dark:text-[#12CFF3] font-semibold'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
              <span className="text-[11px] leading-none tracking-tight truncate max-w-full px-1">
                {item.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#0757E8] dark:bg-[#12CFF3]"
                  transition={{ type: 'spring', duration: 0.32, bounce: 0 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


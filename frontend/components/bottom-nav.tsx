'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border-t border-sign-border/60 safe-area-bottom md:hidden shadow-lg shadow-sign-navy/5">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-sign-bright dark:text-sign-cyan font-bold'
                  : 'text-sign-muted dark:text-slate-400 hover:text-sign-darktext active:scale-95'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[10px] tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gradient-to-r from-sign-blue to-sign-cyan" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


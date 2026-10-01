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
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#07132C]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 safe-area-bottom md:hidden shadow-[0_-4px_20px_rgba(10,25,47,0.06)]"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#0757E8] dark:text-[#12CFF3] font-semibold'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden="true" />
              <span className="text-[11px] tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#0757E8] dark:bg-[#12CFF3]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


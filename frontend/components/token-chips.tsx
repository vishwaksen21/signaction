'use client';

import { motion } from 'framer-motion';

interface TokenChipsProps {
  tokens: string[];
  activeIndex?: number;
}

export function TokenChips({ tokens, activeIndex }: TokenChipsProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-xs text-[#60759A] dark:text-slate-400 italic py-2">
        No tokens generated yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token, idx) => {
        const isActive = activeIndex !== undefined && activeIndex === idx;
        return (
          <div
            key={idx}
            className={`inline-flex items-center justify-center text-xs font-mono font-semibold tracking-wide rounded-lg px-3 py-1.5 border transition-colors duration-150 cursor-default select-none ${
              isActive
                ? 'bg-[#0757E8] text-white border-[#0757E8] shadow-xs'
                : 'bg-white dark:bg-slate-900 text-[#0F172A] dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            <span>{token.toUpperCase()}</span>
          </div>
        );
      })}
    </div>
  );
}

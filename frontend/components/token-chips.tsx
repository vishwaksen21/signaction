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
    <div className="flex flex-wrap gap-2.5">
      {tokens.map((token, idx) => {
        const isActive = activeIndex !== undefined && activeIndex === idx;
        return (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className={`inline-flex items-center justify-center text-xs sm:text-sm font-semibold tracking-wide rounded-full px-4 py-2 border transition-all duration-200 cursor-default select-none ${
              isActive
                ? 'bg-[#0757E8] text-white border-[#0757E8] shadow-[0_4px_14px_rgba(7,87,232,0.25)] scale-105'
                : 'bg-white dark:bg-slate-900 text-[#062B5C] dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:border-[#0757E8] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs'
            }`}
          >
            <span className="opacity-60 mr-1">[</span>
            <span>{token.toUpperCase()}</span>
            <span className="opacity-60 ml-1">]</span>
          </motion.div>
        );
      })}
    </div>
  );
}

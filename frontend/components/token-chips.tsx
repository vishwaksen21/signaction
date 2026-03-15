'use client';

import { motion } from 'framer-motion';

export function TokenChips({ tokens }: { tokens: string[] }) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic dark:text-slate-500 light:text-slate-600">
        No tokens generated
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {tokens.map((token, idx) => (
        <motion.div
          key={idx}
          variants={chipVariants}
          className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-default light:bg-indigo-100 light:border-indigo-200 light:text-indigo-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {token}
        </motion.div>
      ))}
    </motion.div>
  );
}

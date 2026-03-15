'use client';

import { motion } from 'framer-motion';
import { SignViewer } from './sign-viewer';

export function SignCard({
  token,
  url,
  mediaType,
}: {
  token: string;
  url: string;
  mediaType: 'gif' | 'mp4' | 'img';
}) {
  return (
    <motion.div
      className="group relative rounded-xl border border-slate-700 bg-slate-900/40 backdrop-blur overflow-hidden hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all dark:border-slate-700 light:border-slate-200 light:bg-white/50"
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Token Label */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            {token}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-800/50 text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
            {mediaType.toUpperCase()}
          </span>
        </div>

        {/* Image Container */}
        <motion.div
          className="relative w-full aspect-square rounded-lg border border-slate-700 bg-slate-950/50 overflow-hidden flex items-center justify-center dark:border-slate-700 light:border-slate-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-full h-full">
            <SignViewer url={url} />
          </div>

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
        </motion.div>
      </div>

      {/* Subtle accent glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"
      />
    </motion.div>
  );
}

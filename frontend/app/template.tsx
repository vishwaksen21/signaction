'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ ease: 'easeInOut', duration: 0.3 }}
      className="flex flex-col min-h-screen"
    >
      {children}
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Download, MoreVertical, Plus } from 'lucide-react';
import { InstallBanner } from './install-banner';

export function InstallButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <InstallBanner />

      {/* Floating install button - bottom right */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-500 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        aria-label="Install app"
      >
        <Download size={20} />
        <span className="font-semibold text-sm hidden sm:inline">Install App</span>
      </button>

      {/* Install instructions modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Install SignAction
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Steps */}
              <div className="px-5 py-5 space-y-5">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Tap the menu button
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Tap the <MoreVertical size={14} className="inline" /> three-dot menu in the top-right corner of Chrome
                    </p>
                    {/* Visual hint */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                        ⋮
                      </div>
                      <span>Chrome menu</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Tap &quot;Install app&quot;
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Look for <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong> in the menu
                    </p>
                    {/* Visual hint */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <Download size={12} className="inline mr-1" />
                        Install app
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Confirm installation
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Tap <strong>&quot;Install&quot;</strong> when prompted. The app will appear on your home screen.
                    </p>
                    {/* Visual hint */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                        <Plus size={12} className="inline mr-1" />
                        Add to Home screen
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  Once installed, open SignAction from your home screen for the best offline experience.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

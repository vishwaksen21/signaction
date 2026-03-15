'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Volume2, Lightbulb, Play, Hand } from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-36 left-1/2 h-[440px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-500/12 blur-2xl" />
          <div className="absolute -bottom-40 right-0 h-[340px] w-[340px] rounded-full bg-indigo-500/10 blur-2xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <motion.div
              className="space-y-7"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-600/15 px-4 py-2 text-sm font-medium text-indigo-300"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-base">✨</span>
                Accessible AI-Powered Translation
              </motion.div>

              <div className="space-y-3">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter text-slate-100 dark:text-slate-100 light:text-slate-900">
                  Text & Speech to
                  <span className="block bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
                    Sign Language
                  </span>
                </h1>
                <p className="text-lg text-slate-400 dark:text-slate-400 light:text-slate-600">
                  Translate your words into beautiful sign language gestures.
                </p>
                <p className="max-w-xl text-sm text-slate-500 dark:text-slate-500 light:text-slate-600">
                  Built for accessibility with an end-to-end pipeline: speech recognition, NLP tokenization, and gesture mapping.
                </p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link
                  href="/translator"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-7 py-3.5 text-white font-semibold shadow-md transition hover:bg-indigo-500 hover:shadow-lg"
                >
                  <Play size={18} />
                  Start Translating
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/40 px-7 py-3.5 font-semibold text-slate-100 shadow-sm transition hover:bg-slate-900 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/40 light:border-slate-200 light:bg-white light:text-slate-900 light:hover:bg-slate-50"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>

            {/* Right illustration */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/40 light:border-slate-200 light:bg-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      Live Gesture Preview
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                      Watch signs appear as you translate
                    </p>
                  </div>
                  <motion.div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/15 text-indigo-300"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: 1, duration: 0.9, ease: 'easeInOut' }}
                    aria-hidden
                  >
                    <Hand size={20} />
                  </motion.div>
                </div>

                {/* Mini demo */}
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['TEXT', 'SPEECH', 'SIGN'].map((t, i) => (
                      <motion.span
                        key={t}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 + i * 0.06, duration: 0.25 }}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 light:bg-indigo-100 light:border-indigo-200 light:text-indigo-700"
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Tokenize', pct: 35 },
                      { label: 'Map', pct: 65 },
                      { label: 'Play', pct: 45 },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.28 + i * 0.06, duration: 0.25 }}
                        className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/30 light:border-slate-200 light:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">{s.label}</span>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-600/15 text-indigo-300">
                            <Hand size={14} />
                          </span>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800/70 dark:bg-slate-800/70 light:bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
        <motion.div
          className="space-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Section Title */}
          <motion.div className="text-center space-y-3" variants={itemVariants}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
              Powerful Features
            </h2>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">
              Everything you need to translate text and speech into sign language
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={containerVariants}
          >
            {[
              {
                icon: <Volume2 size={28} />,
                title: 'Speech to Sign',
                description: 'Record or upload audio and instantly get sign language translation with transcript.',
              },
              {
                icon: <Zap size={28} />,
                title: 'Text to Sign',
                description: 'Type any phrase and watch it transform into beautiful animated gestures.',
              },
              {
                icon: <Lightbulb size={28} />,
                title: 'AI-Powered NLP',
                description: 'Advanced language processing ensures accurate and accessible translations.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all dark:border-slate-800 dark:bg-slate-900/40 light:border-slate-200 light:bg-white/50"
              >
                <div className="text-indigo-400 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
        <motion.div
          className="space-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Section Title */}
          <motion.div className="text-center space-y-3" variants={itemVariants}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600">
              Simple pipeline from input to beautiful gesture output
            </p>
          </motion.div>

          {/* Pipeline Steps */}
          <motion.div
            className="grid gap-4 md:grid-cols-4"
            variants={containerVariants}
          >
            {[
              { step: '1', title: 'Input', desc: 'Text or speech' },
              { step: '2', title: 'Process', desc: 'NLP tokenization' },
              { step: '3', title: 'Map', desc: 'Token to assets' },
              { step: '4', title: 'Display', desc: 'Gesture video' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative"
              >
                <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 dark:border-slate-800 light:bg-white light:border-slate-200 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
                    {item.desc}
                  </p>
                </div>
                {idx < 3 && (
                  <motion.div
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-slate-700"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ArrowRight />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
        <motion.div
          className="text-center space-y-8 py-12 px-6 rounded-2xl bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-indigo-600/20 border border-indigo-500/30"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-2xl mx-auto">
            Start translating text and speech to sign language today with our modern, accessible interface.
          </p>
          <Link
            href="/translator"
            className="inline-block px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Open Translator →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

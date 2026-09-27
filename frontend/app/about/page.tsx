'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Server, Code, Mic, Layers, ArrowRight, Video, BookOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sign-soft/40 dark:bg-slate-950 text-sign-darktext dark:text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">

      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sign-verylight dark:bg-sign-navy/40 text-sign-blue dark:text-sign-cyan font-semibold text-xs tracking-wider uppercase mb-6 border border-sign-border/60 shadow-sm">
            <Sparkles size={14} className="text-sign-bright" />
            Our Mission & Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-sign-navy dark:text-white tracking-tight mb-6 leading-tight">
            Breaking down language <span className="sign-text-gradient">barriers</span>
          </h1>
          <p className="text-base sm:text-xl text-sign-muted dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SignAction translates spoken and written English into continuous, verified sign-language gesture sequences — completely offline and privately on your device.
          </p>
        </motion.div>
      </div>

      {/* Mission Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-4xl mx-auto sign-card p-8 md:p-12 mb-16 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 text-sign-blue pointer-events-none transition-transform group-hover:scale-105 duration-500">
          <Heart size={220} />
        </div>
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-sm">
            <Heart size={26} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sign-navy dark:text-white mt-2">Accessibility Impact</h2>
          <p className="text-base sm:text-lg text-sign-muted dark:text-slate-300 max-w-2xl leading-relaxed">
            Our primary goal is to make daily communication more inclusive and accessible. By presenting an immediate visual gesture sequence driven by real-time NLP and edge AI speech recognition, we bridge the gap for the deaf and hard-of-hearing community, transforming spoken conversations into fluid visual representation without compromising data privacy.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sign-verylight dark:bg-sign-navy/30 text-sign-blue dark:text-sign-cyan text-xs font-semibold border border-sign-border/60">
              <ShieldCheck size={14} />
              100% On-Device Privacy
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/40">
              Native Android & Web Support
            </div>
          </div>
        </div>
      </motion.div>

      {/* How it Works Pipeline */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-sign-bright uppercase tracking-wider">End-to-End System</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sign-navy dark:text-white mt-1">How the Pipeline Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <Mic size={22} />,
              title: 'Speech to Text',
              desc: 'Vosk WebAssembly & native models transcribe live voice audio locally.'
            },
            {
              icon: <Code size={22} />,
              title: 'NLP Tokenization',
              desc: 'Grammar and rule-based processing map text into standard gloss tokens.'
            },
            {
              icon: <Layers size={22} />,
              title: 'Asset Mapping',
              desc: 'Tokens resolve to gesture videos, fingerspelling, or skeleton fallbacks.'
            },
            {
              icon: <Video size={22} />,
              title: 'Playback',
              desc: 'The player streams the sequential video chunks with sub-second latency.'
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, delay: i * 0.12 }}
              className="sign-card p-6 relative group hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-sign-verylight dark:bg-sign-navy/40 text-sign-bright flex items-center justify-center mb-5 border border-sign-border/60 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <span className="text-[10px] font-extrabold text-sign-muted/70 uppercase tracking-widest block mb-1">
                Step 0{i + 1}
              </span>
              <h3 className="text-base font-bold text-sign-navy dark:text-white mb-2">{step.title}</h3>
              <p className="text-sign-muted dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>

              {/* Connector Arrow */}
              {i < 3 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-sign-bright/40 z-10">
                  <ArrowRight size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Research Paper CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-4xl mx-auto sign-card p-8 md:p-12 mb-20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sign-blue/10 to-sign-cyan/20 text-sign-blue dark:text-sign-cyan flex items-center justify-center shrink-0 border border-sign-border/60">
            <BookOpen size={28} />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sign-verylight dark:bg-sign-navy/40 text-sign-blue dark:text-sign-cyan text-[11px] font-bold uppercase tracking-wider mb-2 border border-sign-border/60">
              Academic Publication
            </div>
            <h2 className="text-2xl font-bold text-sign-navy dark:text-white mb-2">Research Architecture</h2>
            <p className="text-sign-muted dark:text-slate-300 text-sm sm:text-base mb-3 leading-relaxed">
              SignAction is built upon an IEEE-format research specification covering grammar rules, token sequence resolution, offline speech recognition, and fallback synthesis for unmapped vocabulary.
            </p>
            <p className="text-xs text-sign-muted/80 dark:text-slate-400">
              Focuses on low-latency offline execution on constrained consumer hardware and Android mobile devices.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sign-verylight dark:bg-sign-navy/40 text-sign-bright mb-6 border border-sign-border/60">
          <Server size={28} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-sign-navy dark:text-white mb-3">Modern Engineering Stack</h2>
        <p className="text-sign-muted dark:text-slate-400 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
          Powered by Next.js, TypeScript, Tailwind CSS, Vosk WebAssembly, and a Python FastAPI microservice architecture.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/translator" className="btn-sign-primary px-7 py-3 text-sm">
            Try Translator
            <ArrowRight size={16} />
          </Link>
          <Link href="/offline-setup" className="btn-sign-secondary px-7 py-3 text-sm">
            Offline Setup
          </Link>
        </div>
      </motion.div>

    </div>
  );
}


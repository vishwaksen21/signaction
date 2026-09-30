'use client';

import { motion } from 'framer-motion';
import { Heart, Server, Code, Mic, Layers, ArrowRight, Video, BookOpen, ShieldCheck, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { OFFICIAL_APK_DOWNLOAD_URL } from '@/lib/platform';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0F172A] dark:text-slate-100 py-12 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">

      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-14 md:mb-18">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#38BDF8] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0757E8] dark:bg-[#38BDF8]" />
            <span>Mission & Philosophy</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl text-[#062B5C] dark:text-white tracking-tight mb-5 leading-tight">
            Communication is a <br className="hidden sm:inline" />
            <span className="text-[#0757E8] dark:text-[#38BDF8]">fundamental human right.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SignAction translates spoken and written English into continuous, verified Indian Sign Language gestures: completely on-device, privately, and without cloud dependency.
          </p>
        </motion.div>
      </div>

      {/* Mission Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-4xl mx-auto sign-card p-8 md:p-10 mb-16 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center border border-blue-200 dark:border-blue-900 shadow-xs">
            <Heart size={22} />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white mt-1">
            Accessibility Impact
          </h2>
          <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 max-w-2xl leading-relaxed">
            Our purpose is to make daily conversations inclusive and frictionless. By presenting continuous visual gesture sequences driven by on-device NLP and speech recognition, we bridge the gap between spoken English and Indian Sign Language for students, educators, families, and public spaces, with zero personal data harvesting.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] text-xs font-semibold border border-blue-200 dark:border-blue-900">
              <ShieldCheck size={13} />
              <span>100% On-Device Privacy</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <span>Cross-Platform: Web & Native Android</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* How it Works Pipeline */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[#0757E8] dark:text-[#38BDF8] uppercase tracking-wider">End-to-End System</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white mt-1">
            How the Linguistic Pipeline Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <Mic size={20} />,
              title: 'Speech to Text',
              desc: 'Vosk WebAssembly and native models transcribe live voice audio locally without cloud servers.'
            },
            {
              icon: <Code size={20} />,
              title: 'NLP Tokenization',
              desc: 'Grammar and rule-based processing convert English syntax into standard Indian Sign Language gloss.'
            },
            {
              icon: <Layers size={20} />,
              title: 'Asset Mapping',
              desc: 'Tokens resolve to high-definition gesture videos, verified signs, or fingerspelling fallbacks.'
            },
            {
              icon: <Video size={20} />,
              title: 'Gesture Playback',
              desc: 'The custom playback engine streams consecutive gesture segments with sub-second latency.'
            }
          ].map((step, i) => (
            <div
              key={i}
              className="sign-card p-6 relative transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-900">
                {step.icon}
              </div>
              <span className="text-[11px] font-mono font-bold text-[#0757E8] dark:text-[#38BDF8] uppercase tracking-wider block mb-1">
                Phase 0{i + 1}
              </span>
              <h3 className="font-heading text-base font-bold text-[#062B5C] dark:text-white mb-2">{step.title}</h3>
              <p className="text-[#64748B] dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Research Paper CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-4xl mx-auto sign-card p-8 md:p-12 mb-20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-900/50">
            <BookOpen size={28} />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] text-[11px] font-semibold uppercase tracking-wider mb-3 border border-blue-200/80 dark:border-blue-900/50">
              Research Architecture
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#062B5C] dark:text-white mb-2">
              Linguistic Integrity & Low-Latency Synthesis
            </h2>
            <p className="text-[#64748B] dark:text-slate-300 text-sm sm:text-base mb-3 leading-relaxed">
              SignAction is built upon formal linguistic rules for Indian Sign Language: Subject-Object-Verb (SOV) sentence order, question particle placement, non-manual markers, and fallback fingerspelling for unmapped vocabulary.
            </p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Designed for low-latency execution on standard consumer mobile hardware and offline PWA environments.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 text-[#0757E8] mb-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <Server size={26} />
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white mb-3">
          Modern Engineering Foundation
        </h2>
        <p className="text-[#64748B] dark:text-slate-400 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
          Engineered with Next.js 14 App Router, TypeScript, Tailwind CSS, Vosk WebAssembly, and a Python FastAPI backend.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/translator" className="btn-sign-primary px-7 py-3 text-sm">
            <span>Start Translating</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href={OFFICIAL_APK_DOWNLOAD_URL}
            className="btn-sign-secondary px-7 py-3 text-sm inline-flex items-center gap-2"
          >
            <Smartphone size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
            <span>Download Android APK</span>
          </a>
          <Link href="/offline-setup" className="btn-sign-secondary px-7 py-3 text-sm">
            <span>Offline Setup</span>
          </Link>
        </div>
      </motion.div>

    </div>
  );
}


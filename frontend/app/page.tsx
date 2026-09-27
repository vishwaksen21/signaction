'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Volume2,
  Hand,
  Shield,
  Sparkles,
  WifiOff,
  Code2,
  Play,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
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
    <div className="min-h-screen bg-[#F4FAFF] dark:bg-[#020b24] text-[#062B5C] dark:text-slate-100 overflow-hidden">
      {/* Background Soft Glow & Logo-inspired Curves */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
        <div className="absolute -top-36 left-1/2 h-[550px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#12CFF3]/15 via-[#0757E8]/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-[#7DEBFA]/15 blur-3xl" />
        <div className="absolute bottom-1/4 -left-40 h-[450px] w-[450px] rounded-full bg-[#0757E8]/10 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Messaging & CTAs */}
          <motion.div
            className="lg:col-span-7 space-y-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Accessibility Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-[rgba(7,87,232,0.18)] dark:border-blue-900/60 shadow-sm text-xs font-semibold text-[#0757E8] dark:text-[#7DEBFA]">
              <Sparkles size={14} className="text-[#12CFF3]" />
              <span>Accessibility-First Sign Translation • 100% Offline Ready</span>
            </div>

            {/* Primary Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#062B5C] dark:text-white leading-[1.12]">
                Communication without <span className="sign-text-gradient">barriers.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#60759A] dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Translate English text and speech into sign-language gestures — privately and seamlessly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/translator"
                className="btn-sign-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base px-8 py-3.5"
              >
                <span>Start Translating</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="btn-sign-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base px-8 py-3.5"
              >
                <span>Explore SignAction</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm font-medium text-[#60759A] dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
                <span>Zero Cloud Audio Uploads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
                <span>Real-Time Gesture Stream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
                <span>Rule-Based NLP Glossing</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Prominent Logo Visual & Live Preview Card */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Glass Card Container */}
            <div className="relative rounded-[28px] bg-white/95 dark:bg-[#041644]/90 backdrop-blur-xl border border-[rgba(7,87,232,0.16)] dark:border-blue-900/60 p-7 sm:p-8 shadow-[0_20px_60px_rgba(7,87,232,0.12)]">
              {/* Card Top: Logo Showcase */}
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(7,87,232,0.1)] dark:border-blue-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0757E8] via-[#087FF5] to-[#12CFF3] p-0.5 shadow-md flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="SignAction 3D Logo"
                      width={52}
                      height={52}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#062B5C] dark:text-white leading-tight">
                      Sign<span className="sign-text-gradient">Action</span>
                    </h3>
                    <p className="text-xs text-[#60759A] dark:text-slate-400">
                      Visual Gesture Engine
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF9FF] dark:bg-blue-950/80 border border-[rgba(7,87,232,0.15)] text-[11px] font-semibold text-[#0757E8] dark:text-[#7DEBFA]">
                  <span className="w-2 h-2 rounded-full bg-[#12CFF3] animate-pulse" />
                  Live Preview
                </div>
              </div>

              {/* Transformation Demo: English -> Gloss -> Gesture Tokens */}
              <div className="pt-6 space-y-5">
                {/* Input Simulation */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400 block mb-1.5">
                    English Input
                  </label>
                  <div className="p-3.5 bg-[#F4FAFF] dark:bg-[#020e2e] border border-[rgba(7,87,232,0.1)] dark:border-blue-900/50 rounded-2xl text-sm font-medium text-[#062B5C] dark:text-slate-200">
                    "Hello, how can I help you today?"
                  </div>
                </div>

                {/* Gloss Pipeline */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400 block mb-1.5">
                    Sign Gloss
                  </label>
                  <div className="p-3.5 bg-gradient-to-r from-[#EAF9FF] to-[#F4FAFF] dark:from-[#03184f] dark:to-[#041c5c] border border-[rgba(7,87,232,0.15)] dark:border-blue-900/60 rounded-2xl font-mono text-xs font-semibold text-[#0757E8] dark:text-[#7DEBFA] tracking-wide">
                    HELLO HOW I HELP YOU TODAY
                  </div>
                </div>

                {/* Gesture Tokens */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#60759A] dark:text-slate-400 block mb-2">
                    Visual Tokens
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['HELLO', 'HOW', 'HELP', 'YOU'].map((token, i) => (
                      <span
                        key={token}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          i === 0
                            ? 'bg-gradient-to-r from-[#0757E8] to-[#12CFF3] text-white border-transparent shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-[#062B5C] dark:text-slate-200 border-[rgba(7,87,232,0.15)] dark:border-blue-900/50'
                        }`}
                      >
                        [ {token} ]
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Link into Translator */}
                <Link
                  href="/translator"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#F4FAFF] dark:bg-blue-950/40 hover:bg-[#EAF9FF] dark:hover:bg-blue-900/50 border border-[rgba(7,87,232,0.15)] rounded-2xl py-3 text-xs font-bold text-[#0757E8] dark:text-[#7DEBFA] transition-all group"
                >
                  <Play size={14} className="fill-current" />
                  <span>Try It In Full Translator</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Offline-First Spotlight Banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-[28px] bg-gradient-to-r from-[#0757E8] via-[#087FF5] to-[#12CFF3] p-1 shadow-[0_14px_44px_rgba(7,87,232,0.18)]">
          <div className="rounded-[26px] bg-white dark:bg-[#03133b] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF9FF] dark:bg-blue-950 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center shrink-0">
                <Shield size={24} className="stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#7DEBFA]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  100% Offline Capable
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#062B5C] dark:text-white">
                  Your voice and sign assets stay on your device.
                </h3>
                <p className="text-sm text-[#60759A] dark:text-slate-300 max-w-2xl">
                  Speech recognition and sign language animations run directly on your hardware with offline Vosk speech recognition. No internet required after setup.
                </p>
              </div>
            </div>

            <Link
              href="/offline-setup"
              className="btn-sign-primary shrink-0 text-sm px-6 py-3"
            >
              <WifiOff size={16} className="mr-2" />
              <span>Offline Setup</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF9FF] dark:bg-blue-950 border border-[rgba(7,87,232,0.15)] text-xs font-bold text-[#0757E8] dark:text-[#7DEBFA]">
            Built for Real-World Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#062B5C] dark:text-white">
            Designed for clarity, speed, and privacy.
          </h2>
          <p className="text-base text-[#60759A] dark:text-slate-300 max-w-2xl mx-auto">
            Every component is tuned to communicate spoken and typed words into sign gestures effortlessly.
          </p>
        </div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {[
            {
              icon: <Volume2 size={26} />,
              title: 'Speech to Sign',
              desc: 'Speak naturally into your microphone. On-device Vosk STT converts your voice directly into sign gestures.',
            },
            {
              icon: <Zap size={26} />,
              title: 'Instant Text Translation',
              desc: 'Type words, sentences, or phrases. Instantaneous tokenizer processes grammar and maps local gesture clips.',
            },
            {
              icon: <Layers size={26} />,
              title: 'Rule-Based Sign Gloss',
              desc: 'Intelligent grammatical transformation aligns English sentence structure to natural sign language gloss order.',
            },
            {
              icon: <Hand size={26} />,
              title: 'Fluid Gesture Player',
              desc: 'High-clarity video sequence player with step-by-step token progress, manual scrubbing, and fallback rendering.',
            },
            {
              icon: <Shield size={26} />,
              title: 'Privacy by Architecture',
              desc: 'Zero telemetry and zero cloud audio recording. Works on laptops, tablets, and offline Android devices.',
            },
            {
              icon: <Code2 size={26} />,
              title: 'Curated Gesture Library',
              desc: 'Easily searchable dictionary of gesture assets with alphabetical filters and token video playback previews.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="sign-card flex flex-col justify-between hover:border-[rgba(7,87,232,0.3)] hover:shadow-[0_14px_44px_rgba(7,87,232,0.12)] hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF9FF] dark:bg-blue-950/80 border border-[rgba(7,87,232,0.15)] text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#062B5C] dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#60759A] dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* End-to-End Pipeline Steps */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-[rgba(7,87,232,0.1)] dark:border-blue-900/30">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white">
            How SignAction Works
          </h2>
          <p className="text-sm text-[#60759A] dark:text-slate-400">
            Four streamlined steps connecting speech to gesture animations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Input', desc: 'Type text or record voice audio directly in browser' },
            { step: '02', title: 'Tokenize', desc: 'Rule-based NLP engine cleans and splits text tokens' },
            { step: '03', title: 'Gloss', desc: 'Converts English grammar into sign-language gloss structure' },
            { step: '04', title: 'Gesture Stream', desc: 'Smooth animated sequence plays corresponding sign videos' },
          ].map((s, idx) => (
            <div
              key={s.step}
              className="p-6 rounded-[24px] bg-white dark:bg-[#03133b] border border-[rgba(7,87,232,0.12)] dark:border-blue-900/50 shadow-sm relative"
            >
              <div className="text-2xl font-black text-[#12CFF3] mb-3">
                {s.step}
              </div>
              <h4 className="text-base font-bold text-[#062B5C] dark:text-white mb-1.5">
                {s.title}
              </h4>
              <p className="text-xs text-[#60759A] dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="rounded-[32px] bg-gradient-to-r from-[#062B87] via-[#0757E8] to-[#12CFF3] p-8 sm:p-14 text-center text-white shadow-[0_20px_60px_rgba(7,87,232,0.25)] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to break communication barriers?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto">
              Start translating text and speech to sign language gestures today. Fast, private, and accessible.
            </p>
            <div className="pt-2">
              <Link
                href="/translator"
                className="inline-flex items-center gap-2 bg-white text-[#0757E8] hover:bg-[#F4FAFF] font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                <span>Start Translating Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

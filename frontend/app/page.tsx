'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  Mic,
  Camera,
  BookOpen,
  Eye,
  Layers,
  ShieldCheck,
  Zap,
  Globe2,
  Smartphone,
  Download,
} from 'lucide-react';

interface InteractiveGesture {
  token: string;
  english: string;
  gloss: string;
  category: string;
  videoUrl: string;
}

const SAMPLE_GESTURES: InteractiveGesture[] = [
  {
    token: 'HELLO',
    english: 'Hello, how can I help you?',
    gloss: 'HELLO I HELP YOU HOW',
    category: 'Greeting',
    videoUrl: '/assets/signs/HELLO.mp4',
  },
  {
    token: 'THANK YOU',
    english: 'Thank you very much.',
    gloss: 'THANK YOU MUCH',
    category: 'Courtesy',
    videoUrl: '/assets/signs/THANK_YOU.mp4',
  },
  {
    token: 'WELCOME',
    english: 'You are welcome here.',
    gloss: 'WELCOME HERE YOU',
    category: 'Hospitality',
    videoUrl: '/assets/signs/WELCOME.mp4',
  },
  {
    token: 'HELP',
    english: 'Do you need help?',
    gloss: 'YOU HELP NEED QUESTION',
    category: 'Assistance',
    videoUrl: '/assets/signs/HELP.mp4',
  },
  {
    token: 'GOOD',
    english: 'Good morning, nice to meet you.',
    gloss: 'GOOD MORNING MEET NICE',
    category: 'Greeting',
    videoUrl: '/assets/signs/GOOD.mp4',
  },
];

export default function LandingPage() {
  const [activeGesture, setActiveGesture] = useState<InteractiveGesture>(SAMPLE_GESTURES[0]);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 selection:bg-[#12CFF3]/30 selection:text-[#062B5C] transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Human-Centered Asymmetrical Composition                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-24 lg:pb-28">
        
        {/* Subtle, soft organic background wash - warm and human */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[680px] h-[680px] bg-gradient-to-bl from-[#12CFF3]/10 via-[#0757E8]/05 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#EAF9FF]/40 dark:bg-blue-950/20 rounded-full blur-3xl -translate-x-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Expressive Editorial Copy & Refined CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-7 text-left"
            >
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.04)] text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#12CFF3]">
                <span className="w-2 h-2 rounded-full bg-[#0757E8] dark:bg-[#12CFF3]" />
                <span>A More Connected Way to Communicate</span>
              </div>

              {/* Expressive Editorial Headline */}
              <div className="space-y-4">
                <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[56px] tracking-[-0.03em] text-[#062B5C] dark:text-white leading-[1.12]">
                  Language is more <br className="hidden sm:inline" />
                  than <span className="text-[#0757E8] dark:text-[#12CFF3]">words.</span>
                </h1>
                <p className="text-lg sm:text-xl text-[#4A5568] dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                  Turn spoken and written English into Indian Sign Language, making communication more accessible, naturally and privately.
                </p>
              </div>

              {/* Refined CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                <Link
                  href="/translator"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full px-7 py-3.5 shadow-[0_4px_16px_rgba(7,87,232,0.28)] hover:shadow-[0_6px_22px_rgba(7,87,232,0.36)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  <span>Start Translating</span>
                  <ArrowRight size={17} />
                </Link>

                <a
                  href="/download-apk"
                  download="signaction.apk"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#062B5C] dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-full px-6 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  <Smartphone size={17} className="text-[#0757E8] dark:text-[#12CFF3]" />
                  <span>Download APK</span>
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#64748B] dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white px-4 py-3.5 transition-colors"
                >
                  <Play size={14} className="fill-current text-[#0757E8] dark:text-[#12CFF3]" />
                  <span>How it works</span>
                </a>
              </div>

              {/* 3 Core Value Props with Hairline Dividers */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <div className="font-heading font-bold text-base sm:text-lg text-[#062B5C] dark:text-white">
                    100% Offline
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                    No internet required
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200/80 dark:border-slate-800/80 pl-4 sm:pl-6">
                  <div className="font-heading font-bold text-base sm:text-lg text-[#062B5C] dark:text-white">
                    Real-Time
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                    Text, voice & camera
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200/80 dark:border-slate-800/80 pl-4 sm:pl-6">
                  <div className="font-heading font-bold text-base sm:text-lg text-[#062B5C] dark:text-white">
                    Accessible
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                    Built for everyone
                  </p>
                </div>
              </div>

            </motion.div>

            {/* Right Column: Authentic Visual Storytelling Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[540px]">
                
                {/* Main Hero Photographic Composition */}
                <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-[#EAF9FF] to-[#FAF9F6] dark:from-[#081530] dark:to-[#030914] border border-slate-200/80 dark:border-blue-900/40 shadow-[0_20px_60px_rgba(10,25,47,0.08)]">
                  
                  {/* Subtle soft backdrop curve */}
                  <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
                    <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
                      <path
                        d="M100 0 C250 80, 380 200, 400 400 L400 0 Z"
                        fill="url(#ambient-curve)"
                      />
                      <defs>
                        <linearGradient id="ambient-curve" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#12CFF3" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#0757E8" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Main Portrait of Indian Signer */}
                  <div className="relative aspect-[4/3.8] w-full">
                    <Image
                      src="/hero-signer.jpg"
                      alt="Indian woman communicating with an open palm sign language gesture"
                      fill
                      priority
                      className="object-cover object-top select-none"
                      sizes="(max-width: 768px) 100vw, 540px"
                    />
                  </div>
                </div>

                {/* Floating Speech Prompt Card with Sound Wave */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute top-4 sm:top-8 left-2 sm:-left-6 lg:-left-10 max-w-[210px] sm:max-w-[260px] bg-white/95 dark:bg-[#07132C]/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 dark:border-blue-900/50 shadow-[0_10px_30px_rgba(10,25,47,0.08)] flex items-center gap-2.5 sm:gap-3 z-20"
                >
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#062B5C] dark:text-white leading-snug">
                      Hello, how can I help you today?
                    </p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#0757E8] dark:text-[#12CFF3] shrink-0">
                    <Volume2 size={15} />
                  </div>
                </motion.div>

                {/* Subtle curved dotted indicator line pointing towards hand */}
                <div className="absolute top-20 sm:top-24 left-10 sm:left-14 pointer-events-none hidden sm:block z-10 opacity-60">
                  <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
                    <path
                      d="M10 5 C35 15, 55 35, 65 55"
                      stroke="#0757E8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Inset Video Player Preview (PiP) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="absolute bottom-4 sm:bottom-8 right-2 sm:-right-6 lg:-right-8 w-[210px] sm:w-[280px] rounded-2xl bg-white/95 dark:bg-[#061229]/95 backdrop-blur-md border border-slate-200/90 dark:border-blue-900/60 p-2 sm:p-2.5 shadow-[0_16px_40px_rgba(10,25,47,0.12)] z-20"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2">
                    <Image
                      src="/pip-video-preview.jpg"
                      alt="SignAction gesture video player playback"
                      fill
                      className="object-cover"
                      sizes="280px"
                    />

                    {/* HELLO Badge Tag */}
                    <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-white/95 text-[#0757E8] font-heading font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
                      HELLO
                    </div>

                    {/* Center subtle play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center">
                        <Play size={14} className="fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Scrubber timeline and mini controls */}
                  <div className="px-1 space-y-1.5">
                    {/* Scrub bar */}
                    <div className="relative h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0757E8] w-[45%] rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-slate-400 font-medium pt-0.5">
                      <span className="font-mono">0:02 / 0:05</span>
                      <span className="text-[#0757E8] dark:text-[#12CFF3] font-semibold">Indian Sign Language</span>
                    </div>
                  </div>
                </motion.div>


              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. AUDIENCE & COMMUNITY STRIP                                             */}
      {/* ========================================================================= */}
      <section className="relative border-y border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#071124]/60 backdrop-blur-sm py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            
            {/* Header label */}
            <div className="shrink-0 text-xs font-heading font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              Trusted by learners, <br className="hidden lg:inline" />
              educators & communities
            </div>

            {/* 4 Audience Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto flex-1">
              
              {/* Students */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src="/avatar-student.jpg"
                    alt="Students using SignAction"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Students
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Learn with confidence
                  </p>
                </div>
              </div>

              {/* Educators */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src="/avatar-educator.jpg"
                    alt="Educators using SignAction"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Educators
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Inclusive classrooms
                  </p>
                </div>
              </div>

              {/* Families */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src="/avatar-families.jpg"
                    alt="Families using SignAction"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Families
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Everyday conversations
                  </p>
                </div>
              </div>

              {/* Communities */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Communities using SignAction"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Communities
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Universal access
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: A Simple Path From Words to Signs                        */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-xs font-heading font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
              How It Works
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight text-[#062B5C] dark:text-white">
              A simple path from <span className="text-[#0757E8] dark:text-[#12CFF3]">words to signs.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 leading-relaxed font-normal">
              Type, speak or use your camera — SignAction instantly converts it into Indian Sign Language gestures.
            </p>
          </div>

          {/* 4 Clean Editorial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1: Input */}
            <div className="bg-white dark:bg-[#07132B] rounded-[24px] p-7 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] hover:border-[#0757E8]/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Mic size={22} />
                </div>
                <div className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white mb-2">
                  1. Input
                </div>
                <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                  Type your phrase or speak directly into your microphone for instant voice transcription.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3]">
                <span>Voice & Text Input</span>
              </div>
            </div>

            {/* Step 2: Translate */}
            <div className="bg-white dark:bg-[#07132B] rounded-[24px] p-7 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] hover:border-[#0757E8]/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Sparkles size={22} />
                </div>
                <div className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white mb-2">
                  2. Translate
                </div>
                <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                  Linguistic rules parse the sentence into authentic Indian Sign Language grammatical gloss.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3]">
                <span>SOV Grammar Engine</span>
              </div>
            </div>

            {/* Step 3: Visualize */}
            <div className="bg-white dark:bg-[#07132B] rounded-[24px] p-7 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] hover:border-[#0757E8]/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Eye size={22} />
                </div>
                <div className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white mb-2">
                  3. Visualize
                </div>
                <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                  Watch continuous, verified video gestures play seamlessly with timeline controls.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3]">
                <span>Video Sign Stream</span>
              </div>
            </div>

            {/* Step 4: Learn */}
            <div className="bg-white dark:bg-[#07132B] rounded-[24px] p-7 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] hover:border-[#0757E8]/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <BookOpen size={22} />
                </div>
                <div className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white mb-2">
                  4. Learn
                </div>
                <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                  Deepen your vocabulary through our interactive A–Z gesture lexicon and fingerspelling charts.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3]">
                <span>Interactive Dictionary</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EDITORIAL STORY: Bridging the Divide with Human Dignity                */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#030B18] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Authentic Photography Card with Quote Overlay */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(10,25,47,0.08)]">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Two people communicating with smiles in an inclusive community setting"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#062B5C]/90 via-[#062B5C]/30 to-transparent" />
                  
                  {/* Quote block inside photo */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <p className="font-heading italic text-base sm:text-lg leading-snug">
                      &ldquo;Communication is not a privilege. It is fundamental human dignity.&rdquo;
                    </p>
                    <p className="text-xs text-white/80 font-medium tracking-wide">
                      — SignAction Accessibility Initiative
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Thoughtful Narrative */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-xs font-heading font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
                Our Purpose
              </div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] tracking-tight text-[#062B5C] dark:text-white leading-[1.18]">
                Bridging the silent divide with nuance and respect.
              </h2>

              <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 leading-relaxed">
                For over 63 million Deaf and Hard-of-Hearing individuals across India, everyday communication often relies on ad-hoc gestures or unavailable interpreters. SignAction was built to change that — translating speech and text into natural, grammatically sound Indian Sign Language (ISL).
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      Linguistic Integrity
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                      Respects ISL Subject-Object-Verb (SOV) grammatical structure rather than verbatim word-by-word substitution.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      Culturally Grounded
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                      Curated gesture library developed in alignment with Indian Deaf community standards and regional variations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      Equal Participation
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                      Unlocks immediate accessibility in classrooms, clinics, workplaces, and family conversations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-heading font-bold text-[#0757E8] dark:text-[#12CFF3] hover:underline"
                >
                  <span>Read our full mission & IEEE research paper</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRIVACY & EDGE INDEPENDENCE: 100% Offline by Design                   */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-xs font-heading font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
              <ShieldCheck size={14} />
              <span>On-Device Privacy</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight text-[#062B5C] dark:text-white">
              Speech and gestures that <br className="hidden sm:inline" />
              never leave your device.
            </h2>
            <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 leading-relaxed font-normal">
              True accessibility requires trust. We engineered SignAction to operate 100% on your device, ensuring total conversational privacy.
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white dark:bg-[#07132B] rounded-[28px] p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(10,25,47,0.03)] text-left space-y-3">
              <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0757E8] dark:text-[#12CFF3] tracking-tight">
                0 KB
              </div>
              <h3 className="font-heading font-bold text-lg text-[#062B5C] dark:text-white">
                Cloud Audio Uploads
              </h3>
              <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                Voice audio is processed locally via Vosk WebAssembly. Zero recordings or transcriptions ever leave your computer or phone.
              </p>
            </div>

            <div className="bg-white dark:bg-[#07132B] rounded-[28px] p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(10,25,47,0.03)] text-left space-y-3">
              <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0757E8] dark:text-[#12CFF3] tracking-tight">
                &lt; 120ms
              </div>
              <h3 className="font-heading font-bold text-lg text-[#062B5C] dark:text-white">
                Immediate Response
              </h3>
              <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                By running parsing and tokenization on edge hardware, visual signs are rendered in real time without network round trips.
              </p>
            </div>

            <div className="bg-white dark:bg-[#07132B] rounded-[28px] p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(10,25,47,0.03)] text-left space-y-3">
              <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0757E8] dark:text-[#12CFF3] tracking-tight">
                100%
              </div>
              <h3 className="font-heading font-bold text-lg text-[#062B5C] dark:text-white">
                Offline Autonomy
              </h3>
              <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                Turn on Airplane mode. Speech recognition and sign playback continue to operate smoothly without mobile data or Wi-Fi.
              </p>
            </div>

          </div>

          {/* Quick Offline CTA button */}
          <div className="mt-12 text-center">
            <Link
              href="/offline-setup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0757E8] dark:text-[#12CFF3] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 rounded-full px-6 py-3 border border-blue-200/60 dark:border-blue-800/60 transition-colors"
            >
              <span>Setup Offline Mode for Web & Mobile</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE GESTURE EXPLORER: Try Real Signs in Browser               */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white dark:bg-[#030B18] border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 text-xs font-heading font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
              <Eye size={14} />
              <span>Interactive Vocabulary</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight text-[#062B5C] dark:text-white">
              Experience signs in motion.
            </h2>
            <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300">
              Select an everyday phrase to see how SignAction maps English into verified visual gestures.
            </p>
          </div>

          {/* Gesture Pills Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-12">
            {SAMPLE_GESTURES.map((gesture) => {
              const isSelected = activeGesture.token === gesture.token;
              return (
                <button
                  key={gesture.token}
                  onClick={() => {
                    setActiveGesture(gesture);
                    setIsPlaying(true);
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-heading font-bold transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0757E8] text-white shadow-[0_4px_14px_rgba(7,87,232,0.28)] scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 text-[#4A5568] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {gesture.token}
                </button>
              );
            })}
          </div>

          {/* Interactive Player Showcase Card */}
          <div className="max-w-4xl mx-auto bg-[#FAF9F6] dark:bg-[#07132B] rounded-[32px] p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-[0_10px_35px_rgba(10,25,47,0.06)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Video Player */}
              <div className="md:col-span-7">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200/80 dark:border-slate-800 shadow-md">
                  <video
                    key={activeGesture.videoUrl}
                    src={activeGesture.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
                    {activeGesture.category}
                  </div>
                </div>
              </div>

              {/* Right Column: Breakdown */}
              <div className="md:col-span-5 space-y-5 text-left">
                <div>
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1">
                    English Meaning
                  </span>
                  <div className="font-heading font-extrabold text-xl text-[#062B5C] dark:text-white">
                    &ldquo;{activeGesture.english}&rdquo;
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1">
                    ISL Sign Gloss
                  </span>
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-[#0757E8] dark:text-[#12CFF3] font-mono text-xs font-bold tracking-wider">
                    {activeGesture.gloss}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/translator"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0757E8] dark:text-[#12CFF3] hover:underline"
                  >
                    <span>Translate your own sentence</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DEDICATED NATIVE ANDROID MOBILE APP SECTION                            */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#F0F7FF] dark:from-[#050B14] dark:to-[#07132B] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#07132C] rounded-[36px] p-8 sm:p-12 lg:p-16 border border-blue-200/80 dark:border-blue-900/60 shadow-[0_12px_40px_rgba(7,87,232,0.12)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 text-xs font-heading font-extrabold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
                  <Smartphone size={14} />
                  <span>SignAction for Android</span>
                </div>

                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#062B5C] dark:text-white leading-[1.18]">
                  Take Indian Sign Language with you. <br className="hidden sm:inline" />
                  <span className="text-[#0757E8] dark:text-[#12CFF3]">Everywhere. Completely Offline.</span>
                </h2>

                <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 leading-relaxed font-normal">
                  Download the standalone Android APK. All 347 high-definition ISL gesture videos and offline Vosk speech recognition models are bundled directly inside the app — no mobile data, internet, or cloud connection required.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#040913] border border-slate-200/70 dark:border-slate-800/80 space-y-1">
                    <div className="font-heading font-extrabold text-lg text-[#0757E8] dark:text-[#12CFF3]">347 Signs</div>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">Pre-installed video gestures</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#040913] border border-slate-200/70 dark:border-slate-800/80 space-y-1">
                    <div className="font-heading font-extrabold text-lg text-[#0757E8] dark:text-[#12CFF3]">0 KB Data</div>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">100% offline playback</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#040913] border border-slate-200/70 dark:border-slate-800/80 space-y-1">
                    <div className="font-heading font-extrabold text-lg text-[#0757E8] dark:text-[#12CFF3]">Instant</div>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">Speech & text translation</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <a
                    href="/download-apk"
                    download="signaction.apk"
                    className="inline-flex items-center gap-2.5 text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full px-8 py-4 shadow-[0_6px_22px_rgba(7,87,232,0.32)] hover:shadow-[0_8px_26px_rgba(7,87,232,0.42)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Download size={18} />
                    <span>Download Android APK (145 MB)</span>
                  </a>
                  <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                    Supports Android 8.0+ • Free & Ad-free
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-64 sm:w-72 aspect-[9/18.5] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 dark:border-slate-700">
                  <div className="w-full h-full rounded-[40px] overflow-hidden bg-[#FAF9F6] dark:bg-[#050B14] flex flex-col items-center justify-between p-6 text-center">
                    <div className="w-20 h-4 bg-black rounded-full mb-4" />
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0757E8] to-[#12CFF3] flex items-center justify-center text-white shadow-lg">
                        <Smartphone size={32} />
                      </div>
                      <h4 className="font-heading font-extrabold text-xl text-[#062B5C] dark:text-white">SignAction</h4>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">Indian Sign Language Offline Engine</p>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        ✓ All 347 Gestures Offline
                      </span>
                    </div>
                    <a
                      href="/download-apk"
                      download="signaction.apk"
                      className="w-full py-3 rounded-full bg-[#0757E8] text-white text-xs font-bold shadow-md hover:bg-[#064BD1] transition-all"
                    >
                      Install on Phone
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. REFINED FINAL CALL TO ACTION                                           */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-gradient-to-b from-[#062B5C] to-[#0A192F] text-white p-10 sm:p-16 text-center space-y-7 shadow-[0_20px_60px_rgba(6,43,92,0.18)] relative overflow-hidden">
            
            {/* Subtle light ambient glow */}
            <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-[#12CFF3]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-heading font-semibold tracking-wider uppercase text-[#7DEBFA]">
              Universal Accessibility
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to experience communication without barriers?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Start translating text and voice into Indian Sign Language today. Free, private, and always available offline on your device.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/translator"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#062B5C] bg-white hover:bg-slate-100 rounded-full px-8 py-3.5 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Translating Now</span>
                <ArrowRight size={17} />
              </Link>

              <a
                href="/download-apk"
                download="signaction.apk"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-8 py-3.5 transition-all"
              >
                <Smartphone size={16} className="text-[#12CFF3]" />
                <span>Download Android APK</span>
              </a>

              <Link
                href="/dictionary"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-300 hover:text-white px-6 py-3.5 transition-colors"
              >
                <span>Explore Dictionary</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

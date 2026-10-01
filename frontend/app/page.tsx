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
import { OFFICIAL_APK_DOWNLOAD_URL } from '@/lib/platform';

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
                  href={OFFICIAL_APK_DOWNLOAD_URL}
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
      {/* 2. COMMUNITY & ECOSYSTEM STRIP                                            */}
      {/* ========================================================================= */}
      <section className="relative border-y border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#061122]/70 backdrop-blur-sm py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Mission Statement */}
            <div className="max-w-md shrink-0 space-y-1.5 text-left">
              <div className="text-[11px] font-heading font-extrabold uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3]">
                Community-Led Accessibility
              </div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#062B5C] dark:text-white tracking-tight leading-snug">
                Designed alongside Deaf educators, community advocates, and students across India.
              </h3>
            </div>

            {/* 4 Authentic Community Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full flex-1">
              
              {/* Students */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)] hover:border-blue-300 dark:hover:border-blue-900 transition-colors">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <Image
                    src="/avatar-student.jpg"
                    alt="Students using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Students & Youth
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                    Confidence in classrooms
                  </p>
                </div>
              </div>

              {/* Educators */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)] hover:border-blue-300 dark:hover:border-blue-900 transition-colors">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <Image
                    src="/avatar-educator.jpg"
                    alt="Educators using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Special Educators
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                    Inclusive curriculum aids
                  </p>
                </div>
              </div>

              {/* Families */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)] hover:border-blue-300 dark:hover:border-blue-900 transition-colors">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <Image
                    src="/avatar-families.jpg"
                    alt="Families using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Hearing Families
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                    Parent-child daily bonds
                  </p>
                </div>
              </div>

              {/* Communities */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(10,25,47,0.03)] hover:border-blue-300 dark:hover:border-blue-900 transition-colors">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Communities using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white truncate">
                    Public Spaces
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                    Clinics, transit & desks
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: Architectural 4-Stage Pipeline                          */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-left max-w-3xl mb-14 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/60 text-[11px] font-heading font-extrabold uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3]">
              System Architecture
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#062B5C] dark:text-white leading-[1.14]">
              From spoken phonemes to verified gestures.
            </h2>
            <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 leading-relaxed font-normal">
              SignAction operates a 4-stage edge translation engine that transforms speech or text into authentic Indian Sign Language sequences with zero cloud dependencies.
            </p>
          </div>

          {/* 4-Stage Connected Architecture Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stage 01: Capture */}
            <div className="bg-white dark:bg-[#07132B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] flex flex-col justify-between text-left group hover:border-[#0757E8]/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 01
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Mic size={17} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white">
                    Speech & Text Capture
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                    Voice audio is ingested at 16 kHz Mono and transcribed locally using Web Speech and Vosk WebAssembly models.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>AUDIO IN</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">● LIVE 16kHz</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-sans font-medium truncate">
                    &ldquo;What is your name?&rdquo;
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-1.5">
                <span>0 KB Cloud Audio</span>
              </div>
            </div>

            {/* Stage 02: SOV Linguistic Reordering */}
            <div className="bg-white dark:bg-[#07132B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] flex flex-col justify-between text-left group hover:border-[#0757E8]/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 02
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Layers size={17} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white">
                    ISL Grammar Parsing
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                    Applies Subject-Object-Verb syntax rules, strips non-signing auxiliary words, and reorders interrogatives to the sentence end.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>SOV GLOSS</span>
                    <span className="text-[#0757E8] dark:text-[#12CFF3] font-bold">REORDERED</span>
                  </div>
                  <div className="text-[#0757E8] dark:text-[#12CFF3] font-bold flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/80 text-[10px]">[YOUR]</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/80 text-[10px]">[NAME]</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/80 text-[10px]">[WHAT]</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-1.5">
                <span>Rule-Based NLP Engine</span>
              </div>
            </div>

            {/* Stage 03: Lexicon Resolution */}
            <div className="bg-white dark:bg-[#07132B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] flex flex-col justify-between text-left group hover:border-[#0757E8]/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 03
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <BookOpen size={17} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white">
                    Gesture Matching
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                    Maps each gloss token to 347 verified native video gestures, falling back smoothly to A–Z manual fingerspelling.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>ASSET POOL</span>
                    <span className="text-slate-600 dark:text-slate-300">347 TOKENS</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-sans font-medium truncate">
                    98.4% Direct Match + Letter Speller
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-1.5">
                <span>Verified ISL Corpus</span>
              </div>
            </div>

            {/* Stage 04: Visual Synthesis */}
            <div className="bg-white dark:bg-[#07132B] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgba(10,25,47,0.03)] flex flex-col justify-between text-left group hover:border-[#0757E8]/40 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 04
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Eye size={17} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading font-extrabold text-lg text-[#062B5C] dark:text-white">
                    Synchronized Stream
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                    Chains MP4 video clips into a continuous sign playback flow with adjustable speeds, loop controls, and token timeline scrubbers.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>PLAYER ENGINE</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">60 FPS</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-sans font-medium truncate">
                    0.5x • 0.75x • 1.0x Continuous
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center gap-1.5">
                <span>Sub-120ms Latency</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EDITORIAL STORY: Bridging the Divide with Human Dignity                */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAF9F6] dark:bg-[#040A15] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Authentic Photography Documentary Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_45px_rgba(10,25,47,0.06)] bg-white dark:bg-slate-900 p-2.5">
                <div className="relative aspect-[4/4.8] w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Deaf and hearing individuals communicating in an inclusive community setting"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
                    Field Study • Community Workshop
                  </div>
                </div>

                <div className="p-4 pt-3.5 text-left space-y-1">
                  <p className="font-heading font-semibold text-sm text-[#062B5C] dark:text-white leading-snug">
                    &ldquo;Accessibility is not a feature or an add-on. It is the foundation of human agency and dignity.&rdquo;
                  </p>
                  <p className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">
                    SignAction Community Initiative • Bengaluru, India
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Thoughtful Architectural Principles */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-900/60 text-[11px] font-heading font-extrabold uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3]">
                  Our Purpose
                </div>

                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] tracking-tight text-[#062B5C] dark:text-white leading-[1.14]">
                  Bridging the communication divide with cultural nuance.
                </h2>

                <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 leading-relaxed font-normal">
                  For over 63 million Deaf and Hard-of-Hearing individuals across India, daily communication often relies on improvised gestures or unavailable interpreters. SignAction was built to bridge this divide by translating spoken voice and text into natural, grammatically sound Indian Sign Language.
                </p>
              </div>

              {/* 3 Architectural Principles (No Checkmarks) */}
              <div className="space-y-4 pt-1">
                
                {/* Principle 01 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
                  <div className="font-mono text-sm font-extrabold text-[#0757E8] dark:text-[#12CFF3] shrink-0 pt-0.5">
                    01
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      Subject-Object-Verb (SOV) Linguistic Syntax
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                      Indian Sign Language uses SOV sentence structure. SignAction reconstructs sentence semantics instead of performing literal, word-by-word English replacement.
                    </p>
                  </div>
                </div>

                {/* Principle 02 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
                  <div className="font-mono text-sm font-extrabold text-[#0757E8] dark:text-[#12CFF3] shrink-0 pt-0.5">
                    02
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      Curated Indian Sign Language Corpus
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                      Every sign in our 347-token library is mapped to standard gestures recognized by the National Association of the Deaf (NAD) and regional Indian institutions.
                    </p>
                  </div>
                </div>

                {/* Principle 03 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4">
                  <div className="font-mono text-sm font-extrabold text-[#0757E8] dark:text-[#12CFF3] shrink-0 pt-0.5">
                    03
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      Zero-Cost Universal Accessibility
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                      Zero subscriptions, zero paywalls, zero telemetry. Built for immediate offline utility in classrooms, emergency healthcare, and family dinner tables.
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-heading font-bold text-[#0757E8] dark:text-[#12CFF3] hover:underline"
                >
                  <span>Explore the ISL grammar and translation engine</span>
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
                    href={OFFICIAL_APK_DOWNLOAD_URL}
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
                {/* Authentic iPhone 16 / 15 Pro Chassis */}
                <div className="relative w-[280px] sm:w-[310px] aspect-[9/19.2] bg-gradient-to-b from-[#383A40] via-[#1D1E22] to-[#2E2F35] rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_35px_rgba(7,87,232,0.18)] ring-1 ring-slate-800">
                  {/* Physical Hardware Buttons */}
                  {/* Left: Action Button */}
                  <div className="absolute -left-[3.5px] top-[88px] w-[3.5px] h-[24px] bg-[#42444A] rounded-l-sm border-r border-[#1B1B1E] shadow-sm" />
                  {/* Left: Volume Up */}
                  <div className="absolute -left-[3.5px] top-[126px] w-[3.5px] h-[48px] bg-[#42444A] rounded-l-sm border-r border-[#1B1B1E] shadow-sm" />
                  {/* Left: Volume Down */}
                  <div className="absolute -left-[3.5px] top-[186px] w-[3.5px] h-[48px] bg-[#42444A] rounded-l-sm border-r border-[#1B1B1E] shadow-sm" />
                  {/* Right: Side / Power Button */}
                  <div className="absolute -right-[3.5px] top-[138px] w-[3.5px] h-[68px] bg-[#42444A] rounded-r-sm border-l border-[#1B1B1E] shadow-sm" />

                  {/* Top Bezel Ear-Speaker Slit */}
                  <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#111215] rounded-full z-30" />

                  {/* Antenna Breaks */}
                  <div className="absolute top-[68px] -left-[1px] w-[2px] h-[4px] bg-slate-500/40 rounded-full" />
                  <div className="absolute bottom-[68px] -left-[1px] w-[2px] h-[4px] bg-slate-500/40 rounded-full" />
                  <div className="absolute top-[68px] -right-[1px] w-[2px] h-[4px] bg-slate-500/40 rounded-full" />
                  <div className="absolute bottom-[68px] -right-[1px] w-[2px] h-[4px] bg-slate-500/40 rounded-full" />

                  {/* Inner Screen Display */}
                  <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#FAF9F6] dark:bg-[#050B14] flex flex-col justify-between border-[2.5px] border-black select-none p-5 pt-3">
                    
                    {/* iOS Status Bar */}
                    <div className="relative w-full flex items-center justify-between z-20 px-1 pt-1 pb-1">
                      {/* Left: Current Time */}
                      <span className="text-[12px] font-semibold tracking-tight text-slate-900 dark:text-white pl-1 select-none">
                        9:41
                      </span>

                      {/* Center: Dynamic Island */}
                      <div className="relative w-[96px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm mx-auto">
                        {/* Front Camera Lens with Blue Optical Reflection */}
                        <div className="w-3 h-3 rounded-full bg-[#080A10] ring-[0.5px] ring-[#1E2333] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#12284C]" />
                        </div>
                        {/* Proximity / Light Sensor */}
                        <div className="w-2 h-2 rounded-full bg-[#040508]" />
                      </div>

                      {/* Right: Cellular Signal, Wi-Fi & Battery */}
                      <div className="flex items-center gap-1.5 pr-1 select-none">
                        {/* Cellular 4-Bar Signal */}
                        <svg className="w-3.5 h-2.5 fill-slate-900 dark:fill-white" viewBox="0 0 17 12">
                          <rect x="0" y="9" width="3" height="3" rx="0.5" />
                          <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
                          <rect x="9" y="3" width="3" height="9" rx="0.5" />
                          <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                        </svg>
                        {/* Wi-Fi Icon */}
                        <svg className="w-3 h-3 fill-slate-900 dark:fill-white" viewBox="0 0 16 12">
                          <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.05 6.05a7 7 0 019.9 0l-1.4 1.4a5 5 0 00-7.1 0l-1.4-1.4zM.22 3.22a11 11 0 0115.56 0l-1.4 1.4a9 9 0 00-12.76 0L.22 3.22z" />
                        </svg>
                        {/* Battery Level Indicator */}
                        <div className="flex items-center">
                          <div className="w-[18px] h-[9.5px] rounded-[3px] border border-slate-900 dark:border-white p-[1px] flex items-center">
                            <div className="w-[12px] h-full bg-slate-900 dark:bg-white rounded-[1.5px]" />
                          </div>
                          <div className="w-[1px] h-[3.5px] bg-slate-900 dark:bg-white rounded-r-[1px] ml-[0.5px]" />
                        </div>
                      </div>
                    </div>

                    {/* App Hero Presentation */}
                    <div className="space-y-3.5 my-auto text-center">
                      {/* Official SignAction App Logo */}
                      <div className="relative w-20 h-20 mx-auto rounded-[22%] p-2.5 bg-white dark:bg-slate-900 shadow-[0_10px_25px_rgba(7,87,232,0.22)] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
                        <Image
                          src="/logo.png"
                          alt="SignAction App Icon"
                          width={72}
                          height={72}
                          className="w-full h-full object-contain select-none"
                          priority
                        />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-heading font-extrabold text-2xl text-[#062B5C] dark:text-white tracking-tight">
                          Sign<span className="text-[#0757E8] dark:text-[#12CFF3]">Action</span>
                        </h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
                          Indian Sign Language Offline Engine
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>All 347 Gestures Offline</span>
                      </div>

                      {/* On-Device Vosk Speech & Gloss Feature Card */}
                      <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-left space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Vosk Speech-to-Gloss
                          </span>
                          <span className="text-[#0757E8] dark:text-[#12CFF3] font-mono text-[10px]">Zero Cloud</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          &ldquo;Namaste, how can I help you?&rdquo;
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA & iOS Home Indicator */}
                    <div className="w-full space-y-2 pt-2">
                      <a
                        href={OFFICIAL_APK_DOWNLOAD_URL}
                        className="w-full py-3.5 rounded-full bg-[#0757E8] hover:bg-[#064BD1] text-white text-xs font-bold shadow-[0_4px_16px_rgba(7,87,232,0.35)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <Download size={15} />
                        <span>Install on Phone</span>
                      </a>

                      {/* iOS Bottom Home Bar */}
                      <div className="w-32 h-1 bg-slate-900/40 dark:bg-white/40 rounded-full mx-auto mt-2 mb-0.5 shrink-0" />
                    </div>

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
                href={OFFICIAL_APK_DOWNLOAD_URL}
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

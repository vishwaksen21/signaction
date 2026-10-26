'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  Mic,
  BookOpen,
  Eye,
  Layers,
  ShieldCheck,
  Smartphone,
  Download,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import {
  OFFICIAL_APK_DOWNLOAD_URL,
  OFFICIAL_APK_SIZE_LABEL,
  isNativeApk,
  useIsMobileApp,
} from '@/lib/platform';
import { MobileHomeScreen } from '@/components/mobile/mobile-home-screen';

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
    gloss: 'HELLO ME YOU HELP HOW',
    category: 'Greeting',
    videoUrl: '/assets/signs/HELLO.mp4',
  },
  {
    token: 'THANK YOU',
    english: 'Thank you very much.',
    gloss: 'THANK_YOU MUCH',
    category: 'Courtesy',
    videoUrl: '/assets/signs/THANK_YOU.mp4',
  },
  {
    token: 'WELCOME',
    english: 'You are welcome here.',
    gloss: 'YOU HERE WELCOME',
    category: 'Hospitality',
    videoUrl: '/assets/signs/WELCOME.mp4',
  },
  {
    token: 'HELP',
    english: 'Do you need help?',
    gloss: 'YOU HELP NEED',
    category: 'Assistance',
    videoUrl: '/assets/signs/HELP.mp4',
  },
  {
    token: 'GOOD MORNING',
    english: 'Good morning, nice to meet you.',
    gloss: 'GOOD_MORNING NICE YOU MEET',
    category: 'Greeting',
    videoUrl: '/assets/signs/GOOD_MORNING.mp4',
  },
];

interface SyntaxToken {
  id: string;
  text: string;
  role: string;
  isDropped?: boolean;
}

interface SyntaxCase {
  id: string;
  label: string;
  englishPhrase: string;
  svoOrder: string;
  sovOrder: string;
  englishTokens: SyntaxToken[];
  islTokens: SyntaxToken[];
  ruleExplanation: string;
  linguisticTag: string;
}

const SYNTAX_CASES: SyntaxCase[] = [
  {
    id: 'name',
    label: 'Greeting & Identity',
    englishPhrase: 'What is your name?',
    svoOrder: 'Question + Copula + Possessive + Noun',
    sovOrder: 'Possessive + Noun + Clause-Final Question',
    englishTokens: [
      { id: 'tok-what', text: 'What', role: 'Interrogative' },
      { id: 'tok-is', text: 'is', role: 'Copula (Omitted)', isDropped: true },
      { id: 'tok-your', text: 'your', role: 'Possessive' },
      { id: 'tok-name', text: 'name', role: 'Subject Noun' },
    ],
    islTokens: [
      { id: 'tok-your', text: 'YOUR', role: 'Possessive' },
      { id: 'tok-name', text: 'NAME', role: 'Subject Noun' },
      { id: 'tok-what', text: 'WHAT', role: 'Question (Final)' },
    ],
    ruleExplanation: "In Indian Sign Language, questions are marked clause-finally with a head tilt and brow furrow. The auxiliary copula 'is' has no visual sign equivalent and is omitted.",
    linguisticTag: 'Clause-Final Interrogative',
  },
  {
    id: 'hospital',
    label: 'Navigation & Space',
    englishPhrase: 'Where is the hospital?',
    svoOrder: 'Question + Copula + Article + Noun',
    sovOrder: 'Spatial Topic + Clause-Final Question',
    englishTokens: [
      { id: 'tok-where', text: 'Where', role: 'Location' },
      { id: 'tok-is', text: 'is', role: 'Copula (Omitted)', isDropped: true },
      { id: 'tok-the', text: 'the', role: 'Article (Omitted)', isDropped: true },
      { id: 'tok-hospital', text: 'hospital', role: 'Topic Noun' },
    ],
    islTokens: [
      { id: 'tok-hospital', text: 'HOSPITAL', role: 'Spatial Topic' },
      { id: 'tok-where', text: 'WHERE', role: 'Question (Final)' },
    ],
    ruleExplanation: "Articles ('the') and linking verbs ('is') are non-signing English artifacts. ISL establishes the spatial topic ('HOSPITAL') before anchoring the question ('WHERE').",
    linguisticTag: 'Topic-Comment Structure',
  },
  {
    id: 'tomorrow',
    label: 'Time & Action',
    englishPhrase: 'I will help you tomorrow.',
    svoOrder: 'Subject + Modal + Verb + Object + Time',
    sovOrder: 'Time Anchor + Subject + Object + Action',
    englishTokens: [
      { id: 'tok-i', text: 'I', role: 'Subject' },
      { id: 'tok-will', text: 'will', role: 'Modal (Omitted)', isDropped: true },
      { id: 'tok-help', text: 'help', role: 'Action Verb' },
      { id: 'tok-you', text: 'you', role: 'Object' },
      { id: 'tok-tomorrow', text: 'tomorrow', role: 'Temporal Anchor' },
    ],
    islTokens: [
      { id: 'tok-tomorrow', text: 'TOMORROW', role: 'Timeline Anchor' },
      { id: 'tok-i', text: 'I', role: 'Subject' },
      { id: 'tok-you', text: 'YOU', role: 'Object' },
      { id: 'tok-help', text: 'HELP', role: 'Terminal Action' },
    ],
    ruleExplanation: "Sign languages establish the temporal frame ('TOMORROW') at the very beginning of the sentence to set the tense line, followed strictly by Subject-Object-Verb.",
    linguisticTag: 'Temporal Framing & SOV Order',
  },
];

export default function LandingPage() {
  const isMobileApp = useIsMobileApp();
  const [activeGesture, setActiveGesture] = useState<InteractiveGesture>(SAMPLE_GESTURES[0]);
  const [activeSyntaxCase, setActiveSyntaxCase] = useState<SyntaxCase>(SYNTAX_CASES[0]);
  const [syntaxMode, setSyntaxMode] = useState<'english' | 'isl'>('isl');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const explorerVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsNative(isNativeApk());
  }, []);

  useEffect(() => {
    const el = explorerVideoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying, activeGesture.videoUrl]);

  if (isMobileApp) {
    return <MobileHomeScreen />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF9F6] dark:bg-[#050B14] text-[#0A192F] dark:text-slate-100 selection:bg-[#12CFF3]/30 selection:text-[#062B5C] transition-colors duration-300">
      
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
              {/* Apple Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-xl border border-black/5 dark:border-white/10 text-xs font-semibold tracking-wide text-[#0757E8] dark:text-[#12CFF3]">
                <span className="w-2 h-2 rounded-full bg-[#0757E8] dark:bg-[#12CFF3] animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider">Neural ISL Synthesis Engine</span>
              </div>

              {/* Apple Display Headline */}
              <div className="space-y-4">
                <h1 className="font-heading font-black text-3xl xs:text-4xl sm:text-5xl lg:text-[64px] tracking-[-0.035em] text-[#1d1d1f] dark:text-white leading-[1.08] sm:leading-[1.06]">
                  Sign language. <br />
                  <span className="bg-gradient-to-r from-[#0757E8] via-[#087FF5] to-[#12CFF3] bg-clip-text text-transparent">
                    In real time.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#60759A] dark:text-slate-300 leading-relaxed font-normal max-w-xl">
                  Turn spoken and written English into natural Indian Sign Language gestures. Powered by 100% on-device neural models and fluid spring kinematics. Completely private. Zero cloud latency.
                </p>
              </div>

              {/* Apple Action Pills */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                <Link
                  href="/translator"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full px-7 py-3.5 min-h-[48px] shadow-[0_4px_16px_rgba(7,87,232,0.28)] hover:shadow-[0_6px_22px_rgba(7,87,232,0.36)] transition-[transform,background-color,box-shadow] duration-160 ease-apple hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                >
                  <span>Start Translating</span>
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/dictionary"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#062B5C] dark:text-slate-100 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 backdrop-blur-xl border border-black/5 dark:border-white/15 rounded-full px-6 py-3.5 min-h-[48px] shadow-sm transition-[transform,background-color,border-color] duration-160 ease-apple hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                >
                  <BookOpen size={16} className="text-[#0757E8] dark:text-[#12CFF3]" />
                  <span>Browse 347 Signs</span>
                </Link>

                {!isNative && (
                  <a
                    href={OFFICIAL_APK_DOWNLOAD_URL}
                    download="signaction.apk"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white px-3 py-3.5 transition-colors"
                  >
                    <Smartphone size={15} />
                    <span>Android APK</span>
                  </a>
                )}
              </div>

              {/* Apple Hardware Spec Ribbon */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-2.5 sm:gap-6">
                <div className="space-y-1 min-w-0">
                  <div className="font-heading font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                    100% On-Device
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 leading-snug">
                    Zero cloud audio sent
                  </p>
                </div>

                <div className="space-y-1 min-w-0 border-l border-slate-200/80 dark:border-slate-800/80 pl-2.5 sm:pl-6">
                  <div className="font-heading font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                    60 FPS Motion
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 leading-snug">
                    Fluid spring kinematics
                  </p>
                </div>

                <div className="space-y-1 min-w-0 border-l border-slate-200/80 dark:border-slate-800/80 pl-2.5 sm:pl-6">
                  <div className="font-heading font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                    Zero Latency
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-slate-400 leading-snug">
                    Instant offline fallback
                  </p>
                </div>
              </div>

            </motion.div>

            {/* Right Column: Apple Cupertino Interactive Live Gesture Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="lg:col-span-6 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[540px]">
                
                {/* Cupertino Glass Deck Container */}
                <div className="relative rounded-[32px] sm:rounded-[36px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6 shadow-[0_24px_70px_rgba(0,0,0,0.12)] space-y-4">
                  
                  {/* Top: Cupertino Segmented Control */}
                  <div className="flex items-center p-1 bg-black/[0.05] dark:bg-white/[0.08] rounded-full backdrop-blur-md overflow-x-auto no-scrollbar">
                    {SAMPLE_GESTURES.map((g) => {
                      const isCurrent = activeGesture.token === g.token;
                      return (
                        <button
                          key={g.token}
                          type="button"
                          onClick={() => setActiveGesture(g)}
                          className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors shrink-0 ${
                            isCurrent
                              ? 'text-[#062B5C] dark:text-white font-bold'
                              : 'text-slate-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {isCurrent && (
                            <motion.div
                              layoutId="apple-hero-active-pill"
                              className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-sm"
                              transition={{ type: 'spring', duration: 0.32, bounce: 0 }}
                            />
                          )}
                          <span className="relative z-10">{g.token.replace(/_/g, ' ')}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Center: Live Gesture Display Stage */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 shadow-inner group">
                    <video
                      ref={explorerVideoRef}
                      key={activeGesture.videoUrl}
                      src={activeGesture.videoUrl}
                      autoPlay={isPlaying}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain select-none"
                    />

                    {/* Live overlay badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-white border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>60 FPS • RAW ISL</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 border border-white/10 font-bold uppercase">
                      {activeGesture.category}
                    </div>

                    {/* Bottom floating playback & gloss card */}
                    <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl text-white flex items-center justify-between border border-white/10">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold font-heading truncate">{activeGesture.token}</div>
                        <div className="text-[11px] text-slate-300 italic truncate">&ldquo;{activeGesture.english}&rdquo;</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-transform active:scale-90 shrink-0"
                        aria-label={isPlaying ? 'Pause gesture' : 'Play gesture'}
                      >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Bottom: Voice-to-Sign Audio wave readout */}
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Volume2 size={13} className="text-[#0757E8]" /> Natural Voice Input
                    </span>
                    <span className="text-[#0757E8] dark:text-[#12CFF3] font-semibold text-[11px]">
                      GLOSS: {activeGesture.gloss}
                    </span>
                  </div>

                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COMMUNITY & ECOSYSTEM STRIP                                            */}
      {/* ========================================================================= */}
      <section className="relative border-y border-black/5 dark:border-white/10 bg-white/60 dark:bg-[#050B14]/60 backdrop-blur-xl py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Mission Statement */}
            <div className="max-w-md shrink-0 space-y-1.5 text-left">
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3]">
                Community-Led Accessibility
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#1d1d1f] dark:text-white tracking-[-0.025em] leading-snug">
                Designed alongside Deaf educators, community advocates, and students across India.
              </h3>
            </div>

            {/* 4 Authentic Community Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full flex-1">
              
              {/* Students */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-[transform,background-color] duration-160 ease-apple hover:-translate-y-0.5">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                  <Image
                    src="/avatar-student.jpg"
                    alt="Students using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#1d1d1f] dark:text-white truncate">
                    Students & Youth
                  </div>
                  <p className="text-xs text-[#60759A] dark:text-slate-400 truncate">
                    Confidence in classrooms
                  </p>
                </div>
              </div>

              {/* Educators */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-[transform,background-color] duration-160 ease-apple hover:-translate-y-0.5">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                  <Image
                    src="/avatar-educator.jpg"
                    alt="Educators using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#1d1d1f] dark:text-white truncate">
                    Special Educators
                  </div>
                  <p className="text-xs text-[#60759A] dark:text-slate-400 truncate">
                    Inclusive curriculum aids
                  </p>
                </div>
              </div>

              {/* Families */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-[transform,background-color] duration-160 ease-apple hover:-translate-y-0.5">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                  <Image
                    src="/avatar-families.jpg"
                    alt="Families using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#1d1d1f] dark:text-white truncate">
                    Hearing Families
                  </div>
                  <p className="text-xs text-[#60759A] dark:text-slate-400 truncate">
                    Parent-child daily bonds
                  </p>
                </div>
              </div>

              {/* Communities */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-[transform,background-color] duration-160 ease-apple hover:-translate-y-0.5">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Communities using SignAction"
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-heading font-bold text-sm text-[#1d1d1f] dark:text-white truncate">
                    Public Spaces
                  </div>
                  <p className="text-xs text-[#60759A] dark:text-slate-400 truncate">
                    Clinics, transit & desks
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. APPLE BENTO GRID: System Architecture                                 */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Apple Section Header */}
          <div className="text-left max-w-3xl mb-14 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-md border border-black/5 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3]">
              Neural Pipeline Architecture
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-[-0.035em] text-[#1d1d1f] dark:text-white leading-[1.1]">
              Engineered from the silicon up.
            </h2>
            <p className="text-base sm:text-lg text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
              Four edge pipelines working in synchronized harmony. Natural speech in, verified continuous Indian Sign Language out.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Speech Ingestion (Span 6) */}
            <div className="lg:col-span-6 rounded-[28px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between text-left group hover:border-[#0757E8]/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 01
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Mic size={17} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl text-[#1d1d1f] dark:text-white tracking-tight">
                    On-Device Speech Ingestion
                  </h3>
                  <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                    Voice audio is captured at 16 kHz Mono and transcribed locally via Vosk WebAssembly and browser Web Speech APIs. No cloud audio packets are ever transmitted.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>AUDIO INGESTION</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">● 16 kHz PCM</span>
                  </div>
                  <div className="text-[#1d1d1f] dark:text-slate-200 font-sans font-medium truncate">
                    &ldquo;Namaste, how are you?&rdquo;
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-between">
                <span>0 KB Sent to Cloud</span>
                <span className="text-slate-400 font-normal">WebAssembly Edge STT</span>
              </div>
            </div>

            {/* Bento Card 2: Grammar Parsing (Span 6) */}
            <div className="lg:col-span-6 rounded-[28px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between text-left group hover:border-[#0757E8]/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 02
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Layers size={17} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl text-[#1d1d1f] dark:text-white tracking-tight">
                    ISL Syntactic Parser
                  </h3>
                  <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                    Transforms standard English Subject-Verb-Object into authentic Indian Sign Language Subject-Object-Verb grammar, pruning non-signing copula verbs.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>SOV SYNTAX REORDER</span>
                    <span className="text-[#0757E8] dark:text-[#12CFF3] font-bold">PARSED</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#0757E8]/10 text-[#0757E8] dark:text-[#12CFF3] font-bold text-[11px]">[YOU]</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0757E8]/10 text-[#0757E8] dark:text-[#12CFF3] font-bold text-[11px]">[NAME]</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0757E8]/10 text-[#0757E8] dark:text-[#12CFF3] font-bold text-[11px]">[WHAT]</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-between">
                <span>Deterministic Grammar Rules</span>
                <span className="text-slate-400 font-normal">&lt; 3ms Latency</span>
              </div>
            </div>

            {/* Bento Card 3: Lexicon Resolution (Span 6) */}
            <div className="lg:col-span-6 rounded-[28px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between text-left group hover:border-[#0757E8]/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 03
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <BookOpen size={17} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl text-[#1d1d1f] dark:text-white tracking-tight">
                    347-Token Native Lexicon
                  </h3>
                  <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                    Direct mapping into verified Indian Sign Language video gestures. Any unmapped vocabulary seamlessly falls back to smooth A–Z manual fingerspelling.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>GESTURE COVERAGE</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">347 VERIFIED SIGNS</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-sans truncate">
                    High-Definition Native Video Assets + Complete A–Z Speller
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-between">
                <span>NAD Standard Vocabulary</span>
                <span className="text-slate-400 font-normal">Offline Cached</span>
              </div>
            </div>

            {/* Bento Card 4: Hardware Playback (Span 6) */}
            <div className="lg:col-span-6 rounded-[28px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col justify-between text-left group hover:border-[#0757E8]/30 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                  <span className="font-mono text-xs font-bold text-[#0757E8] dark:text-[#12CFF3] tracking-wider uppercase">
                    Stage 04
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-center">
                    <Eye size={17} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-xl text-[#1d1d1f] dark:text-white tracking-tight">
                    60 FPS Kinematic Synthesis
                  </h3>
                  <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                    Chains continuous MP4 gesture streams with hardware acceleration. Includes interactive scrubbers, variable speed controls (0.5x–1.25x), and zero dropped frames.
                  </p>
                </div>

                {/* Technical Micro-Artifact */}
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>FRAME PIPELINE</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">60 FPS SYNCHRONIZED</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-sans truncate">
                    Composite-Only Hardware Acceleration · Sub-120ms Latency
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10 text-xs font-semibold text-[#0757E8] dark:text-[#12CFF3] flex items-center justify-between">
                <span>GPU Layer Accelerated</span>
                <span className="text-slate-400 font-normal">Zero Jitter</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EDITORIAL STORY: Linguistic Craft & Human Dignity                       */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 border-y border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          {/* Section Header */}
          <div className="text-left max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-md border border-black/5 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0757E8] dark:text-[#12CFF3]">
              Linguistic Craft
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-[-0.035em] text-[#1d1d1f] dark:text-white leading-[1.08]">
              Not literal word-swaps. <br />
              <span className="bg-gradient-to-r from-[#0757E8] to-[#12CFF3] bg-clip-text text-transparent">
                Real grammar.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
              Indian Sign Language is not English on hands. It has its own spatial syntax, facial morphology, and Subject-Object-Verb order. SignAction reconstructs sentence semantics so gestures feel native, not robotic.
            </p>
          </div>

          {/* Interactive Linguistic Syntax Playground */}
          <div className="rounded-[32px] sm:rounded-[36px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">
            
            {/* Top Bar: Sentence Switcher Tabs & Mode Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
              
              {/* Sample Sentences Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-x-auto no-scrollbar">
                {SYNTAX_CASES.map((sc) => {
                  const isActive = activeSyntaxCase.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setActiveSyntaxCase(sc)}
                      className={`relative px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors duration-160 active:scale-[0.97] ${
                        isActive
                          ? 'text-[#062B5C] dark:text-white font-bold'
                          : 'text-slate-500 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="syntax-active-pill"
                          className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-sm"
                          transition={{ type: 'spring', duration: 0.32, bounce: 0 }}
                        />
                      )}
                      <span className="relative z-10">{sc.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mode Toggle Pill */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                  {syntaxMode === 'english' ? 'English SVO Order' : 'ISL SOV Natural Order'}
                </span>
                <button
                  type="button"
                  onClick={() => setSyntaxMode(m => m === 'english' ? 'isl' : 'english')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#0757E8]/10 hover:bg-[#0757E8]/15 dark:bg-[#12CFF3]/10 dark:hover:bg-[#12CFF3]/15 text-[#0757E8] dark:text-[#12CFF3] border border-[#0757E8]/20 transition-[transform,background-color] duration-160 ease-apple active:scale-[0.97]"
                >
                  <ArrowLeftRight size={13} />
                  <span>{syntaxMode === 'english' ? 'Reorder into ISL Grammar' : 'Show English Word Order'}</span>
                </button>
              </div>

            </div>

            {/* Source Phrase Banner */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono px-1">
              <span className="text-sm font-heading font-bold text-[#1d1d1f] dark:text-white">
                Input: &ldquo;{activeSyntaxCase.englishPhrase}&rdquo;
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0757E8] dark:text-[#12CFF3] font-semibold text-[11px]">
                {activeSyntaxCase.linguisticTag}
              </span>
            </div>

            {/* Kinetic Token Stage */}
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 min-h-[140px] flex items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full">
                {syntaxMode === 'english' ? (
                  activeSyntaxCase.englishTokens.map((token, i) => (
                    <motion.div
                      key={token.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className={`relative flex flex-col items-center justify-center px-3.5 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border transition-all ${
                        token.isDropped
                          ? 'border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'
                          : 'border-black/10 dark:border-white/15 bg-white dark:bg-slate-900 shadow-sm text-[#1d1d1f] dark:text-white'
                      }`}
                    >
                      <span className="font-heading font-bold text-sm xs:text-base sm:text-lg">
                        {token.text}
                      </span>
                      <span className="text-[9px] xs:text-[10px] font-mono text-slate-400 pt-0.5 uppercase tracking-wider">
                        {token.role}
                      </span>
                      <span className="absolute -top-2 -right-1 text-[9px] font-mono font-bold px-1.5 py-0.2 bg-black/[0.06] dark:bg-white/10 rounded-full text-slate-500">
                        #{i + 1}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  activeSyntaxCase.islTokens.map((token, i) => (
                    <motion.div
                      key={token.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="relative flex flex-col items-center justify-center px-3.5 xs:px-5 sm:px-6 py-2.5 xs:py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white to-[#F4FAFF] dark:from-slate-800 dark:to-slate-900 border border-[#0757E8]/30 dark:border-[#12CFF3]/30 shadow-md text-[#0757E8] dark:text-[#12CFF3]"
                    >
                      <span className="font-mono font-black text-sm xs:text-base sm:text-xl tracking-wider">
                        [{token.text}]
                      </span>
                      <span className="text-[9px] xs:text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-0.5 uppercase tracking-wider">
                        {token.role}
                      </span>
                      <span className="absolute -top-2.5 -right-1.5 text-[9px] font-mono font-bold px-2 py-0.5 bg-[#0757E8] text-white rounded-full shadow-xs">
                        ISL #{i + 1}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Insight Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 text-xs text-[#60759A] dark:text-slate-300">
              <div className="flex items-start gap-2 max-w-2xl">
                <Sparkles size={15} className="text-[#0757E8] dark:text-[#12CFF3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold text-[#1d1d1f] dark:text-white">Grammar Rule: </span>
                  {activeSyntaxCase.ruleExplanation}
                </p>
              </div>

              <Link
                href="/translator"
                className="inline-flex items-center gap-1.5 font-semibold text-[#0757E8] dark:text-[#12CFF3] hover:underline shrink-0"
              >
                <span>Try custom sentence in Translator</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>

          {/* Documentary Field Study & Authentic Pillars (No Cliché 01/02/03 Number Boxes) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-4">
            
            {/* Left: Authentic Documentary Photo Plate */}
            <div className="lg:col-span-5">
              <div className="space-y-3">
                <div className="relative aspect-[4/3.2] w-full rounded-[24px] overflow-hidden border border-black/5 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Community consultation with Deaf signers and educators in Bengaluru"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
                    Field Study • Bengaluru
                  </div>
                </div>
                <p className="text-xs text-[#60759A] dark:text-slate-400 italic text-left">
                  Field documentation at the Deaf Community Center, Bengaluru. SignAction gestures are verified directly with native signers and bilingual educators.
                </p>
              </div>
            </div>

            {/* Right: Three Substantive Human Commitments */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-lg text-[#1d1d1f] dark:text-white">
                  Linguistic Sovereignty
                </h3>
                <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                  Indian Sign Language is an independent language with unique spatial markers and morphology. We adhere to standards recognized by the National Association of the Deaf (NAD) rather than forcing English grammar onto visual signs.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10">
                <h3 className="font-heading font-bold text-lg text-[#1d1d1f] dark:text-white">
                  Continuous Manual Fingerspelling
                </h3>
                <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                  No vocabulary gaps. For rare proper nouns, specialized medical terms, or personal names without a direct sign token, SignAction smoothly transitions into 60 FPS letter-by-letter fingerspelling.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10">
                <h3 className="font-heading font-bold text-lg text-[#1d1d1f] dark:text-white">
                  100% Free, Private, and Universal
                </h3>
                <p className="text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                  Communication is a fundamental right. No paywalls, no monthly subscription tiers, and no cloud surveillance. The entire 347-sign library and offline speech engine run locally on your hardware.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRIVACY: On-Device Privacy by Design                                   */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] backdrop-blur-md border border-black/5 dark:border-white/10 text-xs font-mono font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#12CFF3]">
              <ShieldCheck size={14} />
              <span>On-Device Privacy</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-[46px] tracking-[-0.035em] text-[#1d1d1f] dark:text-white leading-[1.1]">
              Privacy. At the very core.
            </h2>
            <p className="text-base sm:text-lg text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
              True accessibility requires trust. SignAction was built so that speech, transcriptions, and gestures never leave your device.
            </p>
          </div>

          {/* 3 Cupertino Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="rounded-[24px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-6 sm:p-8 md:p-6 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-left space-y-3">
              <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0757E8] dark:text-[#12CFF3] tracking-[-0.03em]">
                0 KB
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#1d1d1f] dark:text-white">
                Cloud Audio Uploads
              </h3>
              <p className="text-xs sm:text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                Voice audio is processed locally via Vosk WebAssembly. Zero audio recordings or transcriptions ever leave your computer or phone.
              </p>
            </div>

            <div className="rounded-[24px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-6 sm:p-8 md:p-6 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-left space-y-3">
              <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0757E8] dark:text-[#12CFF3] tracking-[-0.03em]">
                &lt; 120ms
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#1d1d1f] dark:text-white">
                Immediate Response
              </h3>
              <p className="text-xs sm:text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                By executing syntax parsing and token resolution locally on edge hardware, visual signs render smoothly without network delays.
              </p>
            </div>

            <div className="rounded-[24px] sm:rounded-[32px] bg-white/80 dark:bg-[#07132C]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 p-6 sm:p-8 md:p-6 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-left space-y-3">
              <div className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#0757E8] dark:text-[#12CFF3] tracking-[-0.03em]">
                100%
              </div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#1d1d1f] dark:text-white">
                Offline Autonomy
              </h3>
              <p className="text-xs sm:text-sm text-[#60759A] dark:text-slate-300 leading-relaxed font-normal">
                Turn on Airplane mode. Speech recognition and sign playback continue to operate smoothly without mobile data or Wi-Fi.
              </p>
            </div>

          </div>

          {/* Quick Offline CTA button */}
          <div className="mt-12 text-center">
            <Link
              href="/offline-setup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0757E8] dark:text-[#12CFF3] bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] backdrop-blur-md rounded-full px-6 py-3.5 border border-black/5 dark:border-white/10 transition-[transform,background-color] duration-160 ease-apple hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span>Setup Offline Mode for Web & Mobile</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DEDICATED NATIVE ANDROID MOBILE APP SECTION                            */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#F0F7FF] dark:from-[#050B14] dark:to-[#07132B] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#07132C] rounded-[28px] sm:rounded-[36px] p-5 sm:p-10 lg:p-16 border border-blue-200/80 dark:border-blue-900/60 shadow-[0_12px_40px_rgba(7,87,232,0.12)] overflow-hidden">
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
                  {isNative ? (
                    <Link
                      href="/translator"
                      className="inline-flex items-center gap-2.5 text-sm sm:text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full px-7 py-4 shadow-[0_6px_22px_rgba(7,87,232,0.32)] transition-[transform,background-color,box-shadow] duration-160 ease-apple active:scale-[0.97]"
                    >
                      <CheckCircle2 size={18} />
                      <span>Installed Offline • Open Translator</span>
                    </Link>
                  ) : (
                    <a
                      href={OFFICIAL_APK_DOWNLOAD_URL}
                      download="signaction.apk"
                      className="inline-flex items-center justify-center gap-2.5 text-sm sm:text-base font-semibold text-white bg-[#0757E8] hover:bg-[#064BD1] rounded-full px-6 sm:px-8 py-4 w-full sm:w-auto shadow-[0_6px_22px_rgba(7,87,232,0.32)] hover:shadow-[0_8px_26px_rgba(7,87,232,0.42)] transition-[transform,background-color,box-shadow] duration-160 ease-apple hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      <Download size={18} />
                      <span>Download Android APK ({OFFICIAL_APK_SIZE_LABEL})</span>
                    </a>
                  )}
                  <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
                    Supports Android 8.0+ • Free & Ad-free
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center px-2">
                {/* Authentic Phone Chassis — fluid max-w so 360px screens never overflow */}
                <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-[9/19.2] bg-gradient-to-b from-[#383A40] via-[#1D1E22] to-[#2E2F35] rounded-[46px] sm:rounded-[52px] p-[9px] sm:p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)_inset,0_0_35px_rgba(7,87,232,0.18)] ring-1 ring-slate-800">
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
                      {isNative ? (
                        <Link
                          href="/translator"
                          className="w-full py-3.5 rounded-full bg-[#0757E8] hover:bg-[#064BD1] text-white text-xs font-bold shadow-[0_4px_16px_rgba(7,87,232,0.35)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <ArrowRight size={15} />
                          <span>Launch Translator</span>
                        </Link>
                      ) : (
                        <a
                          href={OFFICIAL_APK_DOWNLOAD_URL}
                          download="signaction.apk"
                          className="w-full py-3.5 rounded-full bg-[#0757E8] hover:bg-[#064BD1] text-white text-xs font-bold shadow-[0_4px_16px_rgba(7,87,232,0.35)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <Download size={15} />
                          <span>Install on Phone</span>
                        </a>
                      )}

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
      <section className="py-16 sm:py-28 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#062B5C] to-[#0A192F] text-white p-6 sm:p-14 lg:p-16 text-center space-y-7 shadow-[0_20px_60px_rgba(6,43,92,0.18)] relative overflow-hidden">
            
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

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/translator"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#062B5C] bg-white hover:bg-slate-100 rounded-full px-7 sm:px-8 py-3.5 min-h-[48px] w-full sm:w-auto shadow-md transition-[transform,background-color] duration-160 ease-apple hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <span>Start Translating Now</span>
                <ArrowRight size={17} />
              </Link>

              {!isNative && (
                <a
                  href={OFFICIAL_APK_DOWNLOAD_URL}
                  download="signaction.apk"
                  className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-7 sm:px-8 py-3.5 min-h-[48px] w-full sm:w-auto transition-[transform,background-color,border-color] duration-160 ease-apple hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <Smartphone size={16} className="text-[#12CFF3]" />
                  <span>Download Android APK</span>
                </a>
              )}

              <Link
                href="/dictionary"
                className="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-slate-300 hover:text-white px-6 py-3.5 min-h-[48px] transition-colors"
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

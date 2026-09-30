'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Volume2,
  Mic,
  Eye,
  Languages,
  BookOpen,
  ShieldCheck,
  Smartphone,
  Download,
  Cpu,
  Layers,
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0F172A] dark:text-slate-100 selection:bg-[#0EA5E9]/20 selection:text-[#062B5C] transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Editorial Asymmetrical Composition                       */}
      {/* ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column: Expressive Editorial Copy & Refined CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#38BDF8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0757E8] dark:bg-[#38BDF8]" />
                <span>Indian Sign Language Synthesis</span>
              </div>

              {/* Expressive Editorial Headline */}
              <div className="space-y-3">
                <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-[54px] tracking-tight text-[#062B5C] dark:text-white leading-[1.12]">
                  Language is more <br className="hidden sm:inline" />
                  than <span className="text-[#0757E8] dark:text-[#38BDF8]">spoken words.</span>
                </h1>
                <p className="text-base sm:text-lg text-[#475569] dark:text-slate-300 leading-relaxed max-w-xl">
                  Convert spoken and written English into continuous Indian Sign Language gestures. Designed for natural, private, 100% on-device communication.
                </p>
              </div>

              {/* Refined Action Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/translator"
                  className="btn-sign-primary gap-2 text-sm sm:text-base px-7 py-3.5"
                >
                  <span>Start Translating</span>
                  <ArrowRight size={16} />
                </Link>

                <a
                  href={OFFICIAL_APK_DOWNLOAD_URL}
                  className="btn-sign-secondary gap-2 text-sm sm:text-base px-6 py-3.5"
                >
                  <Smartphone size={16} className="text-[#0757E8] dark:text-[#38BDF8]" />
                  <span>Download APK (145 MB)</span>
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white px-3 py-3 transition-colors"
                >
                  <Play size={13} className="fill-current text-[#0757E8] dark:text-[#38BDF8]" />
                  <span>How it works</span>
                </a>
              </div>

              {/* 3 Core Value Props with Hairline Dividers */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <div className="font-heading font-bold text-sm sm:text-base text-[#062B5C] dark:text-white">
                    100% Offline
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Zero network dependency
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
                  <div className="font-heading font-bold text-sm sm:text-base text-[#062B5C] dark:text-white">
                    SOV Grammar
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Linguistic gloss rules
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
                  <div className="font-heading font-bold text-sm sm:text-base text-[#062B5C] dark:text-white">
                    347 Gestures
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Verified video library
                  </p>
                </div>
              </div>

            </motion.div>

            {/* Right Column: Visual Composition with Real Demonstration Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[500px]">
                
                {/* Main Composition Card */}
                <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#07132C] border border-slate-200 dark:border-slate-800 shadow-md">
                  
                  {/* Portrait of Signer */}
                  <div className="relative aspect-[4/3.5] w-full bg-slate-100 dark:bg-slate-900">
                    <Image
                      src="/hero-signer.jpg"
                      alt="Communicator presenting an Indian Sign Language gesture"
                      fill
                      priority
                      className="object-cover object-top select-none"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>

                  {/* Bottom caption strip */}
                  <div className="p-4 bg-white dark:bg-[#07132C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center">
                        <Volume2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#062B5C] dark:text-white">
                          &ldquo;Hello, how can I help you today?&rdquo;
                        </p>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                          Spoken Audio Input → ISL Gloss
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F4F6F9] dark:bg-slate-800 text-[#0757E8] dark:text-[#38BDF8]">
                      HELLO
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COMMUNITY CONTEXT STRIP                                                */}
      {/* ========================================================================= */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#071124]/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="shrink-0 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              Designed for inclusive <br className="hidden lg:inline" />
              everyday communication
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto flex-1">
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src="/avatar-student.jpg"
                    alt="Students"
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-xs text-[#062B5C] dark:text-white truncate">
                    Students
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Classroom learning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src="/avatar-educator.jpg"
                    alt="Educators"
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-xs text-[#062B5C] dark:text-white truncate">
                    Educators
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Accessible curriculum
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src="/avatar-families.jpg"
                    alt="Families"
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-xs text-[#062B5C] dark:text-white truncate">
                    Families
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                    Direct conversation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src="/avatar-communities.jpg"
                    alt="Communities"
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-xs text-[#062B5C] dark:text-white truncate">
                    Public Spaces
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
      {/* 3. HOW IT WORKS: Architectural Pipeline                                   */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-xs font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#38BDF8]">
              System Architecture
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight">
              A structured translation pipeline.
            </h2>
            <p className="text-base text-[#475569] dark:text-slate-300">
              SignAction processes speech and text locally, transforming English grammatical structures into authentic sign sequences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="sign-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center mb-5">
                  <Mic size={20} />
                </div>
                <div className="text-xs font-mono font-bold text-[#0757E8] dark:text-[#38BDF8] uppercase tracking-wider mb-1">
                  01. Capture
                </div>
                <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white mb-2">
                  Voice & Text Input
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  Audio is processed locally through Vosk WebAssembly or entered directly as text without cloud transfers.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
                16kHz PCM transcription
              </div>
            </div>

            {/* Step 2 */}
            <div className="sign-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center mb-5">
                  <Languages size={20} />
                </div>
                <div className="text-xs font-mono font-bold text-[#0757E8] dark:text-[#38BDF8] uppercase tracking-wider mb-1">
                  02. Parse
                </div>
                <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white mb-2">
                  Linguistic Transformation
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  Linguistic rules reorder Subject-Verb-Object English syntax into Indian Sign Language SOV grammatical gloss.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
                SOV reordering & tokenization
              </div>
            </div>

            {/* Step 3 */}
            <div className="sign-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center mb-5">
                  <Layers size={20} />
                </div>
                <div className="text-xs font-mono font-bold text-[#0757E8] dark:text-[#38BDF8] uppercase tracking-wider mb-1">
                  03. Map
                </div>
                <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white mb-2">
                  Gesture Database
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  Tokens resolve to verified gesture video files. Unmapped words smoothly fall back to fingerspelling.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
                347 offline videos & alphabet
              </div>
            </div>

            {/* Step 4 */}
            <div className="sign-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center mb-5">
                  <Eye size={20} />
                </div>
                <div className="text-xs font-mono font-bold text-[#0757E8] dark:text-[#38BDF8] uppercase tracking-wider mb-1">
                  04. Render
                </div>
                <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white mb-2">
                  Continuous Stream
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  Consecutive gestures play with sub-second transitions and variable playback speed controls.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
                Seamless timeline playback
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE GESTURE SHOWCASE                                           */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-xs font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#38BDF8]">
              Interactive Demonstration
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight">
              Experience authentic signs in motion.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300">
              Select an everyday phrase to inspect how English maps into verified ISL video gestures.
            </p>
          </div>

          {/* Gesture Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {SAMPLE_GESTURES.map((gesture) => {
              const isSelected = activeGesture.token === gesture.token;
              return (
                <button
                  key={gesture.token}
                  onClick={() => setActiveGesture(gesture)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#0757E8] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#475569] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {gesture.token}
                </button>
              );
            })}
          </div>

          {/* Interactive Player Showcase */}
          <div className="max-w-3xl mx-auto sign-card p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left: Video */}
              <div className="md:col-span-7">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
                  <video
                    key={activeGesture.videoUrl}
                    src={activeGesture.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-white/90 dark:bg-slate-900/90 text-[10px] font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#38BDF8]">
                    {activeGesture.category}
                  </div>
                </div>
              </div>

              {/* Right: Structural Breakdown */}
              <div className="md:col-span-5 space-y-4 text-left">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1">
                    English Sentence
                  </span>
                  <div className="font-heading font-bold text-lg text-[#062B5C] dark:text-white">
                    &ldquo;{activeGesture.english}&rdquo;
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1">
                    ISL Grammatical Gloss
                  </span>
                  <div className="inline-block px-3 py-1 rounded bg-[#F4F6F9] dark:bg-slate-800 text-[#0757E8] dark:text-[#38BDF8] font-mono text-xs font-bold tracking-wider">
                    {activeGesture.gloss}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/translator?text=${encodeURIComponent(activeGesture.english)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0757E8] dark:text-[#38BDF8] hover:underline"
                  >
                    <span>Open in Full Translator</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRIVACY & ON-DEVICE SPECS                                              */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-xs font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#38BDF8]">
              <ShieldCheck size={13} />
              <span>Architectural Privacy</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight">
              Speech that remains on your device.
            </h2>
            <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300">
              Unlike cloud-hosted AI APIs, SignAction runs its neural speech recognition and gesture database locally on your hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            <div className="sign-card p-6 sm:p-8 space-y-2">
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0757E8] dark:text-[#38BDF8] tracking-tight">
                0 KB
              </div>
              <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                Audio Uploaded to Cloud
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                Microphone audio streams into on-device Vosk WebAssembly memory and is destroyed immediately after transcription.
              </p>
            </div>

            <div className="sign-card p-6 sm:p-8 space-y-2">
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0757E8] dark:text-[#38BDF8] tracking-tight">
                &lt; 120ms
              </div>
              <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                Local Synthesis Latency
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                By eliminating network roundtrips, gesture sequencing begins virtually instantaneously upon sentence completion.
              </p>
            </div>

            <div className="sign-card p-6 sm:p-8 space-y-2">
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0757E8] dark:text-[#38BDF8] tracking-tight">
                100%
              </div>
              <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                Offline Autonomy
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                Activate airplane mode. Both speech recognition and sign video playback operate without internet or cellular connectivity.
              </p>
            </div>

          </div>

          <div className="mt-10 text-center">
            <Link
              href="/offline-setup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0757E8] dark:text-[#38BDF8] hover:underline"
            >
              <span>View complete offline setup guide for web browsers</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. NATIVE ANDROID PACKAGE (APK) SPECIFICATION                             */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800 bg-[#F4F6F9] dark:bg-[#07132C]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sign-card p-8 sm:p-12 border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-8 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-xs font-bold uppercase tracking-wider text-[#0757E8] dark:text-[#38BDF8]">
                  <Smartphone size={13} />
                  <span>Standalone Mobile Distribution</span>
                </div>

                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight leading-tight">
                  SignAction for Android. <br />
                  <span className="text-[#0757E8] dark:text-[#38BDF8]">Installed once, ready anywhere.</span>
                </h2>

                <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 leading-relaxed">
                  Download the official Android APK. All 347 high-definition ISL gesture videos and offline speech recognition models are packaged directly inside the installer. No cloud connection or ongoing data consumption required.
                </p>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-mono text-xs text-[#64748B] dark:text-slate-400">Package Size</div>
                    <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white mt-0.5">145 MB</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-mono text-xs text-[#64748B] dark:text-slate-400">Compatibility</div>
                    <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white mt-0.5">Android 8.0+</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-mono text-xs text-[#64748B] dark:text-slate-400">License</div>
                    <div className="font-heading font-bold text-sm text-[#062B5C] dark:text-white mt-0.5">Free & Ad-Free</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={OFFICIAL_APK_DOWNLOAD_URL}
                    className="btn-sign-primary gap-2 text-sm px-6 py-3"
                  >
                    <Download size={15} />
                    <span>Download SignAction APK (145 MB)</span>
                  </a>
                  <span className="text-xs text-[#64748B] dark:text-slate-400">
                    Verified SHA256 build checksum
                  </span>
                </div>
              </div>

              {/* Right: Technical Device Card */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-full max-w-[280px] p-6 rounded-2xl bg-[#FAF9F6] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#0757E8] text-white flex items-center justify-center">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#062B5C] dark:text-white">
                      SignAction Native APK
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                      Build v1.0.4 · Production Release
                    </p>
                  </div>
                  <div className="py-2 border-y border-slate-200 dark:border-slate-800 text-xs text-[#475569] dark:text-slate-300 space-y-1 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vosk Neural STT:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Bundled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ISL Dictionary:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">347 Signs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network Required:</span>
                      <span className="font-semibold">None (0 KB)</span>
                    </div>
                  </div>
                  <a
                    href={OFFICIAL_APK_DOWNLOAD_URL}
                    className="w-full py-2.5 rounded-xl bg-[#0757E8] hover:bg-[#064BD1] text-white text-xs font-semibold block transition-colors"
                  >
                    Install on Device
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CLEAN CALL TO ACTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight">
            Ready to translate without boundaries?
          </h2>
          <p className="text-base text-[#475569] dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Begin converting speech and text into Indian Sign Language today. Open-access, private, and fully operable offline on web and mobile.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/translator"
              className="btn-sign-primary gap-2 text-sm px-7 py-3.5"
            >
              <span>Open Translator</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/dictionary"
              className="btn-sign-secondary gap-2 text-sm px-6 py-3.5"
            >
              <BookOpen size={15} />
              <span>Browse Dictionary</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}


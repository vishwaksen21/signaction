'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Server, Code, Mic, Layers, ArrowRight, Video, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-apple-surface-black py-20 px-4 sm:px-6 lg:px-8">

      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm mb-6 border border-blue-100 dark:border-blue-800/50">
            <Sparkles size={16} />
            About The Project
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
            Breaking down language <span className="text-blue-600 dark:text-blue-500">barriers</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            SignAction is an innovative web interface that translates text and speech into a beautiful, visual sign-language gesture stream.
          </p>
        </motion.div>
      </div>

      {/* Mission Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Heart size={200} />
        </div>
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 flex items-center justify-center">
            <Heart size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-4">Accessibility Impact</h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Our primary goal is to make communication more inclusive and accessible. By presenting a visual gesture sequence driven by real-time NLP, we aim to bridge the gap for the deaf and hard-of-hearing community, transforming spoken and written language into immediate visual representation.
          </p>
        </div>
      </motion.div>

      {/* How it Works Pipeline */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">How the Pipeline Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <Mic size={24} />,
              title: 'Speech to Text',
              desc: 'Vosk captures and transcribes live speech into raw text.'
            },
            {
              icon: <Code size={24} />,
              title: 'NLP Tokenization',
              desc: 'Rule-based processing turns text into a sequence of gloss tokens.'
            },
            {
              icon: <Layers size={24} />,
              title: 'Asset Mapping',
              desc: 'Tokens are matched to our extensive local gesture asset library.'
            },
            {
              icon: <Video size={24} />,
              title: 'Playback',
              desc: 'The Next.js UI fluidly plays the gesture sequences.'
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, delay: i * 0.15 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{step.desc}</p>

              {/* Connector Arrow (hidden on mobile and small tablets) */}
              {i < 3 && (
                <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 z-10">
                  <ArrowRight size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Research Paper CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 mb-20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Research Paper</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Read our IEEE-format research paper detailing the system architecture, NLP pipeline, AI fallback synthesis, and experimental evaluation.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Published as a conference paper. Covers gloss generation, asset resolution, fingerspelling, and skeletal animation synthesis.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <Server size={32} className="text-slate-600 dark:text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Powerful Technology</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
          Built on a robust Python FastAPI backend and a responsive Next.js frontend, ensuring blazing fast performance and real-time processing capabilities.
        </p>

        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:scale-105 transition-transform">
          Back to Home
          <ArrowRight size={18} />
        </Link>
      </motion.div>

    </div>
  );
}

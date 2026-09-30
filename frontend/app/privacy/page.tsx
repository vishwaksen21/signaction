import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Server, HardDrive } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - SignAction',
  description: 'SignAction privacy commitment: 100% on-device processing, zero telemetry, zero audio uploads.',
};

export default function PrivacyPage() {
  const lastUpdated = 'October 1, 2026';

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#050B14] text-[#0F172A] dark:text-slate-100 py-12 md:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0757E8] dark:text-[#38BDF8] hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-300 mb-4">
            <ShieldCheck size={14} />
            <span>Privacy By Architecture</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Highlight Card */}
        <div className="sign-card p-6 md:p-8 mb-10 bg-white dark:bg-[#07132C] border-blue-200/80 dark:border-blue-900/40">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0757E8] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#062B5C] dark:text-white mb-1">
                Zero Cloud Audio Storage
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
                SignAction was architected from inception as an offline-first system. Your voice recordings, text conversations, and generated gesture playback happen entirely on your client device. No speech audio is ever stored on or transmitted to external advertising or profiling servers.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-[#334155] dark:text-slate-300">
          
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              1. Information We Do Not Collect
            </h2>
            <p>
              Unlike conventional AI SaaS services, SignAction does not harvest personal information. Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#475569] dark:text-slate-300">
              <li><strong>No Voice Profiles:</strong> Spoken audio recorded through your microphone is fed into local Vosk WebAssembly or native models in memory and immediately discarded after transcription.</li>
              <li><strong>No Personal Identifiers:</strong> We do not ask for your name, phone number, email address, or social media logins.</li>
              <li><strong>No Telemetry or Keystroke Trackers:</strong> We do not track what you type or translate.</li>
              <li><strong>No Advertising Cookies:</strong> We do not sell data to data brokers or advertising networks.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              2. Device Permissions
            </h2>
            <p>
              SignAction requests standard browser and operating system permissions solely to deliver essential translation features:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#475569] dark:text-slate-300">
              <li><strong>Microphone (Optional):</strong> Required only when you trigger speech translation. Microphone input is active exclusively while the recording button is engaged.</li>
              <li><strong>Camera (Optional):</strong> Required only in the experimental live recognition workspace. Video frames are analyzed locally and never streamed to any remote server.</li>
              <li><strong>Storage (Local Cache):</strong> Used to store pre-packaged sign videos and offline models in CacheStorage / IndexedDB for offline access.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              3. Local Cache and Offline Storage
            </h2>
            <p>
              When you download the offline model or install the Android APK, assets are saved directly to your device storage. You retain total control: clearing your browser cache or uninstalling the app removes all stored models and assets permanently.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              4. Third-Party Integrations
            </h2>
            <p>
              SignAction uses Google Fonts served via CDN for typography and open-source models (Vosk) running locally. We do not embed third-party tracking scripts, analytics pixels, or advertisement widgets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              5. Children&rsquo;s Privacy
            </h2>
            <p>
              Because SignAction does not collect personal data from any user, it is fully compliant with children&rsquo;s educational safety standards. Students of all ages can practice Indian Sign Language without privacy exposure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              6. Policy Updates
            </h2>
            <p>
              Any updates to this Privacy Policy will be posted directly to this page with an updated revision date. As an open-source accessibility initiative, our architectural commitment to privacy-by-design will remain constant.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}

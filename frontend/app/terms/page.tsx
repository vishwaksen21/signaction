import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - SignAction',
  description: 'Terms of service and usage guidelines for SignAction offline sign language software.',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold tracking-wider uppercase text-[#0757E8] dark:text-[#38BDF8] mb-4">
            <FileText size={13} />
            <span>Legal Documentation</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#062B5C] dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-[#334155] dark:text-slate-300">
          
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using the SignAction website, Progressive Web Application (PWA), or native Android application (&ldquo;Software&rdquo;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Software.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              2. Purpose and Accessibility Intent
            </h2>
            <p>
              SignAction is an open-access assistive communication tool designed to facilitate bridge communication between spoken/written English and Indian Sign Language (ISL). The software converts speech and text into visual gesture sequences using on-device machine learning models and curated video dictionaries.
            </p>
            <p>
              While we strive for linguistic precision and grammatical fidelity following ISL rules, automated gesture synthesis cannot substitute for certified human sign language interpreters in critical medical, legal, or emergency scenarios.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              3. Permitted Use and License
            </h2>
            <p>
              SignAction is provided for personal, educational, research, and non-commercial community accessibility purposes. You are granted a personal, non-exclusive, non-transferable revocable license to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#475569] dark:text-slate-300">
              <li>Use the web and Android applications on your personal devices.</li>
              <li>Download pre-trained offline speech models and sign video dictionaries for personal offline accessibility.</li>
              <li>Utilize the dictionary and translation features for learning, classroom instruction, and community communication.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              4. Local Processing and Data Ownership
            </h2>
            <p>
              SignAction operates with an offline-first architecture. Any audio captured through your microphone or text entered into the translator is processed locally on your hardware. We do not claim ownership of any content or voice input you submit through the application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              5. Intellectual Property
            </h2>
            <p>
              All proprietary logos, application designs, software source code, and educational sign gesture compilations remain the intellectual property of the SignAction research project and its contributing authors, protected under applicable copyright and open-source licenses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. SIGNACTION DOES NOT GUARANTEE THAT THE APPLICATION WILL ALWAYS BE ERROR-FREE OR UNINTERRUPTED.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#062B5C] dark:text-white">
              7. Contact Information
            </h2>
            <p>
              For questions regarding these terms, research collaborations, or accessibility feedback, please reach out via our open GitHub repository or contact the project maintainers.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}

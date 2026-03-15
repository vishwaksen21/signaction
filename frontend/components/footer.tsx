'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/40 py-12 dark:bg-slate-950/40 dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">SignAction</p>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">Making communication accessible</p>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">© {currentYear} SignAction</p>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">Built with Next.js + FastAPI</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

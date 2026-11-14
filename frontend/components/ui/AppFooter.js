'use client';

import { usePathname } from 'next/navigation';

export default function AppFooter() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <footer className="border-t border-slate-200/60 bg-white px-4 py-6 text-slate-500">
      <div
        className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3
          text-center text-xs sm:flex-row sm:text-left"
      >
        <p>
          Empowered by{' '}
          <span className="font-display font-semibold text-slate-900">Tatarinet</span>
        </p>
        <div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1
            sm:justify-end"
        >
          <a
            className="transition-colors hover:text-slate-900"
            href="mailto:tatarinet@gmail.com"
          >
            tatarinet@gmail.com
          </a>
          <a
            className="transition-colors hover:text-slate-900"
            href="tel:0988222398"
          >
            0988222398
          </a>
        </div>
      </div>
    </footer>
  );
}

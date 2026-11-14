'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getUser } from '../../lib/auth';
import { useLanguage } from '../../lib/language';
import LanguageSelector from '../ui/LanguageSelector';

const links = [
  { href: '/cashier/sales', label: 'Register sale' },
  { href: '/cashier/history', label: 'My sales' },
  { href: '/cashier/inventory', label: 'Add new shoe' },
];

export default function CashierNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (getUser()?.role !== 'CASHIER') {
      router.replace('/');
    }
  }, [router]);

  function signOut() {
    clearSession();
    router.push('/login');
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 bg-white/90 text-slate-900
        shadow-[0_1px_10px_rgb(15_23_42_/_0.04)] backdrop-blur
        transition-colors duration-300 after:pointer-events-none after:absolute
        after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r
        after:from-transparent after:via-slate-300/60 after:to-transparent"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <button
            className="flex shrink-0 items-center gap-2.5 text-left"
            onClick={() => router.push('/cashier/sales')}
          >
            <span className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-950">
              Shoe Shop
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              aria-expanded={open}
              aria-label="Toggle cashier menu"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xl
                text-slate-700 transition hover:bg-slate-50 md:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? '×' : '☰'}
            </button>
            <LanguageSelector compact className="md:hidden" />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                onNavigate={() => router.push(link.href)}
              />
            ))}
            <button
              className="ml-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm
                font-medium text-slate-600 transition hover:bg-slate-100
                hover:text-slate-950"
              onClick={signOut}
            >
              {t('Sign out')}
            </button>
            <LanguageSelector className="ml-2" />
          </nav>
        </div>
      </div>

      {open && (
        <nav
          className="relative bg-white/90 px-4 py-3 md:hidden before:pointer-events-none
            before:absolute before:inset-x-0 before:top-0 before:h-px
            before:bg-gradient-to-r before:from-transparent before:via-slate-300/60
            before:to-transparent"
        >
          <div className="grid gap-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                onNavigate={() => {
                  setOpen(false);
                  router.push(link.href);
                }}
              />
            ))}
            <button
              className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm
                font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              onClick={signOut}
            >
              {t('Sign out')}
            </button>
            <LanguageSelector compact className="my-2" />
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ link, active, onNavigate }) {
  const { t } = useLanguage();

  return (
    <button
      className={`relative whitespace-nowrap rounded-lg border border-transparent px-3 py-2
        text-left text-sm transition-colors ${
          active
            ? 'font-semibold text-slate-950 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-slate-900'
            : 'font-medium text-slate-600 hover:text-slate-950'
        }`}
      onClick={onNavigate}
    >
      {t(link.label)}
    </button>
  );
}
